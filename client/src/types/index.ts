export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string;
  title: string | null;
  source: "website" | "email" | "referral" | "social" | "event" | "other";
  status: "new" | "contacted" | "qualified" | "closed" | "lost";
  assignedRepId: number | null;
  revenuePipeline: number;
  notes: string | null;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesRep {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: number;
  leadId: number;
  type: "call" | "email" | "meeting" | "note" | "status_change" | "assignment";
  title: string;
  description: string | null;
  createdBy: string | null;
  createdAt: Date;
}
