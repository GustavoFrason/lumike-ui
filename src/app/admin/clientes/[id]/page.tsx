'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useOrders } from '@/lib/hooks/use-orders';
import { customersService } from '@/lib/services/customers.service';
import { accountsReceivableService } from '@/lib/services/accounts-receivable.service';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/hooks/use-orders';
import { Customer } from '@/lib/services/customers.service';
import { CustomerSidebar } from './components/CustomerSidebar';
import { CustomerKpiCards } from './components/CustomerKpiCards';
import { CustomerOrdersTable } from './components/CustomerOrdersTable';

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [currentDebt, setCurrentDebt] = useState(0);

  const { loadOrders, loadingOrders, orders } = useOrders();

  const loadData = useCallback(async () => {
    try {
      setLoadingCustomer(true);
      const [customerData, debtors] = await Promise.all([
        customersService.getById(id),
        accountsReceivableService.getDebtors(),
      ]);

      setCustomer(customerData);

      // Encontrar débito deste cliente específico
      const debtor = debtors.find((d) => d.customer_id === id);
      setCurrentDebt(debtor?.total_debt || 0);

      // Load orders for this customer
      await loadOrders(1, 100, undefined, id);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      setLoadingCustomer(false);
    }
  }, [id, loadOrders]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--lumike-gold)" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-zinc-900">Cliente não encontrado</h2>
        <Link
          href="/admin/clientes"
          className="text-(--lumike-gold) hover:underline mt-2 inline-block"
        >
          Voltar para lista
        </Link>
      </div>
    );
  }

  // Calculate KPIs
  const totalSpent = orders.reduce(
    (acc: number, order: Order) => acc + (Number(order.total_amount) || 0),
    0,
  );
  const averageTicket = orders.length > 0 ? totalSpent / orders.length : 0;
  const lastOrderDate =
    orders.length > 0 ? new Date(orders[0].created_at).toLocaleDateString() : '-';

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <Link
          href="/admin/clientes"
          className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Clientes
        </Link>
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Clientes', href: '/admin/clientes' },
            { label: customer.name },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CustomerSidebar customer={customer} />

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerKpiCards
            totalSpent={totalSpent}
            currentDebt={currentDebt}
            averageTicket={averageTicket}
            lastOrderDate={lastOrderDate}
          />

          <CustomerOrdersTable orders={orders} loadingOrders={loadingOrders} />
        </div>
      </div>
    </section>
  );
}
