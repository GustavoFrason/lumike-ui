import { DEFAULT_LABEL_CONFIG } from '../types';
import { loadSavedLabelConfig, saveLabelConfig, clearSavedLabelConfig } from '../label-config-storage';

describe('label-config-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('sem nada salvo, devolve o default', () => {
    expect(loadSavedLabelConfig()).toEqual(DEFAULT_LABEL_CONFIG);
  });

  it('salva e recupera a config calibrada', () => {
    const calibrated = { ...DEFAULT_LABEL_CONFIG, offsetX: -30, columnGaps: [1, 3] };
    saveLabelConfig(calibrated);

    expect(loadSavedLabelConfig()).toEqual(calibrated);
  });

  it('mescla sobre o default: campo novo no tipo não quebra config salva antiga', () => {
    // Simula uma config salva por uma versão anterior do código, sem o
    // campo `rowGap` (adicionado depois) — não pode virar `undefined`.
    const oldShape = { ...DEFAULT_LABEL_CONFIG } as Record<string, unknown>;
    delete oldShape.rowGap;
    window.localStorage.setItem('lumilee:etiquetas:label-config', JSON.stringify(oldShape));

    const loaded = loadSavedLabelConfig();
    expect(loaded.rowGap).toBe(DEFAULT_LABEL_CONFIG.rowGap);
  });

  it('JSON corrompido no localStorage cai no default em vez de quebrar', () => {
    window.localStorage.setItem('lumilee:etiquetas:label-config', '{not valid json');
    expect(loadSavedLabelConfig()).toEqual(DEFAULT_LABEL_CONFIG);
  });

  it('clearSavedLabelConfig apaga o que foi salvo', () => {
    saveLabelConfig({ ...DEFAULT_LABEL_CONFIG, offsetX: -99 });
    clearSavedLabelConfig();

    expect(loadSavedLabelConfig()).toEqual(DEFAULT_LABEL_CONFIG);
  });
});
