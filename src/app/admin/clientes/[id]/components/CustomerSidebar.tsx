import Link from 'next/link';
import { MessageCircle, Mail, Phone, Calendar } from 'lucide-react';
import { Customer } from '@/lib/services/customers.service';

interface CustomerSidebarProps {
  customer: Customer;
}

export function CustomerSidebar({ customer }: CustomerSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center text-center">
        <div className="h-24 w-24 bg-zinc-50 border-4 border-white shadow-md rounded-full flex items-center justify-center text-3xl font-serif text-(--lumike-taupe-dark) mb-4 relative group">
          {customer.name.charAt(0).toUpperCase()}
          <div className="absolute inset-0 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h1 className="text-2xl font-bold font-serif text-zinc-900 mb-1">{customer.name}</h1>
        <p className="text-xs text-zinc-400 mb-6 font-medium uppercase tracking-widest">
          ID #{customer.id} • Desde {new Date(customer.created_at).toLocaleDateString()}
        </p>

        <div className="w-full space-y-3 pt-6 border-t border-zinc-50">
          {customer.email && (
            <div className="flex items-center gap-3 text-sm text-zinc-600 justify-center">
              <Mail className="h-4 w-4 text-(--lumike-gold)" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-3 text-sm text-zinc-600 justify-center">
              <Phone className="h-4 w-4 text-(--lumike-gold)" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>

        <div className="w-full grid grid-cols-2 gap-2 mt-8">
          {customer.phone && (
            <a
              href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl transition shadow-sm hover:shadow-md text-sm font-bold"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          <Link
            href={`/admin/clientes/${customer.id}/extrato`}
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-xl transition shadow-sm hover:shadow-md text-sm font-bold"
          >
            <Calendar className="h-4 w-4" />
            Extrato
          </Link>
        </div>
      </div>

      {/* Billing Info */}
      {(customer.address || customer.cpf) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Informações de Cobrança
          </h3>

          {customer.cpf && (
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">
                CPF
              </label>
              <p className="text-sm text-zinc-700 font-medium">{customer.cpf}</p>
            </div>
          )}

          {customer.address && (
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">
                Endereço
              </label>
              <p className="text-sm text-zinc-700 font-medium leading-relaxed">
                {customer.address}
                <br />
                {customer.zipcode && <span>CEP: {customer.zipcode} • </span>}
                {customer.city}/{customer.state}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
