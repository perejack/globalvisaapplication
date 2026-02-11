import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Sparkles, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import mapleLeafGold from "@/assets/maple-leaf-gold.png";

interface ActivationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
  visaType: string;
}

const ActivationPopup = ({ isOpen, onClose, onActivate, visaType }: ActivationPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-br from-card via-card to-secondary/50 border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Maple Leaf Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, delay: 0.2 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <img
                src={mapleLeafGold}
                alt="Maple Leaf"
                className="w-full h-full object-contain relative z-10 drop-shadow-lg"
              />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-gold" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2">
                Activate Your <span className="text-primary">{visaType}</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete your application to unlock full benefits
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 mb-6"
            >
              {[
                { icon: CreditCard, text: "Receive payments from Canadian employers" },
                { icon: Shield, text: "Official proof of employment visa" },
                { icon: CheckCircle2, text: "Instant digital verification" },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{benefit.text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Service Fee Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-6"
            >
              <p className="text-center text-sm text-foreground">
                <span className="font-semibold text-gold">Service Processing Fee:</span>{" "}
                <span className="text-lg font-bold">1,000 KSH</span>
              </p>
              <p className="text-center text-xs text-muted-foreground mt-1">
                One-time payment via M-Pesa
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                onClick={onActivate}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold shadow-lg shadow-primary/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Application
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Maybe Later
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 opacity-20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <img src={mapleLeafGold} alt="" className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActivationPopup;
