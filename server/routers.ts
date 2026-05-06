import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadsByStatus,
  getLeadsByAssignedRep,
  getAllSalesReps,
  getSalesRepById,
  createSalesRep,
  updateSalesRep,
  getActivityLogsByLeadId,
  createActivityLog,
  getDashboardMetrics,
  getFunnelData,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ LEADS PROCEDURES ============
  leads: router({
    list: protectedProcedure.query(async () => {
      return await getAllLeads();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getLeadById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          phone: z.string().nullable().optional(),
          company: z.string(),
          title: z.string().nullable().optional(),
          source: z.enum(["website", "email", "referral", "social", "event", "other"]).default("other"),
          status: z.enum(["new", "contacted", "qualified", "closed", "lost"]).default("new"),
          assignedRepId: z.number().optional(),
          revenuePipeline: z.string().optional(),
          notes: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createLead({
          ...input,
          revenuePipeline: input.revenuePipeline ? parseFloat(input.revenuePipeline) : 0,
        } as any);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().nullable().optional(),
          company: z.string().optional(),
          title: z.string().nullable().optional(),
          source: z.enum(["website", "email", "referral", "social", "event", "other"]).optional(),
          status: z.enum(["new", "contacted", "qualified", "closed", "lost"]).optional(),
          assignedRepId: z.number().nullable().optional(),
          revenuePipeline: z.string().optional(),
          notes: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const processedUpdates: any = { ...updates };
        if (updates.revenuePipeline) {
          processedUpdates.revenuePipeline = parseFloat(updates.revenuePipeline);
        }
        if (updates.assignedRepId === null) {
          processedUpdates.assignedRepId = null;
        }
        return await updateLead(id, processedUpdates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLead(input.id);
        return { success: true };
      }),

    getByStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return await getLeadsByStatus(input.status);
      }),

    getByAssignedRep: protectedProcedure
      .input(z.object({ repId: z.number() }))
      .query(async ({ input }) => {
        return await getLeadsByAssignedRep(input.repId);
      }),
  }),

  // ============ SALES REPS PROCEDURES ============
  salesReps: router({
    list: protectedProcedure.query(async () => {
      return await getAllSalesReps();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getSalesRepById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          status: z.enum(["active", "inactive"]).default("active"),
        })
      )
      .mutation(async ({ input }) => {
        return await createSalesRep(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          status: z.enum(["active", "inactive"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await updateSalesRep(id, updates);
      }),
  }),

  // ============ ACTIVITY LOG PROCEDURES ============
  activityLogs: router({
    getByLeadId: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        return await getActivityLogsByLeadId(input.leadId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          leadId: z.number(),
          type: z.enum(["call", "email", "meeting", "note", "status_change", "assignment"]),
          title: z.string(),
          description: z.string().optional(),
          createdBy: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createActivityLog({
          ...input,
          createdBy: input.createdBy || ctx.user?.name || "System",
        });
      }),
  }),

  // ============ DASHBOARD PROCEDURES ============
  dashboard: router({
    metrics: protectedProcedure.query(async () => {
      return await getDashboardMetrics();
    }),

    funnelData: protectedProcedure.query(async () => {
      return await getFunnelData();
    }),
  }),
});

export type AppRouter = typeof appRouter;
