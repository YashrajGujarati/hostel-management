import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const Counter = ({ value, duration = 1.2, prefix = '', suffix = '' }: CounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 80,
  });

  useEffect(() => {
    if (isInView && value > 0) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

export default Counter;
