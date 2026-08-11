interface BulkActionsBarProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onActivate,
  onDeactivate,
  onClear,
}: BulkActionsBarProps) {
  return (
    <div className="bg-zinc-100 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
      <span className="text-sm font-medium text-zinc-700">
        {selectedCount} produtos selecionados
      </span>
      <div className="flex gap-2">
        <button
          onClick={onActivate}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
        >
          Ativar Selecionados
        </button>
        <button
          onClick={onDeactivate}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
        >
          Desativar Selecionados
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-zinc-400 text-white text-xs rounded hover:bg-zinc-500 transition"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
