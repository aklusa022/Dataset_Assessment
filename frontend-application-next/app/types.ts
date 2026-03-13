export type Status = "Approved" | "NeedsReview" | "Rejected";

export interface Dataset {
  id: string;
  name: string;
  domain: string;
  owner: string;
  qualityScore: number;
  status: Status;
}

export const DOMAINS = ["Sales", "HR", "Finance", "Marketing", "Engineering"] as const;
export const STATUSES: Status[] = ["Approved", "NeedsReview", "Rejected"];
