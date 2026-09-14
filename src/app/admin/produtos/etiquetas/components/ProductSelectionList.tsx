import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Product } from '@/lib/services/products.service';

interface ProductSelectionListProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectAll: () => void;
  onSelectAllByStock: () => void;
  onDeselectAll: () => void;
  products: Product[];
  selectedQuantities: Record<number, number>;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export function ProductSelectionList({
  searchTerm,
  onSearchChange,
  onSelectAll,
  onSelectAllByStock,
  onDeselectAll,
  products,
  selectedQuantities,
  onUpdateQuantity,
}: ProductSelectionListProps) {
  return (
    // Mesma altura resiliente do LabelPreviewGrid ao lado — os dois painéis
    // precisam ficar do mesmo tamanho, e o piso de 420px evita colapsar numa
    // tela baixa quando o painel de configuração acima cresce.
    <div className="bg-white p-4 rounded-lg border border-zinc-200 md:col-span-1 h-[max(420px,calc(100vh_-_460px))] flex flex-col">
      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <button onClick={onSelectAll} className="text-xs text-[--lumilee-gold] hover:underline">
            Selecionar Tudo
          </button>
          {/* Marca a quantidade de cada produto IGUAL ao estoque disponível
              dele (5 em estoque -> 5 etiquetas), diferente de "Selecionar
              Tudo" (sempre marca 1) — pra imprimir etiqueta de toda peça
              disponível de uma vez, sem digitar quantidade uma a uma. */}
          <button
            onClick={onSelectAllByStock}
            className="text-xs text-[--lumilee-gold] hover:underline"
            title="Marca a quantidade de cada produto igual ao estoque disponível"
          >
            Selecionar por Estoque
          </button>
          <button onClick={onDeselectAll} className="text-xs text-red-500 hover:underline">
            Limpar Seleção
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {products.map((product) => {
          const qty = selectedQuantities[product.id] || 0;
          return (
            <div
              key={product.id}
              className={`p-3 rounded border transition flex items-center justify-between ${
                qty > 0
                  ? 'border-(--lumilee-gold) bg-yellow-50/10 ring-1 ring-(--lumilee-gold)'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>
                    {product.sku || 'S/ SKU'}
                    {/* Informativo, só pra ajudar a decidir quantas etiquetas
                        imprimir — não limita nem valida a quantidade
                        escolhida no stepper ao lado. */}
                    <span className="text-zinc-400"> · {product.current_stock} em estoque</span>
                  </span>
                  <span className={product.preco_promocional ? 'text-green-600 font-bold' : ''}>
                    {formatCurrency(product.preco_promocional || product.price)}
                  </span>
                </div>
              </div>

              {/* Stepper -/qtd/+ parecido com o de CartPanel.tsx (vendas/nova),
                  mas mantido local de propósito: visual diferente (pill com
                  borda vs. texto inline só-no-hover) e API diferente (delta
                  aqui, valor absoluto lá) — forçar um componente único pra
                  duas telas que evoluem por razões diferentes (impressão de
                  etiqueta vs. carrinho de venda) trocaria uma duplicação
                  pequena por uma abstração com vários props condicionais. */}
              <div className="flex items-center gap-2 bg-white border rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 transition disabled:opacity-30"
                  disabled={qty === 0}
                >
                  -
                </button>
                <span
                  className={`text-xs font-bold w-4 text-center ${qty > 0 ? 'text-(--lumilee-gold)' : 'text-zinc-300'}`}
                >
                  {qty}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-(--lumilee-gold) transition"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
