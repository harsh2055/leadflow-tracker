import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, InsertLead, Lead, salesReps, InsertSalesRep, SalesRep, activityLogs, InsertActivityLog, ActivityLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ LEADS QUERIES ============

export async function getAllLeads(): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLead(lead: InsertLead): Promise<Lead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leads).values(lead);
  const insertId = (result as any).insertId;
  const newLead = await getLeadById(Number(insertId));
  if (!newLead) throw new Error("Failed to create lead");
  return newLead;
}

export async function updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(leads).set(updates).where(eq(leads.id, id));
  const updated = await getLeadById(id);
  if (!updated) throw new Error("Failed to update lead");
  return updated;
}

export async function deleteLead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(leads).where(eq(leads.id, id));
}

export async function getLeadsByStatus(status: string): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.status as any, status));
}

export async function getLeadsByAssignedRep(repId: number): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.assignedRepId, repId));
}

// ============ SALES REPS QUERIES ============

export async function getAllSalesReps(): Promise<SalesRep[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesReps).where(eq(salesReps.status, "active"));
}

export async function getSalesRepById(id: number): Promise<SalesRep | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(salesReps).where(eq(salesReps.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSalesRep(rep: InsertSalesRep): Promise<SalesRep> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(salesReps).values(rep);
  const insertId = (result as any).insertId;
  const newRep = await getSalesRepById(Number(insertId));
  if (!newRep) throw new Error("Failed to create sales rep");
  return newRep;
}

export async function updateSalesRep(id: number, updates: Partial<InsertSalesRep>): Promise<SalesRep> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(salesReps).set(updates).where(eq(salesReps.id, id));
  const updated = await getSalesRepById(id);
  if (!updated) throw new Error("Failed to update sales rep");
  return updated;
}

// ============ ACTIVITY LOG QUERIES ============

export async function getActivityLogsByLeadId(leadId: number): Promise<ActivityLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).where(eq(activityLogs.leadId, leadId)).orderBy(desc(activityLogs.createdAt));
}

export async function createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(activityLogs).values(log);
  const insertId = (result as any).insertId;
  const newLog = await db.select().from(activityLogs).where(eq(activityLogs.id, Number(insertId))).limit(1);
  if (!newLog || newLog.length === 0) throw new Error("Failed to create activity log");
  return newLog[0];
}

// ============ DASHBOARD METRICS ============

export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return { totalLeads: 0, newLeads: 0, conversionRate: 0, revenuePipeline: 0 };

  const allLeads = await db.select().from(leads);
  const newLeads = await db.select().from(leads).where(eq(leads.status as any, "new"));
  const closedLeads = await db.select().from(leads).where(eq(leads.status as any, "closed"));
  
  const totalLeads = allLeads.length;
  const newLeadsCount = newLeads.length;
  const conversionRate = totalLeads > 0 ? ((closedLeads.length / totalLeads) * 100).toFixed(1) : "0";
  const revenuePipeline = allLeads.reduce((sum, lead) => sum + (Number(lead.revenuePipeline) || 0), 0);

  return {
    totalLeads,
    newLeads: newLeadsCount,
    conversionRate: parseFloat(conversionRate as string),
    revenuePipeline,
  };
}

// ============ FUNNEL DATA ============

export async function getFunnelData() {
  const db = await getDb();
  if (!db) return [];

  const statuses = ["new", "contacted", "qualified", "closed", "lost"];
  const funnelData = [];

  for (const status of statuses) {
    const count = await db.select().from(leads).where(eq(leads.status as any, status));
    funnelData.push({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count.length,
    });
  }

  return funnelData;
}
