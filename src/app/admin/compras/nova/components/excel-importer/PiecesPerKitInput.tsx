import { clampPieces, MAX_PIECES_PER_KIT } from '@/lib/utils/kit-conversion';

interface PiecesPerKitInputProps {
  value: number;
  /** Veio sugerido pela descrição ("KIT 12 ...") — destaca pra conferência. */
  suggested: boolean;
  onChange: (pieces: number) => void;
}

/**
 * "Peças por kit": kit = N peças iguais vendidas soltas. 1 = produto
 * comum. A API desmembra no confirm (estoque em peças, custo e preço por
 * peça), então cada peça ganha etiqueta e preço próprios.
 */
export function PiecesPerKitInput({ value, suggested, onChange }: PiecesPerKitInputProps) {
  return (
    <div>
      <input
        type="number"
        min={1}
        max={MAX_PIECES_PER_KIT}
        value={value}
        onChange={(e) => onChange(clampPieces(Number(e.target.value)))}
        aria-label="Peças por kit"
        title="Kit = peças iguais vendidas soltas. 1 = produto comum."
        className={`w-full border rounded px-2 py-1 text-center ${
          suggested ? 'border-amber-300 bg-amber-50' : ''
        }`}
      />
      {suggested && <span className="block text-[10px] text-amber-600 mt-0.5">Sugerido</span>}
    </div>
  );
}
