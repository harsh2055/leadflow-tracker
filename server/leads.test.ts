import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("leads procedures", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a lead", async () => {
    const result = await caller.leads.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      company: "Acme Corp",
      phone: "+1 (555) 000-0000",
      title: "Sales Manager",
      source: "website",
      status: "new",
      revenuePipeline: "50000",
      notes: "Test lead",
    });

    expect(result).toBeDefined();
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.company).toBe("Acme Corp");
    expect(result.status).toBe("new");
  });

  it("should list all leads", async () => {
    // Create a test lead first
    await caller.leads.create({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      company: "Tech Corp",
      source: "email",
      status: "contacted",
      revenuePipeline: "75000",
    });

    const leads = await caller.leads.list();
    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBeGreaterThan(0);
  });

  it("should get a lead by id", async () => {
    const created = await caller.leads.create({
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob@example.com",
      company: "Innovation Inc",
      source: "referral",
      status: "qualified",
      revenuePipeline: "100000",
    });

    const retrieved = await caller.leads.getById({ id: created.id });
    expect(retrieved).toBeDefined();
    expect(retrieved?.firstName).toBe("Bob");
    expect(retrieved?.email).toBe("bob@example.com");
  });

  it("should update a lead", async () => {
    const created = await caller.leads.create({
      firstName: "Alice",
      lastName: "Williams",
      email: "alice@example.com",
      company: "StartUp Ltd",
      source: "social",
      status: "new",
      revenuePipeline: "25000",
    });

    const updated = await caller.leads.update({
      id: created.id,
      status: "contacted",
      revenuePipeline: "35000",
    });

    expect(updated.status).toBe("contacted");
    expect(updated.revenuePipeline).toBe(35000);
  });

  it("should get leads by status", async () => {
    await caller.leads.create({
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie@example.com",
      company: "Enterprise Co",
      source: "event",
      status: "closed",
      revenuePipeline: "150000",
    });

    const closedLeads = await caller.leads.getByStatus({ status: "closed" });
    expect(Array.isArray(closedLeads)).toBe(true);
  });

  it("should delete a lead", async () => {
    const created = await caller.leads.create({
      firstName: "Diana",
      lastName: "Prince",
      email: "diana@example.com",
      company: "Wonder Corp",
      source: "website",
      status: "lost",
      revenuePipeline: "0",
    });

    const result = await caller.leads.delete({ id: created.id });
    expect(result.success).toBe(true);
  });
});

describe("dashboard procedures", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should get dashboard metrics", async () => {
    const metrics = await caller.dashboard.metrics();
    
    expect(metrics).toBeDefined();
    expect(typeof metrics.totalLeads).toBe("number");
    expect(typeof metrics.newLeads).toBe("number");
    expect(typeof metrics.conversionRate).toBe("number");
    expect(typeof metrics.revenuePipeline).toBe("number");
  });

  it("should get funnel data", async () => {
    const funnelData = await caller.dashboard.funnelData();
    
    expect(Array.isArray(funnelData)).toBe(true);
    expect(funnelData.length).toBeGreaterThan(0);
    
    // Check that all expected statuses are present
    const statuses = funnelData.map(d => d.name.toLowerCase());
    expect(statuses).toContain("new");
    expect(statuses).toContain("contacted");
    expect(statuses).toContain("qualified");
  });
});

describe("activity log procedures", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testLeadId: number;

  beforeEach(async () => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
    
    // Create a test lead
    const lead = await caller.leads.create({
      firstName: "Test",
      lastName: "Lead",
      email: "test@example.com",
      company: "Test Corp",
      source: "website",
      status: "new",
      revenuePipeline: "0",
    });
    testLeadId = lead.id;
  });

  it("should create an activity log entry", async () => {
    const activity = await caller.activityLogs.create({
      leadId: testLeadId,
      type: "call",
      title: "Initial call",
      description: "Discussed project requirements",
      createdBy: "Test User",
    });

    expect(activity).toBeDefined();
    expect(activity.leadId).toBe(testLeadId);
    expect(activity.type).toBe("call");
    expect(activity.title).toBe("Initial call");
  });

  it("should get activity logs for a lead", async () => {
    await caller.activityLogs.create({
      leadId: testLeadId,
      type: "email",
      title: "Follow-up email",
      description: "Sent proposal",
    });

    const logs = await caller.activityLogs.getByLeadId({ leadId: testLeadId });
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
  });

  it("should create status change activity log", async () => {
    await caller.leads.update({
      id: testLeadId,
      status: "contacted",
    });

    const logs = await caller.activityLogs.getByLeadId({ leadId: testLeadId });
    const statusChangeLog = logs.find(l => l.type === "status_change");
    expect(statusChangeLog).toBeDefined();
  });
});
