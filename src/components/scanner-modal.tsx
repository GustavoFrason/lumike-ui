'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (value: string) => void;
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-md bg-zinc-900 rounded-lg overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="pt-20 pb-10 px-4 text-center">
                    <p className="text-white mb-4">Aponte a câmera para o QR Code</p>
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-[var(--lumike-gold)] relative">
                        <Scanner
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    onScan(result[0].rawValue);
                                }
                            }}
                            components={{
                                finder: false, // We made our own border
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' }
                            }}
                        />
                    </div>
                    <p className="text-zinc-400 text-sm mt-4">O produto será adicionado automaticamente</p>
                </div>
            </div>
        </div>
    );
}
