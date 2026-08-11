interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  symbol: boolean;
}

interface PasswordStrengthHintsProps {
  criteria: PasswordCriteria;
}

export function PasswordStrengthHints({ criteria }: PasswordStrengthHintsProps) {
  return (
    <div className="mt-2 p-3 bg-gray-50/50 border border-gray-100 rounded text-xs text-medium-gray space-y-1 transition-all">
      <p className="font-bold mb-1 text-deep-black">Sua senha deve ter:</p>
      <div
        className={`flex items-center gap-2 ${criteria.length ? 'text-green-600' : 'text-gray-400'}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${criteria.length ? 'bg-green-600' : 'bg-gray-300'}`}
        />
        Mínimo de 8 caracteres
      </div>
      <div
        className={`flex items-center gap-2 ${criteria.uppercase ? 'text-green-600' : 'text-gray-400'}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${criteria.uppercase ? 'bg-green-600' : 'bg-gray-300'}`}
        />
        Pelo menos 1 letra maiúscula
      </div>
      <div
        className={`flex items-center gap-2 ${criteria.symbol ? 'text-green-600' : 'text-gray-400'}`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${criteria.symbol ? 'bg-green-600' : 'bg-gray-300'}`}
        />
        Pelo menos 1 símbolo (!@#...)
      </div>
    </div>
  );
}
