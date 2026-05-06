import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FunnelData {
  name: string;
  value: number;
}

export default function ConversionFunnel() {
  const { data: funnelData, isLoading } = trpc.dashboard.funnelData.useQuery();
  const [chartData, setChartData] = useState<FunnelData[]>([]);

  useEffect(() => {
    if (funnelData) {
      setChartData(funnelData);
    }
  }, [funnelData]);

  const colors = ["#0891b2", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading funnel...</div>;
  }

  if (!chartData || chartData.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData as any} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={80} />
        <Tooltip />
        <Bar dataKey="value" fill="#0891b2" radius={[0, 8, 8, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
