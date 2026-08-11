import { useEffect, useRef } from 'react';

/**
 * Toca um beep de sucesso/erro ao bipar produto no PDV. Tenta o arquivo de
 * áudio primeiro; se falhar (ex: autoplay bloqueado), gera um tom via
 * Web Audio API como fallback.
 */
export function usePosBeeper() {
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    beepRef.current = new Audio('/sounds/beep.mp3');
  }, []);

  function generateToneBeep(freq: number, duration: number) {
    try {
      // Safari antigo só expõe o AudioContext prefixado.
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Oscillator beep error:', e);
    }
  }

  function playBeep() {
    try {
      if (beepRef.current) {
        beepRef.current.currentTime = 0;
        beepRef.current.play().catch(() => generateToneBeep(800, 0.1));
      } else {
        generateToneBeep(800, 0.1);
      }
    } catch (e) {
      console.error('Beep error:', e);
    }
  }

  function playErrorBeep() {
    generateToneBeep(200, 0.3); // Som mais grave e longo para erro
  }

  return { playBeep, playErrorBeep };
}
