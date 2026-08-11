import { Edit2, Shield, Mail, Percent, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/services/users.service';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onViewInventory: (user: User) => void;
}

export function UserCard({ user, onEdit, onViewInventory }: UserCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-zinc-50 to-zinc-100 rounded-2xl flex items-center justify-center text-xl font-serif text-zinc-400 border border-zinc-50">
            {user.name.substring(0, 1)}
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 line-clamp-1">{user.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Mail className="h-3 w-3" /> {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => onEdit(user)}
          className="p-2 text-zinc-400 hover:text-(--lumike-gold) hover:bg-orange-50 rounded-lg transition-colors"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 pt-4 border-t border-zinc-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Papel
          </span>
          <span className="font-bold text-zinc-700 capitalize">{user.roles?.name || 'Usuário'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5" /> Comissão
          </span>
          <span className="font-bold text-(--lumike-gold)">{user.commission_rate}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400 flex items-center gap-1.5">Status</span>
          <span
            className={cn(
              'flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full',
              user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            )}
          >
            {user.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {user.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => onViewInventory(user)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 hover:bg-(--lumike-gold) hover:text-white hover:border-(--lumike-gold) transition-all group-hover:bg-zinc-100"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Ver Inventário
        </button>
      </div>
    </div>
  );
}
