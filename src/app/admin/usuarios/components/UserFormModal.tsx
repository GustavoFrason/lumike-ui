import { Lock } from 'lucide-react';
import { Role } from '@/lib/services/users.service';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role_id: number;
  commission_rate: number;
  is_active: boolean;
}

interface UserFormModalProps {
  isEditing: boolean;
  data: UserFormData;
  onChange: (data: UserFormData) => void;
  roles: Role[];
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function UserFormModal({
  isEditing,
  data,
  onChange,
  roles,
  saving,
  onSubmit,
  onClose,
}: UserFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-zinc-50 bg-linear-to-r from-zinc-50/50 to-white">
          <h2 className="text-2xl font-serif text-zinc-900 font-medium">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Configure o perfil e permissões</p>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                Nome Completo
              </label>
              <input
                required
                type="text"
                value={data.name}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                className="w-full bg-zinc-50 border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                Email Profissional
              </label>
              <input
                required
                type="email"
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                className="w-full bg-zinc-50 border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                <Lock className="h-3 w-3" /> Senha {isEditing && '(Deixe em branco p/ não alterar)'}
              </label>
              <input
                required={!isEditing}
                type="password"
                value={data.password}
                onChange={(e) => onChange({ ...data, password: e.target.value })}
                className="w-full bg-zinc-50 border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Papel
                </label>
                <select
                  value={data.role_id}
                  onChange={(e) => onChange({ ...data, role_id: Number(e.target.value) })}
                  className="w-full bg-zinc-50 border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Comissão (%)
                </label>
                <input
                  type="number"
                  value={data.commission_rate}
                  onChange={(e) => onChange({ ...data, commission_rate: Number(e.target.value) })}
                  className="w-full bg-zinc-50 border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={data.is_active}
                onChange={(e) => onChange({ ...data, is_active: e.target.checked })}
                className="w-4 h-4 text-(--lumilee-gold) border-zinc-300 rounded focus:ring-(--lumilee-gold)"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-zinc-600">
                Usuário Ativo
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-700 transition-colors border border-zinc-200 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-(--lumilee-gold) text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-100"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
