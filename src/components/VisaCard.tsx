import { useState } from "react";
import { motion } from "framer-motion";
import mapleLeafGold from "@/assets/maple-leaf-gold.png";

interface VisaCardProps {
  cardData: {
    fullName: string;
    cardNumber: string;
    expiryDate: string;
    nationality: string;
    visaType: string;
    issueDate: string;
    dateOfBirth?: string;
    isActive?: boolean;
  };
  isInteractive?: boolean;
  onActivate?: () => void;
}

const VisaCard = ({ cardData, isInteractive = true, onActivate }: VisaCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const formatCardNumber = (num: string) => {
    return num.replace(/(.{4})/g, "$1 ").trim();
  };

  const isActive = cardData.isActive ?? true;

  return (
    <div 
      className="perspective-1000 w-full max-w-[320px] sm:max-w-md mx-auto cursor-pointer"
      onClick={() => isInteractive && setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full aspect-[1.586/1] preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-canadian-red via-[hsl(0,75%,40%)] to-[hsl(0,85%,30%)] p-4 sm:p-6 card-shine">
            {/* Holographic Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200px_200px]" />
            </div>

            {/* Maple Leaf Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
              <img src={mapleLeafGold} alt="" className="w-48 h-48" />
            </div>

            {/* Card Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-[10px] sm:text-xs font-medium tracking-wider uppercase">Canada Immigration</p>
                  <h3 className="text-white font-serif text-sm sm:text-lg font-semibold mt-0.5">{cardData.visaType}</h3>
                </div>
                <img src={mapleLeafGold} alt="Canada" className="w-8 sm:w-10 h-8 sm:h-10" />
              </div>

              {/* Card Number */}
              <div className="mt-auto">
                <p className="text-white/70 text-[10px] sm:text-xs mb-1">Card Number</p>
                <p className="text-white font-mono text-base sm:text-xl tracking-widest font-medium">
                  {formatCardNumber(cardData.cardNumber)}
                </p>
              </div>

              {/* Details Row */}
              <div className="flex justify-between mt-3 sm:mt-4">
                <div>
                  <p className="text-white/70 text-[8px] sm:text-[10px] uppercase tracking-wider">Cardholder</p>
                  <p className="text-white font-medium text-xs sm:text-sm uppercase tracking-wide">{cardData.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-[8px] sm:text-[10px] uppercase tracking-wider">Valid Thru</p>
                  <p className="text-white font-medium text-xs sm:text-sm">{cardData.expiryDate}</p>
                </div>
              </div>

              {/* Bottom Badge */}
              <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 sm:w-8 h-4 sm:h-5 bg-gradient-to-r from-gold to-[hsl(35,90%,50%)] rounded-sm" />
                  <span className="text-white/80 text-[8px] sm:text-[10px] uppercase tracking-wider">Visa</span>
                </div>
                <p className="text-white/60 text-[8px] sm:text-[10px]">Government of Canada</p>
              </div>
            </div>

            {/* Security Hologram */}
            <div className="absolute top-3 sm:top-4 right-12 sm:right-16 w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gradient-to-br from-gold/30 via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-secondary to-[hsl(222,47%,6%)] p-4 sm:p-6">
            {/* Magnetic Strip */}
            <div className="absolute top-6 sm:top-8 left-0 right-0 h-8 sm:h-12 bg-gradient-to-r from-[hsl(222,30%,8%)] via-[hsl(222,30%,12%)] to-[hsl(222,30%,8%)]" />

            {/* Signature Strip */}
            <div className="mt-16 sm:mt-24 bg-white/10 p-2 sm:p-3 rounded">
              <p className="text-muted-foreground text-[10px] sm:text-xs mb-1">Authorized Signature</p>
              <p className="text-foreground font-serif italic text-sm sm:text-base">{cardData.fullName}</p>
            </div>

            {/* Additional Info */}
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Nationality:</span>
                <span className="text-foreground">{cardData.nationality}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="text-foreground">{cardData.issueDate}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={isActive ? "text-primary font-medium" : "text-gold font-medium"}>
                  {isActive ? "Active" : "Pending Activation"}
                </span>
              </div>
            </div>

            {/* Security Code */}
            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
              <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-1">CVV</p>
              <div className="bg-white/10 px-2 sm:px-3 py-1 rounded">
                <span className="font-mono text-foreground text-xs sm:text-sm">***</span>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">Immigration, Refugees and Citizenship Canada</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Flip text and Activation Button - side by side */}
      {isInteractive && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <p className="text-muted-foreground/60 text-xs sm:text-sm">
            Click card to flip
          </p>
          
          {!isActive && onActivate && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                onActivate();
              }}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-medium rounded-full hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-primary/25 flex items-center gap-2"
            >
              <span className="inline-block w-4 h-4">✨</span>
              Complete Application
              <span className="inline-block">→</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default VisaCard;
