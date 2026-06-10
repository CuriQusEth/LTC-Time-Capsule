# LTC Time Capsule — Sealed Legacy Protocol

Secure your digital messages, predictions, and heritage on the LitVM LiteForge Blockchain with total trust and zero-knowledge durability. **LTC Time Capsule** utilizes advanced smart contract locking on a custom Layer-2 network, letting users deposit, time-lock, and securely broadcast digital media directly to the future.

---

## 🌌 The Concept (How the "Game" Works)

Think of LTC Time Capsule as a decentralized sandbox of historical records and hidden treasures. 

1. **Seal a Secret**: Write down a prediction, message to your future self, or a digital heritage letter.
2. **Choose Your Chrono**: Set a precise target time in the future (from 5 minutes up to 10 years).
3. **Immutably Forge**: Pay a micro-fee of `0.001 zkLTC` to mint your capsule as a unique on-chain cryptographic structure.
4. **Acquire the Time-Key**: Each capsule generates a custom NFT Token ID marking you as the owner and primary guardian of that timeline.
5. **Unlock & Broadcast**: When the countdown hits zero, trigger the smart contract to burn the lock, verify the signature, and reveal the decrypted contents to the public record!

---

## 🛠️ High-Performance Architecture

Standard Web3 clients (like Metamask or WalletConnect coupled with custom ethers wrappers) often flood the RPC server with aggressive `eth_blockNumber` polling requests, resulting in the dreaded `-32002` rate limit.

LTC Time Capsule is powered by a **Zero-Ethers-Provider (ZEP)** polling mechanism:
- **Raw Fetch Calls**: Queries are packed as standardized RPC payloads sent directly over HTTP to Caldera's LiteForge node.
- **Smart Queue & Throttling**: Queries are queued and paced with a minimum 500ms delay to keep within the boundaries of the testnet rate limits.
- **Wallet-Direct Transactions**: Cryptographic transactions bypass ethers' complex browser wrap and call EIP-1193's `eth_sendTransaction` directly via wallet interactions.

---

## 🌐 Network Configuration

To participate, configure your MetaMask or EIP-6963 compatible wallet with the following parameters:

- **Network Name**: `LitVM LiteForge`
- **RPC URL**: `https://liteforge.rpc.caldera.xyz/http`
- **Chain ID**: `4441` (Hex: `0x1159`)
- **Currency Symbol**: `zkLTC`
- **Block Explorer**: [Liteforge Explorer](https://liteforge.explorer.caldera.xyz)

### 📜 Smart Contract Coordinates
- **Contract Address**: `0x11C2B58d5cE395c9C9dADe8690295E17B192bd87`
- **Fee per Capsule**: `0.001 zkLTC` (used directly on-chain to forge the legacy blocks)

---

## 🎨 Visual Aesthetics & Layout

Our design adopts the **Sophisticated Dark** aesthetic:
- **Palette**: Pitch black (`#080809`), deep luxurious slate accents, paired with a warm, glowing medieval gold (`#c4a67e`).
- **Typography**: Paired serif italic font elements (*Cormorant Garamond*) for a classical historical vault feeling, structured with technical mono values (*JetBrains Mono*) for blockchain hashes and hexadecimal data.
- **Interactive States**: Clean, glassmorphic headers, card hover scale effects, and absolute radial backdrops that transition gracefully according to the capsule's lock status.
