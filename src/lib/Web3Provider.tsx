import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Interface, formatEther } from 'ethers';
import { EIP6963ProviderDetail } from '../types/wallet';
import { initWalletDiscovery, subscribeToWallets } from './walletDiscovery';

// ─────────────────────────────────────────────────────────────────────────────
// ZERO-ETHERS-PROVIDER ARCHITECTURE
//
// ethers v6 BrowserProvider, JsonRpcProvider and WebSocketProvider ALL
// unconditionally call eth_blockNumber because:
//   1. send() -> _start() -> _detectNetwork() -> PollingBlockSubscriber
//   2. getBalance() / getNetwork() -> _start() chain
//   3. tx.wait() -> PollingTransactionSubscriber -> on('block') -> eth_blockNumber
//
// SOLUTION: Never use ANY ethers Provider for anything.
//   - READ  → raw fetch() eth_call
//   - WRITE → EIP-1193 wallet.request('eth_sendTransaction')
//   - WAIT  → raw fetch() eth_getTransactionReceipt loop (NOT eth_blockNumber)
//   - ABI   → ethers Interface encode/decode only (no provider attached)
// ─────────────────────────────────────────────────────────────────────────────

const RPC_URL = 'https://liteforge.rpc.caldera.xyz/http';
const CONTRACT_ADDRESS = '0x11C2B58d5cE395c9C9dADe8690295E17B192bd87';
const LITVM_CHAIN_ID_HEX = '0x1159';
const LITVM_CHAIN_ID_INT = 4441;

let _rpcId = 1;

async function rpcFetch(method: string, params: unknown[] = []): Promise<unknown> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: _rpcId++, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`RPC error ${json.error.code}: ${json.error.message}`);
  return json.result;
}

async function waitForReceipt(txHash: string, maxAttempts = 60, intervalMs = 3000): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await rpcFetch('eth_getTransactionReceipt', [txHash]) as any;
    if (receipt && receipt.blockNumber) return receipt;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Transaction not mined after timeout');
}

const CONTRACT_ABI = [
  'function createCapsule(string memory _title, string memory _contentHash, uint256 _unlockDate) external payable returns (uint256)',
  'function unlockCapsule(uint256 _capsuleId) external',
  'function getCapsule(uint256 _capsuleId) external view returns (tuple(uint256 id, address creator, string title, string contentHash, uint256 creationDate, uint256 unlockDate, bool isUnlocked, bool exists, uint256 nftTokenId))',
  'function getCapsulesByCreator(address _creator) external view returns (uint256[])',
  'function getTotalCapsules() external view returns (uint256)',
  'function canUnlock(uint256 _capsuleId) external view returns (bool)',
  'function getTimeUntilUnlock(uint256 _capsuleId) external view returns (uint256)',
  'function getAllCapsules(uint256 _offset, uint256 _limit) external view returns (tuple(uint256 id, address creator, string title, string contentHash, uint256 creationDate, uint256 unlockDate, bool isUnlocked, bool exists, uint256 nftTokenId)[])',
  'function CREATION_FEE() external view returns (uint256)',
];

const iface = new Interface(CONTRACT_ABI);

export interface TxResponse {
  hash: string;
  wait: () => Promise<any>;
}

export class RawContract {
  private _wallet: any = null;
  private _account: string | null = null;

  setWallet(wallet: any, account: string | null) {
    this._wallet = wallet;
    this._account = account;
  }

  clearWallet() {
    this._wallet = null;
    this._account = null;
  }

  private async _call(fragment: string, args: unknown[]): Promise<unknown> {
    const data = iface.encodeFunctionData(fragment, args);
    const result = await rpcFetch('eth_call', [{ to: CONTRACT_ADDRESS, data }, 'latest']);
    return iface.decodeFunctionResult(fragment, result as string);
  }

  async getTotalCapsules(): Promise<bigint> {
    return ((await this._call('getTotalCapsules', [])) as [bigint])[0];
  }

  async getAllCapsules(offset: number | bigint, limit: number | bigint): Promise<unknown[]> {
    return ((await this._call('getAllCapsules', [offset, limit])) as [unknown[]])[0];
  }

  async getCapsule(id: string | number | bigint): Promise<unknown> {
    return ((await this._call('getCapsule', [id])) as [unknown])[0];
  }

  async canUnlock(id: string | number | bigint): Promise<boolean> {
    return ((await this._call('canUnlock', [id])) as [boolean])[0];
  }

  async getCapsulesByCreator(address: string): Promise<bigint[]> {
    return ((await this._call('getCapsulesByCreator', [address])) as [bigint[]])[0];
  }

  async CREATION_FEE(): Promise<bigint> {
    return ((await this._call('CREATION_FEE', [])) as [bigint])[0];
  }

  async createCapsule(
    title: string,
    contentHash: string,
    unlockDate: bigint | number,
    opts?: { value?: bigint }
  ): Promise<TxResponse> {
    if (!this._wallet || !this._account) throw new Error('Wallet not connected');
    const data = iface.encodeFunctionData('createCapsule', [title, contentHash, unlockDate]);
    const value = opts?.value ? '0x' + opts.value.toString(16) : '0x0';
    const txHash = (await this._wallet.request({
      method: 'eth_sendTransaction',
      params: [{ from: this._account, to: CONTRACT_ADDRESS, data, value }],
    })) as string;
    return { hash: txHash, wait: () => waitForReceipt(txHash) };
  }

  async unlockCapsule(capsuleId: bigint | number): Promise<TxResponse> {
    if (!this._wallet || !this._account) throw new Error('Wallet not connected');
    const data = iface.encodeFunctionData('unlockCapsule', [capsuleId]);
    const txHash = (await this._wallet.request({
      method: 'eth_sendTransaction',
      params: [{ from: this._account, to: CONTRACT_ADDRESS, data, value: '0x0' }],
    })) as string;
    return { hash: txHash, wait: () => waitForReceipt(txHash) };
  }
}

interface Web3ContextType {
  account: string | null;
  contract: RawContract;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string | null;
  discoveredWallets: EIP6963ProviderDetail[];
  connectWallet: (walletInfo: EIP6963ProviderDetail) => Promise<void>;
  disconnectWallet: () => void;
  switchToLitVMNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};

const sharedContract = new RawContract();

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [rawProvider, setRawProvider] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [discoveredWallets, setDiscoveredWallets] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    initWalletDiscovery();
    return subscribeToWallets(setDiscoveredWallets);
  }, []);

  const checkNetwork = async (provider: any) => {
    try {
      const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;
      const ok = parseInt(chainIdHex, 16) === LITVM_CHAIN_ID_INT;
      setIsCorrectNetwork(ok);
      return ok;
    } catch {
      return false;
    }
  };

  const fetchBalance = async (addr: string) => {
    try {
      const hex = (await rpcFetch('eth_getBalance', [addr, 'latest'])) as string;
      setBalance(formatEther(BigInt(hex)));
    } catch { /* non-fatal */ }
  };

  const switchToLitVMNetwork = async () => {
    if (!rawProvider) return;
    try {
      await rawProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LITVM_CHAIN_ID_HEX }],
      });
      await checkNetwork(rawProvider);
    } catch (e: any) {
      if (e.code === 4902) {
        await rawProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: LITVM_CHAIN_ID_HEX,
            chainName: 'LitVM LiteForge',
            nativeCurrency: { name: 'zkLTC', symbol: 'zkLTC', decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: ['https://liteforge.explorer.caldera.xyz'],
          }],
        });
      }
    }
  };

  const initWallet = async (provider: any) => {
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    if (!accounts.length) return;
    const addr = accounts[0];
    sharedContract.setWallet(provider, addr);
    setAccount(addr);
    setRawProvider(provider);
    setIsConnected(true);
    await fetchBalance(addr);
    await checkNetwork(provider);
  };

  const connectWallet = async (walletInfo: EIP6963ProviderDetail) => {
    const sel = walletInfo.provider;
    if (!sel) { alert('Provider not found'); return; }
    try {
      try {
        await sel.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: LITVM_CHAIN_ID_HEX }],
        });
      } catch (e: any) {
        if (e.code === 4902) {
          await sel.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: LITVM_CHAIN_ID_HEX,
              chainName: 'LitVM LiteForge',
              nativeCurrency: { name: 'zkLTC', symbol: 'zkLTC', decimals: 18 },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: ['https://liteforge.explorer.caldera.xyz'],
            }],
          });
        }
      }
      await initWallet(sel);
    } catch (err) {
      console.error('Wallet connect error:', err);
      alert('Failed to connect wallet.');
    }
  };

  const disconnectWallet = () => {
    sharedContract.clearWallet();
    setAccount(null);
    setRawProvider(null);
    setBalance(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
  };

  useEffect(() => {
    if (!rawProvider) return;
    const onAccounts = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        sharedContract.setWallet(rawProvider, accounts[0]);
        fetchBalance(accounts[0]);
      } else {
        disconnectWallet();
      }
    };
    const onChain = () => window.location.reload();
    rawProvider.on?.('accountsChanged', onAccounts);
    rawProvider.on?.('chainChanged', onChain);
    rawProvider.on?.('disconnect', disconnectWallet);
    return () => {
      rawProvider.removeListener?.('accountsChanged', onAccounts);
      rawProvider.removeListener?.('chainChanged', onChain);
      rawProvider.removeListener?.('disconnect', disconnectWallet);
    };
  }, [rawProvider]);

  return (
    <Web3Context.Provider value={{
      account,
      contract: sharedContract,
      isConnected,
      isCorrectNetwork,
      balance,
      discoveredWallets,
      connectWallet,
      disconnectWallet,
      switchToLitVMNetwork,
    }}>
      {children}
    </Web3Context.Provider>
  );
};
