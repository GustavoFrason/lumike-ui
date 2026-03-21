'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface Transaction {
  date: string;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  amount: number;
  reference_id: number;
  running_balance: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface StatementData {
  customer: Customer;
  transactions: Transaction[];
  current_balance: number;
}

export default function CustomerStatementPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStatement();
    }
  }, [params.id]);

  const fetchStatement = async () => {
    try {
      const response = await api.get(`/accounts-receivable/statement/${params.id}`);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar extrato:', error);
      alert('Erro ao carregar extrato.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando extrato...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center">Cliente não encontrado ou erro ao carregar dados.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Header / Actions - Hide on Print */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="bg-white">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Extrato
          </Button>
        </div>
      </div>

      {/* Statement Content */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="border-b bg-gray-50/50 print:bg-white print:border-none print:pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Extrato de Conta</CardTitle>
              <p className="text-sm text-gray-500 mt-1">LUMIKE - Moda e Acessórios</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-lg">{data.customer.name}</h3>
              <p className="text-sm text-gray-600">{data.customer.phone || 'Sem telefone'}</p>
              <p className="text-sm text-gray-600">{data.customer.email || 'Sem email'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 print:bg-gray-100">
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead className="w-[400px]">Descrição</TableHead>
                <TableHead className="text-right">Débito</TableHead>
                <TableHead className="text-right">Crédito</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Linha de Saldo Inicial (Opcional, assumindo 0) */}
              {data.transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhuma movimentação registrada.
                  </TableCell>
                </TableRow>
              )}

              {data.transactions.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="text-right text-red-600">
                    {t.type === 'DEBIT' ? `R$ ${t.amount.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {t.type === 'CREDIT' ? `R$ ${t.amount.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${t.running_balance > 0 ? 'text-red-700' : 'text-blue-700'}`}
                  >
                    R$ {t.running_balance.toFixed(2)}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      {t.running_balance > 0 ? '(Devedor)' : '(Credor)'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer Summary */}
          <div className="p-6 bg-gray-50 border-t flex justify-end print:bg-white print:border-t-2">
            <div className="text-right">
              <p className="text-sm text-gray-600 uppercase tracking-wide">Saldo Final</p>
              <div
                className={`text-3xl font-bold mt-1 ${data.current_balance > 0 ? 'text-red-600' : 'text-blue-600'}`}
              >
                R$ {Number(data.current_balance).toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {data.current_balance > 0
                  ? 'Valor total a pagar pelo cliente.'
                  : 'Crédito disponível para o cliente.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .max-w-5xl,
          .max-w-5xl * {
            visibility: visible;
          }
          .max-w-5xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
