'use client';

import { useState, useEffect } from 'react';
import { usersService, User, Role } from '@/lib/services/users.service';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { getErrorMessage } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import { UserInventoryModal } from './UserInventoryModal';
import { UserCard } from './components/UserCard';
import { UserFormModal, UserFormData } from './components/UserFormModal';

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [modalData, setModalData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role_id: 0,
    commission_rate: 20,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getAll(),
        usersService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);

      if (rolesData.length > 0 && !modalData.role_id) {
        setModalData((prev) => ({ ...prev, role_id: rolesData[0].id }));
      }
    } catch {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function openEditModal(user: User) {
    setEditingUser(user);
    setModalData({
      name: user.name,
      email: user.email,
      password: '', // Não carrega senha
      role_id: user.role_id,
      commission_rate: user.commission_rate,
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingUser(null);
    setModalData({
      name: '',
      email: '',
      password: '',
      role_id: roles.find((r) => r.name === 'vendedor')?.id || roles[0]?.id || 0,
      commission_rate: 20,
      is_active: true,
    });
    setIsModalOpen(true);
  }

  function openInventory(user: User) {
    setSelectedUser(user);
    setIsInventoryOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingUser?.id) {
        await usersService.update(editingUser.id, modalData);
      } else {
        await usersService.create(modalData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Erro ao salvar usuário: ' + getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 font-medium">Gestão de Usuários</h1>
          <p className="text-zinc-500 mt-1">Administre acessos, papéis e taxas de comissão</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-(--lumike-gold) text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-orange-100"
        >
          <Plus className="h-5 w-5" /> Novo Usuário
        </button>
      </div>

      <ErrorMessage message={error || ''} />

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-(--lumike-gold) outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} onEdit={openEditModal} onViewInventory={openInventory} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-400 italic">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <UserFormModal
          isEditing={!!editingUser}
          data={modalData}
          onChange={setModalData}
          roles={roles}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {/* Modal de Inventário */}
      {isInventoryOpen && selectedUser && (
        <UserInventoryModal user={selectedUser} onClose={() => setIsInventoryOpen(false)} />
      )}
    </div>
  );
}
