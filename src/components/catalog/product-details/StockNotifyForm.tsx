import { Product } from '@/lib/services/products.service';
import { stockNotificationsService } from '@/lib/services/stock-notifications.service';
import { useSession } from '@/contexts/session-context';

interface StockNotifyFormProps {
  product: Product;
}

export function StockNotifyForm({ product }: StockNotifyFormProps) {
  // Sessão vem do contexto (cookie httpOnly) — ler localStorage durante o
  // render causava hydration mismatch entre servidor e navegador.
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  async function handleConfirmAlert() {
    try {
      await stockNotificationsService.create({ product_id: product.id });
      window.location.href = '/minha-conta/avisos-estoque';
    } catch (error) {
      console.error('Erro ao registrar:', error);
      window.location.href = '/minha-conta/avisos-estoque';
    }
  }

  function handleGuestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    localStorage.setItem(
      'pending_stock_alert',
      JSON.stringify({
        product_id: product.id,
        guest_email: email,
      }),
    );
    window.location.href = `/login?redirect=/minha-conta/avisos-estoque`;
  }

  return (
    <div className="space-y-4 p-6 bg-zinc-50 border border-zinc-200 rounded-sm">
      <div className="text-center space-y-1">
        <p className="font-playfair text-xl text-deep-black font-bold">Produto Indisponível</p>
        <p className="font-inter text-xs text-medium-gray">Avise-me quando retornar ao estoque</p>
      </div>

      {isLoggedIn ? (
        <button
          onClick={handleConfirmAlert}
          className="w-full bg-deep-black text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-primary-gold transition-all"
        >
          Confirmar Alerta
        </button>
      ) : (
        <form onSubmit={handleGuestSubmit} className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Seu e-mail"
            className="w-full px-4 py-3 text-sm border border-light-gray focus:border-primary-gold outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full bg-deep-black text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-primary-gold transition-all"
          >
            Avise-me
          </button>
          <p className="text-[10px] text-medium-gray text-center italic">
            Você será redirecionado para acessar sua conta.
          </p>
        </form>
      )}
    </div>
  );
}
