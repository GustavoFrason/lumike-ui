import { motion } from 'framer-motion';

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 mt-1 text-left"
    >
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-500 absolute -top-2 left-4" />
      <div className="bg-red-50 text-red-600 text-xs py-1 px-3 rounded-md border border-red-200 shadow-sm w-full font-medium">
        {message}
      </div>
    </motion.div>
  );
}
