import { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail } from '../types/wallet';

let providers: EIP6963ProviderDetail[] = [];
let listeners: ((providers: EIP6963ProviderDetail[]) => void)[] = [];

export const getDiscoveredWallets = () => providers;

export const subscribeToWallets = (callback: (providers: EIP6963ProviderDetail[]) => void) => {
  listeners.push(callback);
  callback(providers);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

const onAnnounceProvider = (event: EIP6963AnnounceProviderEvent) => {
  if (!providers.some((p) => p.info.uuid === event.detail.info.uuid)) {
    providers = [...providers, event.detail];
    listeners.forEach((l) => l(providers));
  }
};

let isInit = false;
export const initWalletDiscovery = () => {
  if (typeof window !== 'undefined' && !isInit) {
    window.addEventListener('eip6963:announceProvider', onAnnounceProvider as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    isInit = true;
  }
};
