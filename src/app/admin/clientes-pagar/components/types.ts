/** Estado do formulário inline de "registrar pagamento" de uma parcela, controlado pelo pai. */
export interface PaymentFormState {
  payingOrderId: number | null;
  paymentAmount: string;
  onPaymentAmountChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  processingPayment: boolean;
  onStartPayment: (orderId: number, amount: number) => void;
  onCancelPayment: () => void;
  onConfirmPayment: (orderId: number) => void;
}
