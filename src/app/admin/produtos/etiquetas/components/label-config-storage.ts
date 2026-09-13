import { DEFAULT_LABEL_CONFIG, type LabelConfig } from './types';

/**
 * Persistência da config de etiqueta no `localStorage` (por navegador/
 * computador, não por conta de usuário). Decisão deliberada: os valores
 * calibrados aqui (offsetX/offsetY, columnGaps, edgeMargin...) descrevem
 * UMA impressora física ligada a UM computador específico — se isso
 * sincronizasse pela conta do usuário, abrir a tela num computador
 * diferente (com outra impressora, ou nenhuma) aplicaria uma calibração
 * que não bate com aquele hardware.
 */
const STORAGE_KEY = 'lumilee:etiquetas:label-config';

/**
 * Lê a última config salva, mesclada sobre `DEFAULT_LABEL_CONFIG` — a
 * mesclagem (em vez de usar o valor salvo puro) garante que um campo novo
 * adicionado ao tipo `LabelConfig` depois que essa config foi salva (ex:
 * `rowGap`, `columnGaps`) nasce com o valor padrão em vez de `undefined` e
 * quebrar a tela (ex: `config.columnGaps.map` num array inexistente).
 *
 * Retorna sempre `DEFAULT_LABEL_CONFIG` quando chamado no servidor (SSR/
 * build estático) — `localStorage` não existe lá. Quem usa isso precisa
 * chamar de dentro de um `useEffect` (só roda no cliente), não do
 * inicializador do `useState`, pra não divergir do HTML pré-renderizado.
 */
export function loadSavedLabelConfig(): LabelConfig {
  if (typeof window === 'undefined') return DEFAULT_LABEL_CONFIG;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LABEL_CONFIG;

    const saved = JSON.parse(raw) as Partial<LabelConfig>;
    return { ...DEFAULT_LABEL_CONFIG, ...saved };
  } catch {
    // JSON inválido ou localStorage bloqueado (aba privada, política do
    // navegador) — mesma saída segura de "nunca salvou nada antes".
    return DEFAULT_LABEL_CONFIG;
  }
}

/** Silencioso de propósito: perder a conveniência de lembrar a última config não é crítico. */
export function saveLabelConfig(config: LabelConfig): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage cheio/bloqueado — ignora.
  }
}

export function clearSavedLabelConfig(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // idem
  }
}
