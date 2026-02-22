import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface StatsCounterProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

const StatsCounter = ({ value, suffix = "", label, delay = 0 }: StatsCounterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        
        const interval = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(interval);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(interval);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <p className="text-4xl md:text-5xl font-serif font-bold text-foreground">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  );
};

export default StatsCounter;
