import { api } from '../api';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  commission_rate: number;
  roles?: {
    id: number;
    name: string;
  };
}

export interface Role {
  id: number;
  name: string;
}

export const usersService = {
  /**
   * Lista todos os usuários
   */
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  /**
   * Lista todos os usuários que são vendedores
   */
  async getSellers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users/sellers');
    return data;
  },

  /**
   * Lista todos os papéis (roles)
   */
  async getRoles(): Promise<Role[]> {
    const { data } = await api.get<Role[]>('/users/roles');
    return data;
  },

  /**
   * Cria um novo usuário
   */
  async create(user: Partial<User> & { password?: string }): Promise<User> {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  /**
   * Atualiza um usuário
   */
  async update(id: number, user: Partial<User> & { password?: string }): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },

  /**
   * Atualiza a taxa de comissão de um vendedor
   */
  async updateCommissionRate(userId: number, rate: number): Promise<User> {
    const { data } = await api.patch<User>(`/users/${userId}/commission-rate`, { rate });
    return data;
  },

  /**
   * Busca um usuário por ID
   */
  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  }
};
