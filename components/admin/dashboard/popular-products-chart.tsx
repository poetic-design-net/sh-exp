"use client";

import { Card } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface PopularProduct {
  name: string;
  sales: number;
}

export default function PopularProductsChart({ data }: { data: PopularProduct[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-6">Beliebte Produkte</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
