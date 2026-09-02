import { LabelConfig, LABEL_TEMPLATES } from './types';

interface LabelPrintConfigPanelProps {
  config: LabelConfig;
  onConfigChange: (config: LabelConfig) => void;
}

export function LabelPrintConfigPanel({ config, onConfigChange }: LabelPrintConfigPanelProps) {
  return (
    <div className="print:hidden bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
        Configuração de Impressão
      </p>
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-500">Largura (mm)</label>
          <input
            type="number"
            value={config.width}
            onChange={(e) => onConfigChange({ ...config, width: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Altura (mm)</label>
          <input
            type="number"
            value={config.height}
            onChange={(e) => onConfigChange({ ...config, height: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Fonte (px)</label>
          <input
            type="number"
            value={config.fontSize}
            onChange={(e) => onConfigChange({ ...config, fontSize: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">QR Size (px)</label>
          <input
            type="number"
            value={config.qrSize}
            onChange={(e) => onConfigChange({ ...config, qrSize: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">
            Deslocar Etiqueta — Horiz. (px)
          </label>
          <input
            type="number"
            value={config.offsetX}
            onChange={(e) => onConfigChange({ ...config, offsetX: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">
            Deslocar Etiqueta — Vert. (px)
          </label>
          <input
            type="number"
            value={config.offsetY}
            onChange={(e) => onConfigChange({ ...config, offsetY: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Espaço entre colunas (mm)</label>
          <input
            type="number"
            value={config.columnGap}
            onChange={(e) => onConfigChange({ ...config, columnGap: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Margem da borda (mm)</label>
          <input
            type="number"
            value={config.edgeMargin}
            onChange={(e) => onConfigChange({ ...config, edgeMargin: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm bg-zinc-50"
          />
        </div>
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

      <div className="flex flex-wrap gap-2 pt-2 border-t mt-4 border-zinc-100">
        <span className="text-xs text-zinc-400 font-medium self-center mr-2">Presets:</span>
        {LABEL_TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => onConfigChange({ ...config, ...t })}
            className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-full transition font-medium border border-zinc-200"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
