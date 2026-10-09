import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';
import { LABEL_TEXT_MAX_CHARS } from './types';

interface LabelTextInputProps {
  productId: number;
  value: string | null | undefined;
  onSave: (productId: number, text: string) => Promise<void>;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Campo inline do "Texto da etiqueta" (ex: LINHA PRATA, ARO 16, 45cm) na
 * lista de seleção — dá pra preencher enquanto escolhe o que imprimir, sem
 * abrir o cadastro do produto. Salva no produto ao sair do campo (ou
 * Enter), só se mudou.
 */
export function LabelTextInput({ productId, value, onSave }: LabelTextInputProps) {
  const saved = value ?? '';
  const [draft, setDraft] = useState(saved);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function commit() {
    const text = draft.trim();
    if (text === saved.trim()) return;

    setState('saving');
    setError(null);
    try {
      await onSave(productId, text);
      setState('saved');
    } catch (err) {
      setState('error');
      setError(getErrorMessage(err, 'Não foi possível salvar o texto.'));
    }
  }

  return (
    <div className="mt-2">
      <div className="relative">
        <input
          type="text"
          value={draft}
          maxLength={LABEL_TEXT_MAX_CHARS}
          placeholder="Texto da etiqueta (ex: LINHA PRATA, ARO 16)"
          aria-label="Texto da etiqueta"
          onChange={(e) => {
            setDraft(e.target.value.toUpperCase());
            if (state !== 'saving') setState('idle');
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className={`w-full text-[11px] uppercase px-2 py-1 pr-12 border rounded outline-none focus:ring-1 focus:ring-(--lumilee-gold) ${
            state === 'error' ? 'border-red-300' : 'border-zinc-200'
          }`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-zinc-400">
          {state === 'saving' && <Loader2 className="h-3 w-3 animate-spin" aria-label="Salvando" />}
          {state === 'saved' && <Check className="h-3 w-3 text-green-600" aria-label="Salvo" />}
          {draft.length}/{LABEL_TEXT_MAX_CHARS}
        </span>
      </div>
      {error && <p className="text-[10px] text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}
