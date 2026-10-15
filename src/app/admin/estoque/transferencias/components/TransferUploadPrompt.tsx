import { AlertCircle, Download, FileSpreadsheet, Loader2, PackageOpen } from 'lucide-react';
import { RefObject } from 'react';

/** Modelo pronto pra baixar (public/modelos). Gerado por scripts/gen-import-template.py. */
const TEMPLATE_URL = '/modelos/modelo-transferencia-estoque.xlsx';

interface TransferUploadPromptProps {
  loading: boolean;
  error: string | null;
  /** Motivo para não deixar subir ainda (ex: origem = destino). */
  blockedReason: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Nome da revendedora de origem — mostra o "Trazer tudo". */
  originResellerName: string | null;
  onLoadAll: () => void;
}

export function TransferUploadPrompt({
  loading,
  error,
  blockedReason,
  fileInputRef,
  onFileUpload,
  originResellerName,
  onLoadAll,
}: TransferUploadPromptProps) {
  const disabled = loading || blockedReason !== null;

  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-zinc-200">
        <FileSpreadsheet className="h-10 w-10 text-zinc-300" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-2">Selecione a planilha das peças</h3>
      <p className="text-sm text-zinc-500 max-w-md mb-4">
        Arquivo .xlsx com as colunas Código (nº do item do sistema) e Quantidade. Você revisa tudo
        antes de transferir.
      </p>

      <a
        href={TEMPLATE_URL}
        download
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-(--lumilee-gold) hover:underline"
      >
        <Download className="h-4 w-4" />
        Baixar modelo de planilha (.xlsx)
      </a>

      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={onFileUpload}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="px-8 py-3 bg-(--lumilee-gold) text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-orange-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-5 w-5" />
              Escolher Planilha
            </>
          )}
        </button>

        {originResellerName && (
          <button
            onClick={onLoadAll}
            disabled={disabled}
            className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PackageOpen className="h-5 w-5" />
            Trazer tudo que está com {originResellerName}
          </button>
        )}
      </div>

      {blockedReason && <p className="mt-4 text-sm font-medium text-orange-600">{blockedReason}</p>}

      {error && (
        <div className="mt-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
