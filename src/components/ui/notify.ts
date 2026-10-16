import { toast } from './use-toast';

/**
 * Avisos rápidos (toast) no lugar do `alert()` do navegador, que trava a
 * tela e não segue o visual do sistema. O `<Toaster />` fica no layout raiz.
 */
export const notify = {
  success(message: string) {
    toast({ title: message });
  },
  /** Orientação neutra (ex: "faça login para..."). */
  info(message: string) {
    toast({ title: message });
  },
  error(message: string) {
    toast({ title: message, variant: 'destructive' });
  },
};
