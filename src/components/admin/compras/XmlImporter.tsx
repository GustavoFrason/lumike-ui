'use client';

import { useState, useRef } from 'react';
import { productsService } from '@/lib/services/products.service';
import { suppliersService, Supplier } from '@/lib/services/suppliers.service';
import { FileUp } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';
import { XmlItem } from './xml-importer/types';
import { XmlUploadPrompt } from './xml-importer/XmlUploadPrompt';
import { SupplierInfoCard } from './xml-importer/SupplierInfoCard';
import { ImportSummaryCards } from './xml-importer/ImportSummaryCards';
import { ParsedItemsTable } from './xml-importer/ParsedItemsTable';
import { ImporterFooter } from './xml-importer/ImporterFooter';

export type { XmlItem };

interface XmlImporterProps {
  onImport: (items: XmlItem[], supplier_id?: number) => void;
  onCancel: () => void;
}

export function XmlImporter({ onImport, onCancel }: XmlImporterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<XmlItem[]>([]);
  const [supplierInfo, setSupplierInfo] = useState<{
    cnpj: string;
    name: string;
    matchedSupplier?: Supplier;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseValue = (val: string) => parseFloat(val || '0');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      setError('Por favor, selecione um arquivo XML válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      // Check for parse errors
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('Erro ao processar o arquivo XML. Verifique se é uma NF-e válida.');
      }

      // Extract Supplier Info
      const emit = xmlDoc.getElementsByTagName('emit')[0];
      const emitCnpj = emit?.getElementsByTagName('CNPJ')[0]?.textContent || '';
      const emitName = emit?.getElementsByTagName('xNome')[0]?.textContent || '';

      // Lookup Supplier in DB
      const suppliersResult = await suppliersService.findAll(1, 100);
      const matchedSupplier = (suppliersResult.data as Supplier[]).find(
        (s) => s.document?.replace(/\D/g, '') === emitCnpj.replace(/\D/g, ''),
      );

      setSupplierInfo({ cnpj: emitCnpj, name: emitName, matchedSupplier });

      // Extract Items
      const dets = Array.from(xmlDoc.getElementsByTagName('det'));
      const items: XmlItem[] = [];

      for (const det of dets) {
        const prod = det.getElementsByTagName('prod')[0];
        const sku = prod.getElementsByTagName('cProd')[0]?.textContent || '';
        const name = prod.getElementsByTagName('xProd')[0]?.textContent || '';
        const qty = parseValue(prod.getElementsByTagName('qCom')[0]?.textContent || '0');
        const vUn = parseValue(prod.getElementsByTagName('vUnCom')[0]?.textContent || '0');

        // Check against DB by SKU
        const result = await productsService.getAll(1, 1, undefined, sku);
        const systemProduct = result.data.find((p) => p.sku === sku);

        items.push({
          sku,
          name,
          quantity: qty,
          unit_cost: vUn,
          status: systemProduct ? 'matched' : 'new',
          system_product: systemProduct,
        });
      }

      setParsedItems(items);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Erro inesperado ao ler XML.'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onImport(parsedItems, supplierInfo?.matchedSupplier?.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-(--lumike-gold)/10 rounded-lg text-(--lumike-gold)">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-playfair font-bold text-zinc-900">
              Importação de NF-e Inteligente
            </h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Passo 1: Validação de Lote
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-600 transition p-2 hover:bg-zinc-100 rounded-full"
        >
          ✕
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[70vh] scrollbar-thin">
        {parsedItems.length === 0 ? (
          <XmlUploadPrompt
            loading={loading}
            error={error}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
          />
        ) : (
          <div className="space-y-6">
            <SupplierInfoCard supplierInfo={supplierInfo} />
            <ImportSummaryCards parsedItems={parsedItems} />
            <ParsedItemsTable parsedItems={parsedItems} />
          </div>
        )}
      </div>

      <ImporterFooter
        itemCount={parsedItems.length}
        onClear={() => {
          setParsedItems([]);
          setSupplierInfo(null);
        }}
        onConfirm={handleConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}
