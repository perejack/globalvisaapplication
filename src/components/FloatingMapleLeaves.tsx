import { motion } from "framer-motion";
import { useMemo } from "react";

const FloatingMapleLeaves = () => {
  const leaves = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      size: 20 + Math.random() * 30,
      opacity: 0.05 + Math.random() * 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{ left: leaf.left }}
          initial={{ y: -100, rotate: 0, opacity: 0 }}
          animate={{
            y: "110vh",
            rotate: 720,
            opacity: [0, leaf.opacity, leaf.opacity, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 100 100"
            fill="hsl(var(--primary))"
            style={{ opacity: leaf.opacity }}
          >
            <path d="M50 0L53.5 15.5L65 8L60 25L80 20L65 35L85 40L65 50L80 65L55 55L60 80L50 60L40 80L45 55L20 65L35 50L15 40L35 35L20 20L40 25L35 8L46.5 15.5L50 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingMapleLeaves;
