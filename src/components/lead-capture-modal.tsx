'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { validateLeadField } from './lead-capture/lead-validation';
import { LeadCaptureForm } from './lead-capture/LeadCaptureForm';
import { LeadCaptureSuccess } from './lead-capture/LeadCaptureSuccess';

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
    birthday: '',
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
    const error = validateLeadField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
    if (errors.email) validateField('email', value);
  };

  const handleNameChange = (value: string) => {
    const v = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setFormData((prev) => ({ ...prev, name: v }));
    if (errors.name) validateField('name', v);
  };

  const handleBirthdayChange = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);

    let formatted = v;
    if (v.length > 2) formatted = `${v.substring(0, 2)}/${v.substring(2)}`;
    if (v.length > 4) formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;

    setFormData((prev) => ({ ...prev, birthday: formatted }));
    if (errors.birthday) validateField('birthday', formatted);
  };

  const handleWhatsappChange = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);

    let formatted = v;
    if (v.length > 0) formatted = `(${v}`;
    if (v.length > 2) formatted = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 7) formatted = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;

    setFormData((prev) => ({ ...prev, whatsapp: formatted }));
    if (errors.whatsapp) validateField('whatsapp', formatted);
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
                <LeadCaptureForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  onEmailChange={handleEmailChange}
                  onNameChange={handleNameChange}
                  onBirthdayChange={handleBirthdayChange}
                  onWhatsappChange={handleWhatsappChange}
                  onBlur={handleBlur}
                  onSubmit={handleSubmit}
                />
              ) : (
                <LeadCaptureSuccess coupon={coupon} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
