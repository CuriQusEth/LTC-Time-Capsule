export interface CapsuleData {
  id: bigint;
  creator: string;
  title: string;
  contentHash: string;
  creationDate: bigint;
  unlockDate: bigint;
  isUnlocked: boolean;
  exists: boolean;
  nftTokenId: bigint;
}

export const formatAddress = (addr: string) => `${addr.slice(0,6)}...${addr.slice(-4)}`;
export const formatDate = (ts: bigint) => new Date(Number(ts) * 1000).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
export const isLocked = (c: CapsuleData) => !c.isUnlocked;
export const isReadyToUnlock = (c: CapsuleData) => !c.isUnlocked && Date.now() >= Number(c.unlockDate) * 1000;
