import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import type { Lead, ActivityLog } from "@/types";

interface LeadDetailDrawerProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusColors: Record<Lead["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  qualified: "bg-yellow-100 text-yellow-800",
  closed: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

export default function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onUpdate,
}: LeadDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(lead);

  const { data: activityLogs } = trpc.activityLogs.getByLeadId.useQuery({
    leadId: lead.id,
  });
  const { data: salesReps } = trpc.salesReps.list.useQuery();
  const updateLeadMutation = trpc.leads.update.useMutation();
  const createActivityMutation = trpc.activityLogs.create.useMutation();

  useEffect(() => {
    setFormData(lead);
  }, [lead]);

  const handleSave = async () => {
    try {
      const { id, ...leadDataWithoutId } = formData;
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        ...leadDataWithoutId,
        revenuePipeline: formData.revenuePipeline.toString(),
      } as any);

      if (formData.status !== lead.status) {
        await createActivityMutation.mutateAsync({
          leadId: lead.id,
          type: "status_change",
          title: `Status changed to ${formData.status}`,
          description: `Lead status updated from ${lead.status} to ${formData.status}`,
        });
      }

      toast.success("Lead updated successfully");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update lead");
    }
  };

  const handleRepAssignment = async (repId: number | null) => {
    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        assignedRepId: repId,
      } as any);

      const rep = salesReps?.find(r => r.id === repId);
      await createActivityMutation.mutateAsync({
        leadId: lead.id,
        type: "assignment",
        title: `Assigned to ${rep?.name || "Unassigned"}`,
        description: `Lead assigned to sales rep: ${rep?.name || "Unassigned"}`,
      });

      toast.success("Rep assignment updated");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update rep assignment");
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {formData.firstName} {formData.lastName}
          </SheetTitle>
          <SheetDescription>{formData.company}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm text-foreground">{formData.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="text-sm text-foreground">{formData.phone || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="text-sm text-foreground">{formData.title || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Source</Label>
                    <p className="text-sm text-foreground capitalize">{formData.source}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge className={`${statusColors[formData.status]} border-0 mt-1`}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Revenue Pipeline</Label>
                    <p className="text-sm text-foreground">${formData.revenuePipeline.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Assigned Rep</Label>
                  <Select
                    value={formData.assignedRepId?.toString() || "unassigned"}
                    onValueChange={(value) => {
                      handleRepAssignment(value === "unassigned" ? null : parseInt(value));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a rep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {salesReps?.map((rep) => (
                        <SelectItem key={rep.id} value={rep.id.toString()}>
                          {rep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm text-foreground mt-1">{formData.notes || "—"}</p>
                </div>

                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Edit Lead
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value || null })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value || null })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as Lead["status"],
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          source: value as Lead["source"],
                        })
                      }
                    >
                      <SelectTrigger id="source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="revenue">Revenue Pipeline</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={formData.revenuePipeline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          revenuePipeline: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value || null })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(lead);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {activityLogs && activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{log.title}</p>
                          {log.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {log.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No activity yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
