export interface HorizonEvent {
  contract_id?: string;
  contractId?: string;
  ledger_sequence?: number;
  ledgerSequence?: number;
  created_at?: string;
  createdAt?: string;
  transaction_hash?: string;
  transactionHash?: string;
  paging_token?: string;
  pagingToken?: string;
  topic_xdr?: string[] | string;
  value_xdr?: string;
  topics?: unknown[];
  topic?: unknown[];
  data?: unknown;
  value?: unknown;
}

export interface EventMetadata {
  contractId?: string;
  ledgerSequence?: number;
  createdAt?: string;
  transactionHash?: string;
  pagingToken?: string;
}

export interface EscrowCreated extends EventMetadata {
  kind: "EscrowCreated";
  escrowId: number;
  mentor: string;
  learner: string;
  amount: string;
  sessionId: string;
  tokenAddress: string;
  sessionEndTime: number;
}

export interface EscrowReleased extends EventMetadata {
  kind: "EscrowReleased";
  escrowId: number;
  mentor: string;
  amount: string;
  netAmount: string;
  platformFee: string;
  tokenAddress: string;
}

export interface EscrowPartialReleased extends EventMetadata {
  kind: "EscrowPartialReleased";
  escrowId: number;
  mentor: string;
  releasedAmount: string;
  netAmount: string;
  platformFee: string;
  tokenAddress: string;
  remainingAmount: string;
}

export interface EscrowAdminRelease extends EventMetadata {
  kind: "EscrowAdminRelease";
  escrowId: number;
  time: number;
}

export interface EscrowAutoReleased extends EventMetadata {
  kind: "EscrowAutoReleased";
  escrowId: number;
  time: number;
}

export interface DisputeOpened extends EventMetadata {
  kind: "DisputeOpened";
  escrowId: number;
  caller: string;
  reason: string;
  tokenAddress: string;
}

export interface DisputeResolved extends EventMetadata {
  kind: "DisputeResolved";
  escrowId: number;
  mentorPct: number;
  mentorAmount: string;
  learnerAmount: string;
  tokenAddress: string;
  time: number;
}

export interface EscrowRefunded extends EventMetadata {
  kind: "EscrowRefunded";
  escrowId: number;
  learner: string;
  amount: string;
  tokenAddress: string;
}

export interface ReviewSubmitted extends EventMetadata {
  kind: "ReviewSubmitted";
  escrowId: number;
  caller: string;
  reason: string;
  mentor: string;
}

export interface StakingRewardsDistributed extends EventMetadata {
  kind: "StakingRewardsDistributed";
  token: string;
  totalAmount: string;
  totalStaked: string;
}

export interface StakingRewardsClaimed extends EventMetadata {
  kind: "StakingRewardsClaimed";
  token: string;
  staker: string;
  amount: string;
}

export interface MentorVerified extends EventMetadata {
  kind: "MentorVerified";
  mentor: string;
  credentialHash: string;
  verifiedAt: number;
  expiry: number;
}

export interface VerificationRevoked extends EventMetadata {
  kind: "VerificationRevoked";
  mentor: string;
}

export interface ReferralRegistered extends EventMetadata {
  kind: "ReferralRegistered";
  referrer: string;
  referee: string;
  isMentor: boolean;
}

export interface ReferralRewardClaimed extends EventMetadata {
  kind: "ReferralRewardClaimed";
  referrer: string;
  amount: string;
}

export interface MintEvent extends EventMetadata {
  kind: "Mint";
  to: string;
  amount: string;
}

export interface BurnEvent extends EventMetadata {
  kind: "Burn";
  from: string;
  amount: string;
}

export interface ApproveEvent extends EventMetadata {
  kind: "Approve";
  from: string;
  spender: string;
  amount: string;
}

export interface TransferEvent extends EventMetadata {
  kind: "Transfer";
  from: string;
  to: string;
  amount: string;
}

export interface BuybackExecuted extends EventMetadata {
  kind: "BuybackExecuted";
  dexContract: string;
  usdcSpent: string;
  mntBurned: string;
  price: string;
}

export type ContractEvent =
  | EscrowCreated
  | EscrowReleased
  | EscrowPartialReleased
  | EscrowAdminRelease
  | EscrowAutoReleased
  | DisputeOpened
  | DisputeResolved
  | EscrowRefunded
  | ReviewSubmitted
  | StakingRewardsDistributed
  | StakingRewardsClaimed
  | MentorVerified
  | VerificationRevoked
  | ReferralRegistered
  | ReferralRewardClaimed
  | MintEvent
  | BurnEvent
  | ApproveEvent
  | TransferEvent
  | BuybackExecuted;

export const EVENT_TOPICS = {
  ESCROW_CREATED: ["Escrow", "Created"],
  ESCROW_CREATED_LEGACY: ["Escrow", "created"],
  ESCROW_RELEASED: ["Escrow", "released"],
  ESCROW_RELEASED_LEGACY: ["Escrow", "Released"],
  ESCROW_PARTIAL_RELEASED: ["Escrow", "rel_part"],
  ESCROW_ADMIN_RELEASE: ["Escrow", "adm_rel"],
  ESCROW_AUTO_RELEASED: ["Escrow", "AutoReleased"],
  ESCROW_AUTO_RELEASED_LEGACY: ["Escrow", "auto_rel"],
  DISPUTE_OPENED: ["Escrow", "DisputeOpened"],
  DISPUTE_OPENED_LEGACY: ["Escrow", "disp_opnd"],
  DISPUTE_RESOLVED: ["Escrow", "DisputeResolved"],
  DISPUTE_RESOLVED_LEGACY: ["Escrow", "disp_res"],
  ESCROW_REFUNDED: ["Escrow", "Refunded"],
  ESCROW_REFUNDED_LEGACY: ["Escrow", "refunded"],
  REVIEW_SUBMITTED: ["Escrow", "ReviewSubmitted"],
  REVIEW_SUBMITTED_LEGACY: ["Escrow", "review"],

  STAKING_REWARDS_DISTRIBUTED: ["reward"],
  STAKING_REWARDS_CLAIMED: ["claimed"],

  VERIFICATION_VERIFIED: ["Verification", "Verified"],
  VERIFICATION_REVOKED: ["Verification", "Revoked"],

  REFERRAL_REGISTERED: ["Referral", "Registered"],
  REFERRAL_REWARD_CLAIMED: ["Referral", "RewardClaimed"],

  MNT_MINT: ["MNTToken", "Mint"],
  MNT_BURN: ["MNTToken", "Burn"],
  MNT_APPROVE: ["MNTToken", "Approve"],
  MNT_TRANSFER: ["MNTToken", "Transfer"],

  TREASURY_BUYBACK_EXECUTED: ["buyback"],
} as const;
