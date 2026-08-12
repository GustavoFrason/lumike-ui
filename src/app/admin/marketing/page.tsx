'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Download } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  coupon_code: string;
  created_at: string;
}

export default function MarketingPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  function exportToCSV() {
    const headers = ['Data', 'Nome', 'Email', 'WhatsApp', 'Cupom'];
    const csvContent = [
      headers.join(','),
      ...leads.map((lead) =>
        [
          new Date(lead.created_at).toLocaleDateString(),
          `"${lead.name}"`,
          lead.email,
          lead.whatsapp,
          lead.coupon_code,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_lumilee_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data } = await api.get('/leads');
        setLeads(data || []);
      } catch (error) {
        console.error('Failed to fetch leads', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-deep-black">Marketing & Leads</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded shadow text-sm hover:bg-zinc-800 transition"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <div className="bg-white px-4 py-2 rounded shadow text-sm border">
            Total Leads: <strong>{leads.length}</strong>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Data</th>
              <th className="p-4 font-medium text-gray-600">Nome</th>
              <th className="p-4 font-medium text-gray-600">Email</th>
              <th className="p-4 font-medium text-gray-600">WhatsApp</th>
              <th className="p-4 font-medium text-gray-600">Cupom Gerado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 font-medium">{lead.name}</td>
                <td className="p-4 text-sm text-gray-600">{lead.email}</td>
                <td className="p-4 text-sm text-gray-600">{lead.whatsapp}</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-2">
                    {lead.coupon_code}
                  </span>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhum lead capturado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
