import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types";

interface LeadTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

type SortField = "firstName" | "company" | "status" | "source" | "lastActivityAt";
type SortOrder = "asc" | "desc";

const statusColors: Record<Lead["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  qualified: "bg-yellow-100 text-yellow-800",
  closed: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const sourceColors: Record<Lead["source"], string> = {
  website: "bg-slate-100 text-slate-800",
  email: "bg-cyan-100 text-cyan-800",
  referral: "bg-orange-100 text-orange-800",
  social: "bg-pink-100 text-pink-800",
  event: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800",
};

export default function LeadTable({ leads, onLeadClick }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>("lastActivityAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (aVal === null || aVal === undefined) aVal = "";
    if (bVal === null || bVal === undefined) bVal = "";

    if (sortField === "lastActivityAt" || sortField === "firstName") {
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <button
                onClick={() => handleSort("firstName")}
                className="flex items-center gap-2 hover:text-primary"
              >
                Name
                <SortIcon field="firstName" />
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <button
                onClick={() => handleSort("company")}
                className="flex items-center gap-2 hover:text-primary"
              >
                Company
                <SortIcon field="company" />
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <button
                onClick={() => handleSort("status")}
                className="flex items-center gap-2 hover:text-primary"
              >
                Status
                <SortIcon field="status" />
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <button
                onClick={() => handleSort("source")}
                className="flex items-center gap-2 hover:text-primary"
              >
                Source
                <SortIcon field="source" />
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">
              <button
                onClick={() => handleSort("lastActivityAt")}
                className="flex items-center gap-2 hover:text-primary"
              >
                Last Activity
                <SortIcon field="lastActivityAt" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 text-foreground font-medium">
                {lead.firstName} {lead.lastName}
              </td>
              <td className="py-3 px-4 text-foreground">{lead.company}</td>
              <td className="py-3 px-4">
                <Badge className={`${statusColors[lead.status]} border-0`}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge className={`${sourceColors[lead.source]} border-0`}>
                  {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
                </Badge>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {formatDate(lead.lastActivityAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
