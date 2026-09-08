import { AlertCircle, Trash2, UserCheck } from 'lucide-react';
import {
  CustomerImportPreviewResponse,
  NewCustomerRow,
} from '@/lib/services/customer-import.service';

interface CustomersImportPreviewProps {
  preview: CustomerImportPreviewResponse;
  onUpdate: (rowNumber: number, patch: Partial<NewCustomerRow>) => void;
  onRemove: (rowNumber: number) => void;
}

const MATCH_LABEL: Record<string, string> = {
  email: 'e-mail',
  cpf: 'CPF',
  phone: 'telefone',
};

export function CustomersImportPreview({
  preview,
  onUpdate,
  onRemove,
}: CustomersImportPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase">Novos</p>
          <p className="text-lg font-bold text-blue-700 font-serif">{preview.novos.length}</p>
        </div>
        <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Já cadastrados</p>
          <p className="text-lg font-bold text-zinc-700 font-serif">
            {preview.jaCadastrados.length}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-center">
          <p className="text-[10px] font-bold text-red-500 uppercase">Com erro</p>
          <p className="text-lg font-bold text-red-600 font-serif">{preview.erros.length}</p>
        </div>
      </div>

      {/* Novos — editável */}
      {preview.novos.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-100">
            <h3 className="text-sm font-bold text-blue-700">
              Clientes Novos ({preview.novos.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
                <tr>
                  <th className="text-left px-3 py-2 min-w-[160px]">Nome</th>
                  <th className="text-left px-3 py-2 min-w-[180px]">Email</th>
                  <th className="text-left px-3 py-2 min-w-[130px]">Telefone</th>
                  <th className="text-left px-3 py-2 min-w-[120px]">CPF</th>
                  <th className="text-left px-3 py-2 min-w-[120px]">Cidade</th>
                  <th className="text-left px-3 py-2 w-16">UF</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {preview.novos.map((row) => (
                  <tr key={row.row_number}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => onUpdate(row.row_number, { name: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                      />
                      {row.duplicated_in_file && (
                        <span
                          className="text-[10px] text-amber-500"
                          title="Repetido na planilha, mantida a primeira ocorrência"
                        >
                          * repetido na planilha
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.email}
                        onChange={(e) => onUpdate(row.row_number, { email: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.phone}
                        onChange={(e) => onUpdate(row.row_number, { phone: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.cpf}
                        onChange={(e) => onUpdate(row.row_number, { cpf: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.city}
                        onChange={(e) => onUpdate(row.row_number, { city: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.state}
                        maxLength={2}
                        onChange={(e) =>
                          onUpdate(row.row_number, {
                            state: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full border rounded px-2 py-1 uppercase focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => onRemove(row.row_number)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Remover da importação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Já cadastrados — read-only */}
      {preview.jaCadastrados.length > 0 && (
        <div className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-600">
              Já Cadastrados ({preview.jaCadastrados.length}) — não serão importados
            </h3>
          </div>
          <ul className="divide-y divide-zinc-200 text-sm">
            {preview.jaCadastrados.map((row) => (
              <li
                key={row.row_number}
                className="px-4 py-2 flex items-center justify-between gap-4"
              >
                <span className="text-zinc-600 truncate">
                  Linha {row.row_number}: {row.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-200/60 px-2 py-0.5 rounded shrink-0">
                  já existe (#{row.existing_customer.id}, por{' '}
                  {MATCH_LABEL[row.existing_customer.matched_by] ??
                    row.existing_customer.matched_by}
                  )
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Erros — read-only */}
      {preview.erros.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-bold text-red-600">
              Linhas com Erro ({preview.erros.length}) — ignoradas na importação
            </h3>
          </div>
          <ul className="divide-y divide-red-100 text-sm">
            {preview.erros.map((row) => (
              <li
                key={row.row_number}
                className="px-4 py-2 flex items-center justify-between gap-4"
              >
                <span className="text-zinc-600 truncate">
                  Linha {row.row_number}: {row.name || '(vazio)'}
                </span>
                <span className="text-[10px] uppercase font-bold text-red-500 shrink-0">
                  {row.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
