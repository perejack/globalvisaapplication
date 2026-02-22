import { motion } from "framer-motion";

interface MapleLeafProps {
  className?: string;
  size?: number;
  color?: string;
}

const MapleLeaf = ({ className = "", size = 24, color = "currentColor" }: MapleLeafProps) => {
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <path d="M50 0L53.5 15.5L65 8L60 25L80 20L65 35L85 40L65 50L80 65L55 55L60 80L50 60L40 80L45 55L20 65L35 50L15 40L35 35L20 20L40 25L35 8L46.5 15.5L50 0ZM50 60L50 100" />
    </motion.svg>
  );
};

export default MapleLeaf;
