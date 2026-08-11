import { FileUp, AlertCircle, Loader2 } from 'lucide-react';
import { RefObject } from 'react';

interface XmlUploadPromptProps {
  loading: boolean;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function XmlUploadPrompt({ loading, error, fileInputRef, onFileUpload }: XmlUploadPromptProps) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-zinc-200 group-hover:border-(--lumike-gold) transition-colors">
        <FileUp className="h-10 w-10 text-zinc-300" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-2">Selecione o arquivo XML da Nota Fiscal</h3>
      <p className="text-sm text-zinc-500 max-w-sm mb-6">
        O sistema identificará produtos, quantidades e custos automaticamente.
      </p>

      <input type="file" accept=".xml" ref={fileInputRef} onChange={onFileUpload} className="hidden" />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="px-8 py-3 bg-(--lumike-gold) text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-orange-100 flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processando Nota...
          </>
        ) : (
          <>
            <FileUp className="h-5 w-5" />
            Escolher Arquivo XML
          </>
        )}
      </button>

      {error && (
        <div className="mt-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
