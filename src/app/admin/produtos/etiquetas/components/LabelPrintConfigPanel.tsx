import { useEffect, useId, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { LabelConfig, resizeColumnGaps } from './types';

interface LabelPrintConfigPanelProps {
  config: LabelConfig;
  onConfigChange: (config: LabelConfig) => void;
  /** Volta pro DEFAULT_LABEL_CONFIG — não pro que estava salvo antes (é justamente pra descartar isso). */
  onReset: () => void;
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

// Mesma conversão que o navegador usa pra resolver a unidade CSS "mm"
// (96 px por polegada ÷ 25,4mm por polegada).
const MM_TO_PX = 96 / 25.4;

/**
 * Limite de deslocamento fino (offsetX/offsetY): metade do tamanho físico
 * da própria etiqueta, em px. Evita dois extremos: travar em um número fixo
 * pequeno demais pra etiquetas grandes (já aconteceu — um limite de ±20px
 * bloqueava um ajuste de -25/-30 numa etiqueta que precisava disso de
 * verdade) e não ter limite nenhum, deixando um typo (ex: "-40" em vez de
 * "-4") deslocar o conteúdo inteiro pra fora da área visível.
 */
function maxOffsetFor(labelSizeMm: number): number {
  return Math.round((labelSizeMm * MM_TO_PX) / 2);
}

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

/**
 * Painel de ajuste fino. Volta a expor largura/altura/espaço entre colunas/
 * espaço entre fileiras/margem/colunas por fileira — esses campos descrevem
 * a bobina física e, na teoria, são fixos (Elgin 27x15mm, 3 colunas), mas a
 * calibração de verdade na impressora (drift de coluna, offset de página,
 * corte de bobina) mostrou que precisam de ajuste manual continuado. Travar
 * como constante em `DEFAULT_LABEL_CONFIG` (types.ts) atrapalhava mais do
 * que ajudava — esses valores viram só o CHUTE INICIAL exibido aqui.
 */
export function LabelPrintConfigPanel({ config, onConfigChange, onReset }: LabelPrintConfigPanelProps) {
  // Mesmo limiar do formato Joia (27x15): abaixo disso o nome do produto e a
  // marca não cabem de forma legível.
  const isTinyLabel = config.width <= 27 && config.height <= 15;
  const showLegibilityWarning = isTinyLabel && (config.showBranding || config.showProductName);
  const maxOffsetX = maxOffsetFor(config.width);
  const maxOffsetY = maxOffsetFor(config.height);

  return (
    <div className="print:hidden bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Configuração de Impressão
          </p>
          <p className="text-[11px] text-zinc-400">
            Salva automaticamente neste computador — a próxima vez que abrir esta tela, continua
            do jeito que você deixou.
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition shrink-0"
          title="Descarta a configuração salva e volta pro padrão de fábrica"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar padrão
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <NumberField
          label="Largura da etiqueta (mm)"
          value={config.width}
          min={5}
          onChange={(width) => onConfigChange({ ...config, width })}
        />
        <NumberField
          label="Altura da etiqueta (mm)"
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
          min={-maxOffsetX}
          max={maxOffsetX}
          onChange={(offsetX) => onConfigChange({ ...config, offsetX })}
        />
        <NumberField
          label="Deslocar Etiqueta — Vert. (px)"
          value={config.offsetY}
          min={-maxOffsetY}
          max={maxOffsetY}
          onChange={(offsetY) => onConfigChange({ ...config, offsetY })}
        />
        {/* Um campo por vão — "Espaço entre colunas" (valor único) virou
            "Espaço etiqueta N→N+1" por par, porque o vão real entre uma
            etiqueta e a próxima nem sempre é igual em todos os pontos da
            bobina (pedido direto do usuário). */}
        {config.columnGaps.map((gap, i) => (
          <NumberField
            key={i}
            label={`Espaço etiqueta ${i + 1}→${i + 2} (mm)`}
            value={gap}
            min={0}
            onChange={(value) => {
              const columnGaps = [...config.columnGaps];
              columnGaps[i] = value;
              onConfigChange({ ...config, columnGaps });
            }}
          />
        ))}
        <NumberField
          label="Distância p/ etiqueta de baixo (mm)"
          value={config.rowGap}
          min={0}
          onChange={(rowGap) => onConfigChange({ ...config, rowGap })}
        />
        <NumberField
          label="Margem da borda (mm)"
          value={config.edgeMargin}
          min={0}
          onChange={(edgeMargin) => onConfigChange({ ...config, edgeMargin })}
        />
        <NumberField
          label="Colunas por fileira"
          value={config.columnsPerRow}
          min={1}
          max={10}
          onChange={(value) => {
            const columnsPerRow = Math.round(value);
            // columnGaps precisa ter sempre columnsPerRow - 1 entradas —
            // ver resizeColumnGaps (types.ts): reusa o último vão já
            // configurado em vez de inventar um valor novo do nada.
            onConfigChange({
              ...config,
              columnsPerRow,
              columnGaps: resizeColumnGaps(config.columnGaps, columnsPerRow),
            });
          }}
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
    </div>
  );
}
