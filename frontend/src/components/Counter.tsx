import { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const Counter = ({ value, duration = 1.2, prefix = '', suffix = '' }: CounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const displayValue = useTransform(springValue, (latest) => 
    `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`
  );

  useEffect(() => {
    if (isInView) {
      animate(motionValue, value, {
        duration: duration,
        ease: "easeOut",
      });
    }
  }, [isInView, value, duration, motionValue]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

export default Counter;
