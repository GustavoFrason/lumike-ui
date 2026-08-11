import { WarrantyType } from '@/lib/services/warranties.service';

interface DefectDetailsSectionProps {
  type: WarrantyType | undefined;
  onTypeChange: (type: WarrantyType) => void;
}

export function DefectDetailsSection({ type, onTypeChange }: DefectDetailsSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Tipo de Problema</label>
        <select
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold bg-white"
          required
          value={type}
          onChange={(e) => onTypeChange(e.target.value as WarrantyType)}
        >
          <option value="plating">Banho (Ouro/Ródio)</option>
          <option value="break">Peça Quebrada</option>
          <option value="stone_loss">Queda de Pedras</option>
          <option value="other">Outros</option>
        </select>
      </div>

      <div className="space-y-2 flex flex-col justify-end">
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-[11px] text-amber-800 leading-tight">
            <strong>Nota:</strong> Peças em concerto continuam aparecendo no estoque mas são sinalizadas
            como &quot;Em Reparo&quot;.
          </p>
        </div>
      </div>
    </>
  );
}
