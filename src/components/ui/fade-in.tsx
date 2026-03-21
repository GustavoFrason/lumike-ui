'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({ children, delay = 0, direction = 'up', ...props }: FadeInProps) {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
