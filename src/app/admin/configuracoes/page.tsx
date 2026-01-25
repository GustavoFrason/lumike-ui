'use client';

import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { settingsService, Setting } from '@/lib/services/settings.service';
import Image from 'next/image';
import { Palette, Store, Share2, Upload, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'appearance' | 'store' | 'integrations';

export default function ConfiguracoesPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('appearance');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const data = await settingsService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Erro ao carregar configuracoes:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate(key: string, value: string) {
        try {
            setSaving(key);
            await settingsService.update(key, value);
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar alteração');
        } finally {
            setSaving(null);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, key: string) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await settingsService.uploadBanner(file);
            await handleUpdate(key, url);
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Falha ao subir imagem');
        } finally {
            setUploading(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-[var(--lumike-gold)]" size={32} />
        </div>
    );

    const tabs = [
        { id: 'appearance', label: 'Aparência', icon: Palette },
        { id: 'store', label: 'Dados da Loja', icon: Store },
        { id: 'integrations', label: 'Integrações', icon: Share2 },
    ];

    return (
        <section className="space-y-6">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { label: 'Admin', href: '/admin' },
                        { label: 'Configurações' },
                    ]}
                />
            </div>

            <div className="flex border-b border-zinc-200 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={cn(
                            'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                            activeTab === tab.id
                                ? 'border-[var(--lumike-gold)] text-[var(--lumike-gold)]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700'
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-4xl space-y-6">
                {activeTab === 'appearance' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-8">
                        <h2 className="text-xl font-semibold font-serif">Banner Principal</h2>

                        {settings.filter(s => s.key.startsWith('hero_')).map(setting => (
                            <div key={setting.key} className="space-y-3">
                                <label className="block text-sm font-medium text-zinc-700">
                                    {setting.key === 'hero_banner_url' ? 'Imagem do Banner' :
                                        setting.key === 'hero_title' ? 'Título Principal' :
                                            setting.key === 'hero_subtitle' ? 'Subtítulo' : setting.key}
                                </label>

                                {setting.key === 'hero_banner_url' ? (
                                    <div className="space-y-4">
                                        {setting.value && (
                                            <div className="aspect-[21/9] bg-zinc-100 rounded-lg overflow-hidden border relative">
                                                <Image
                                                    src={setting.value}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg cursor-pointer hover:bg-zinc-800 transition text-sm">
                                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                {uploading ? 'Subindo...' : 'Fazer Upload'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, setting.key)}
                                                    disabled={uploading}
                                                />
                                            </label>
                                            <span className="text-xs text-zinc-500 italic">Recomendado: 1920x800px</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            defaultValue={setting.value}
                                            className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[var(--lumike-gold)] focus:border-transparent outline-none transition"
                                            onBlur={(e) => {
                                                if (e.target.value !== setting.value) {
                                                    handleUpdate(setting.key, e.target.value);
                                                }
                                            }}
                                        />
                                        {saving === setting.key && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="animate-spin text-[var(--lumike-gold)]" size={16} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'store' && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border text-center space-y-4">
                        <Store className="mx-auto text-zinc-300" size={48} />
                        <h3 className="text-lg font-medium">Dados Gerais da Loja</h3>
                        <p className="text-zinc-500 text-sm">Em breve: Endereço, Telefones de Contato, Redes Sociais.</p>
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border text-center space-y-4">
                        <Share2 className="mx-auto text-zinc-300" size={48} />
                        <h3 className="text-lg font-medium">Integrações Externas</h3>
                        <p className="text-zinc-500 text-sm">Em breve: Google Analytics, Facebook Pixel, WhatsApp Business API.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
