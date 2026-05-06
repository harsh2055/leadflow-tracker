# LeadFlow Tracker - Project TODO

## Database & Backend
- [x] Create leads table schema with status, rep, source, activity log, and timestamps
- [x] Create activity_logs table for lead activity tracking
- [x] Create sales_reps table for rep management
- [x] Add database query helpers in server/db.ts
- [x] Create tRPC procedures for leads CRUD operations
- [x] Create tRPC procedures for activity log operations
- [x] Create tRPC procedures for rep assignment

## UI Components & Pages
- [x] Configure color scheme (teal, charcoal, neon mint) in index.css
- [x] Build DashboardLayout with sidebar navigation (using template)
- [x] Build metric cards component (total leads, new leads, conversion rate, revenue pipeline)
- [x] Build leads table component with sortable columns
- [x] Build lead detail drawer with editable fields
- [x] Build activity log timeline component
- [x] Build conversion funnel chart with Recharts
- [x] Build add/edit lead form
- [x] Build rep assignment management UI
- [x] Build footer with integrations section
- [x] Build dashboard page with all components

## Features
- [x] Implement lead table sorting and filtering
- [x] Implement lead detail drawer open/close functionality
- [x] Implement editable fields in lead detail drawer
- [x] Implement activity log display and scrolling
- [x] Implement conversion funnel data visualization
- [x] Implement add lead form submission
- [x] Implement edit lead form submission
- [x] Implement rep assignment from detail drawer
- [x] Implement status tag color-coding (New, Contacted, Qualified, Closed, Lost)

## Testing
- [x] Verify all UI components render correctly
- [x] Write vitest tests for lead CRUD procedures
- [x] Write vitest tests for activity log procedures
- [ ] Execute database migration (requires Management UI)
- [ ] Run tests after database setup

## Deployment
- [x] Save checkpoint with all features
- [ ] Execute database migration in Management UI
- [ ] Verify responsive design after DB setup
