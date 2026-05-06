import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Users, Target, DollarSign } from "lucide-react";
import LeadTable from "@/components/LeadTable";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import ConversionFunnel from "@/components/ConversionFunnel";
import AddLeadDialog from "@/components/AddLeadDialog";
import type { Lead } from "@/types";

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = trpc.leads.list.useQuery();

  const handleLeadClick = (lead: any) => {
    const castLead: Lead = {
      ...lead,
      revenuePipeline: typeof lead.revenuePipeline === 'string' ? parseFloat(lead.revenuePipeline) : (lead.revenuePipeline || 0),
    };
    setSelectedLead(castLead);
    setIsDrawerOpen(true);
  };

  const handleAddLeadSuccess = () => {
    setIsAddDialogOpen(false);
    refetchLeads();
  };

  const handleLeadUpdate = () => {
    refetchLeads();
    if (selectedLead) {
      const updated = leads?.find(l => l.id === selectedLead.id);
      if (updated) {
        const castLead: Lead = {
          ...updated,
          revenuePipeline: typeof updated.revenuePipeline === 'string' ? parseFloat(updated.revenuePipeline) : (updated.revenuePipeline || 0),
        };
        setSelectedLead(castLead);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">LeadFlow Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your sales pipeline and track lead progress</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {metricsLoading ? "—" : metrics?.totalLeads || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All leads in pipeline</p>
          </CardContent>
        </Card>

        {/* New Leads */}
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              New Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {metricsLoading ? "—" : metrics?.newLeads || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Added this period</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {metricsLoading ? "—" : `${metrics?.conversionRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Closed deals</p>
          </CardContent>
        </Card>

        {/* Revenue Pipeline */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {metricsLoading ? "—" : `$${(metrics?.revenuePipeline || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total potential revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Leads Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
              ) : leads && leads.length > 0 ? (
                <LeadTable leads={leads.map(l => ({
                  ...l,
                  revenuePipeline: typeof l.revenuePipeline === 'string' ? parseFloat(l.revenuePipeline) : (l.revenuePipeline || 0),
                })) as Lead[]} onLeadClick={handleLeadClick} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leads yet. <button onClick={() => setIsAddDialogOpen(true)} className="text-primary hover:underline">Add your first lead</button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversionFunnel />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {/* Add Lead Dialog */}
      <AddLeadDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddLeadSuccess}
      />
    </div>
  );
}
