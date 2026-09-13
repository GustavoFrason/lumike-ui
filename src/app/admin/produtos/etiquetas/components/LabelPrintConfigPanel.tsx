import { useEffect, useId, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { LabelConfig, LABEL_TEMPLATES } from './types';

interface LabelPrintConfigPanelProps {
  config: LabelConfig;
  onConfigChange: (config: LabelConfig) => void;
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

// Só dígitos, com no máximo um sinal de menos (só no início) e um ponto
// decimal — cobre tanto o valor final quanto todo estado intermediário
// válido de digitação ("", "-", "1.", "-1", "-1.5"...).
const PARTIAL_NUMBER_RE = /^-?\d*\.?\d*$/;

/**
 * Input numérico controlado que não briga com quem está digitando.
 *
 * `<input type="number">` roda o "value sanitization algorithm" do HTML no
 * próprio nível do elemento: digitar só "-" faz `input.value` (o que
 * `onChange` recebe) virar `""` automaticamente, ANTES de qualquer código
 * React rodar — não tem como diferenciar "apaguei o campo" de "comecei a
 * digitar um negativo" nesse ponto. Por isso o input aqui é `type="text"`
 * (sem essa sanitização nativa): o rascunho fica numa string local só
 * nossa, validada por regex, e só vira `config` (via `onChange`) quando já
 * é um número completo — o que também permite aplicar os limites de
 * `min`/`max` antes de propagar, evitando um typo (ex: "-40" em vez de "-4")
 * empurrar a etiqueta inteira pra fora da área visível.
 */
function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));

  // Sincroniza quando o valor muda por fora (troca de preset, por exemplo).
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function clamp(n: number): number {
    let result = n;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (!PARTIAL_NUMBER_RE.test(raw)) return; // tecla inválida (letra, 2º sinal...) — ignora

    setDraft(raw);

    // Estado intermediário de digitação ("", "-", termina em ".") — espera
    // a pessoa terminar antes de interpretar como número e propagar.
    if (raw === '' || raw === '-' || raw.endsWith('.')) return;

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;

    const clamped = clamp(parsed);
    onChange(clamped);
    if (clamped !== parsed) setDraft(String(clamped)); // avisa visualmente que foi limitado
  }

  function handleBlur() {
    const parsed = Number(draft);
    if (draft === '' || Number.isNaN(parsed)) {
      setDraft(String(value)); // saiu do campo com algo inválido: volta pro último valor válido
      return;
    }
    const clamped = clamp(parsed);
    setDraft(String(clamped)); // normaliza formatação solta (ex: "5." -> "5")
    if (clamped !== value) onChange(clamped); // garante que o que ficou exibido foi de fato salvo
  }

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-zinc-500">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
      />
    </div>
  );
}

export function LabelPrintConfigPanel({ config, onConfigChange }: LabelPrintConfigPanelProps) {
  // Mesmo limiar do preset "Joia (27x15)": abaixo disso o nome do produto e a
  // marca não cabem de forma legível (ver comentário do preset em types.ts).
  const isTinyLabel = config.width <= 27 && config.height <= 15;
  const showLegibilityWarning = isTinyLabel && (config.showBranding || config.showProductName);

  return (
    <div className="print:hidden bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
        Configuração de Impressão
      </p>
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
        <NumberField
          label="Largura (mm)"
          value={config.width}
          min={5}
          onChange={(width) => onConfigChange({ ...config, width })}
        />
        <NumberField
          label="Altura (mm)"
          value={config.height}
          min={5}
          onChange={(height) => onConfigChange({ ...config, height })}
        />
        <NumberField
          label="Fonte (px)"
          value={config.fontSize}
          min={5}
          onChange={(fontSize) => onConfigChange({ ...config, fontSize })}
        />
        <NumberField
          label="QR Size (px)"
          value={config.qrSize}
          min={10}
          onChange={(qrSize) => onConfigChange({ ...config, qrSize })}
        />
        <NumberField
          label="Deslocar Etiqueta — Horiz. (px)"
          value={config.offsetX}
          min={-20}
          max={20}
          onChange={(offsetX) => onConfigChange({ ...config, offsetX })}
        />
        <NumberField
          label="Deslocar Etiqueta — Vert. (px)"
          value={config.offsetY}
          min={-20}
          max={20}
          onChange={(offsetY) => onConfigChange({ ...config, offsetY })}
        />
        <NumberField
          label="Espaço entre colunas (mm)"
          value={config.columnGap}
          min={0}
          onChange={(columnGap) => onConfigChange({ ...config, columnGap })}
        />
        <NumberField
          label="Margem da borda (mm)"
          value={config.edgeMargin}
          min={0}
          onChange={(edgeMargin) => onConfigChange({ ...config, edgeMargin })}
        />
        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="show-branding"
            checked={config.showBranding}
            onChange={(e) => onConfigChange({ ...config, showBranding: e.target.checked })}
            className="rounded text-(--lumilee-gold) focus:ring-(--lumilee-gold)"
          />
          <label htmlFor="show-branding" className="text-xs font-medium text-zinc-600">
            Logo Lumilee
          </label>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="show-product-name"
            checked={config.showProductName}
            onChange={(e) => onConfigChange({ ...config, showProductName: e.target.checked })}
            className="rounded text-(--lumilee-gold) focus:ring-(--lumilee-gold)"
          />
          <label htmlFor="show-product-name" className="text-xs font-medium text-zinc-600">
            Nome do Produto
          </label>
        </div>
      </div>

      {showLegibilityWarning && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Etiqueta {config.width}x{config.height}mm é pequena — logo e/ou nome do produto podem
          ficar ilegíveis ou sobrepor o QR Code.
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t mt-4 border-zinc-100">
        <span className="text-xs text-zinc-400 font-medium self-center mr-2">Presets:</span>
        {LABEL_TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => {
              // Substitui o config INTEIRO pelo preset (nunca faz merge
              // parcial) — cada preset já é uma LabelConfig completa
              // justamente pra não vazar ajuste de uma etiqueta pra outra.
              const { label: _presetLabel, ...preset } = t;
              onConfigChange(preset);
            }}
            className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-full transition font-medium border border-zinc-200"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
