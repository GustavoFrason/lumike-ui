'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface RevenueChartProps {
    data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        }),
    }));

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="formattedDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        formatter={(value: any) => value !== undefined ? [formatCurrency(Number(value)), 'Faturamento'] : null}
                        labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--lumike-gold)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--lumike-gold)', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
