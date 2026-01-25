'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, or use template literals

// Key for localStorage to prevent showing again
const STORE_KEY = 'lumike_lead_captured_v1';

export function LeadCaptureModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        birthday: ''
    });

    useEffect(() => {
        // Check if user already registered
        const hasRegistered = localStorage.getItem(STORE_KEY);
        if (hasRegistered) return;

        // Show after 10 seconds
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) error = 'Por favor, insira um email válido (ex: nome@email.com).';
        }
        if (name === 'name') {
            if (value.trim().split(' ').length < 2) error = 'Por favor, insira seu nome e sobrenome.';
        }
        if (name === 'birthday') {
            if (value.length !== 10) {
                error = 'A data deve estar completa (DD/MM/AAAA).';
            } else {
                const [day, month, year] = value.split('/').map(Number);
                const date = new Date(year, month - 1, day);
                const today = new Date();

                if (date > today) {
                    error = 'A data de nascimento não pode estar no futuro.';
                } else if (date.getFullYear() < 1900 || date.getMonth() + 1 !== month || date.getDate() !== day) {
                    error = 'Data inválida.';
                }
            }
        }
        if (name === 'whatsapp') {
            if (value.length < 14) error = 'Digite o WhatsApp completo com DDD.';
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        validateField(e.target.name, e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const emailError = validateField('email', formData.email);
        const nameError = validateField('name', formData.name);
        const birthError = validateField('birthday', formData.birthday);
        const whatsError = validateField('whatsapp', formData.whatsapp);

        if (emailError || nameError || birthError || whatsError) {
            return;
        }

        setLoading(true);
        try {
            // POST to backend
            const res = await api.post('/leads', formData);
            // Assuming response structure { success: true, coupon_code: '...' }
            if (res.data?.success) {
                setCoupon(res.data.coupon_code);
                setStep('success');
                localStorage.setItem(STORE_KEY, 'true');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Optional: Mark as seen even if closed without submitting? 
        // Usually annoying if it comes back every time. Let's set a session cookie logic or just ignore for refresh.
        // For now, only permanent hide if successful.
    };

    const ErrorMessage = ({ message }: { message?: string }) => {
        if (!message) return null;
        return (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-1 text-left"
            >
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-500 absolute -top-2 left-4" />
                <div className="bg-red-50 text-red-600 text-xs py-1 px-3 rounded-md border border-red-200 shadow-sm w-full font-medium">
                    {message}
                </div>
            </motion.div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-[90vw] md:max-w-md bg-[#F9F6F2] shadow-2xl overflow-hidden rounded-sm"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-medium-gray hover:text-deep-black z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-10 text-center relative">
                            {/* Decorative Logo / Title */}
                            <h2 className="font-playfair text-4xl md:text-5xl text-primary-gold font-bold mb-2">
                                Lumike<span className="text-black">.</span>
                            </h2>

                            {step === 'form' ? (
                                <>
                                    <div className="space-y-1 mb-8">
                                        <p className="font-montserrat text-lg font-bold text-deep-black uppercase tracking-widest">
                                            10% OFF
                                        </p>
                                        <p className="font-inter text-sm text-medium-gray">
                                            Promoção Relâmpago
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                                required
                                                className={cn(
                                                    "w-full bg-white border p-3 text-sm font-inter outline-none transition-colors",
                                                    errors.email ? "border-red-400 focus:border-red-500" : "border-light-gray focus:border-primary-gold"
                                                )}
                                                value={formData.email}
                                                onChange={e => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (errors.email) validateField('email', e.target.value);
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            <ErrorMessage message={errors.email} />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Nome Completo"
                                                required
                                                className={cn(
                                                    "w-full bg-white border p-3 text-sm font-inter outline-none transition-colors",
                                                    errors.name ? "border-red-400 focus:border-red-500" : "border-light-gray focus:border-primary-gold"
                                                )}
                                                value={formData.name}
                                                onChange={e => {
                                                    const v = e.target.value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '');
                                                    setFormData({ ...formData, name: v });
                                                    if (errors.name) validateField('name', v);
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            <ErrorMessage message={errors.name} />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="birthday"
                                                placeholder="Data de Nascimento (DD/MM/AAAA)"
                                                required
                                                maxLength={10}
                                                className={cn(
                                                    "w-full bg-white border p-3 text-sm font-inter outline-none transition-colors",
                                                    errors.birthday ? "border-red-400 focus:border-red-500" : "border-light-gray focus:border-primary-gold"
                                                )}
                                                value={formData.birthday}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length > 8) v = v.substring(0, 8);

                                                    let formatted = v;
                                                    if (v.length > 2) formatted = `${v.substring(0, 2)}/${v.substring(2)}`;
                                                    if (v.length > 4) formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;

                                                    setFormData({ ...formData, birthday: formatted });
                                                    if (errors.birthday) validateField('birthday', formatted);
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            <ErrorMessage message={errors.birthday} />
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="whatsapp"
                                                placeholder="WhatsApp (com DDD)"
                                                required
                                                maxLength={15}
                                                className={cn(
                                                    "w-full bg-white border p-3 text-sm font-inter outline-none transition-colors",
                                                    errors.whatsapp ? "border-red-400 focus:border-red-500" : "border-light-gray focus:border-primary-gold"
                                                )}
                                                value={formData.whatsapp}
                                                onChange={e => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length > 11) v = v.substring(0, 11);

                                                    let formatted = v;
                                                    if (v.length > 0) formatted = `(${v}`;
                                                    if (v.length > 2) formatted = `(${v.substring(0, 2)}) ${v.substring(2)}`;
                                                    if (v.length > 7) formatted = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;

                                                    setFormData({ ...formData, whatsapp: formatted });
                                                    if (errors.whatsapp) validateField('whatsapp', formatted);
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            <ErrorMessage message={errors.whatsapp} />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[#5D4037] text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-[#3E2723] transition-colors mt-4 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Receber Desconto'}
                                        </button>
                                    </form>

                                    <p className="text-[10px] text-medium-gray mt-4">
                                        O código aparecerá na tela imediatamente após o cadastro.
                                    </p>
                                </>
                            ) : (
                                <div className="py-10 space-y-6">
                                    <Gift className="w-16 h-16 text-primary-gold mx-auto" />
                                    <div className="space-y-2">
                                        <h3 className="font-playfair text-2xl text-deep-black">Parabéns!</h3>
                                        <p className="font-inter text-md text-medium-gray">
                                            Este é seu código exclusivo. <br />
                                            <span className="font-bold text-deep-black">Tire um print</span> ou copie agora:
                                        </p>
                                    </div>

                                    <div className="bg-white border-2 border-dashed border-primary-gold p-4 mt-6">
                                        <span className="font-montserrat text-2xl font-bold text-deep-black tracking-widest select-all">
                                            {coupon}
                                        </span>
                                    </div>

                                    <p className="text-xs text-medium-gray">
                                        Válido por 24 horas.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
