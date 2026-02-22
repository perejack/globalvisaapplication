import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  Phone, 
  Shield, 
  CheckCircle2, 
  Loader2, 
  CreditCard, 
  Briefcase,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Download,
  Info
} from "lucide-react";
import mapleLeafGold from "@/assets/maple-leaf-gold.png";

interface PaymentFlowProps {
  visaType: string;
  onComplete: () => void;
  onCancel: () => void;
}

// SwiftPay API Configuration
const SWIFTPAY_API_KEY = import.meta.env.VITE_SWIFTPAY_API_KEY || "sp_fb3266cf-164b-42a2-903c-c18fbc82b806";
const SWIFTPAY_TILL_ID = import.meta.env.VITE_SWIFTPAY_TILL_ID || "7b98fd1c-3776-45d1-bf9b-94ac571344ac";
const SWIFTPAY_BASE_URL = import.meta.env.VITE_SWIFTPAY_BASE_URL || "https://swiftpay-backend-uvv9.onrender.com";

const PaymentFlow = ({ visaType, onComplete, onCancel }: PaymentFlowProps) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  const handleDownloadVisa = async () => {
    const docId = `WP-${Date.now()}`;
    const issueDate = new Date().toLocaleDateString();
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();

    // Create a temporary div for PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '600px';
    tempDiv.style.padding = '40px';
    tempDiv.style.background = 'white';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    tempDiv.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 25px; margin-bottom: 30px;">
        <div style="font-size: 40px; margin-bottom: 10px;">🍁</div>
        <h1 style="color: #667eea; font-size: 28px; font-weight: bold; margin-bottom: 5px;">CANADA WORK PERMIT VISA</h1>
        <p style="color: #666; font-size: 14px;">Official Employment Authorization Document</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Visa Type:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${visaType}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Status:</span>
          <span style="color: #10b981; font-size: 14px; font-weight: bold;">✓ ACTIVE</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Issue Date:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${issueDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Expiry Date:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${expiryDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Contact Phone:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">+${phoneNumber}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #667eea; color: #666; font-size: 12px; line-height: 1.8;">
        <p><strong>This document certifies that the holder is authorized to work in Canada.</strong></p>
        <p>Document ID: ${docId}</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      // Generate canvas from the element
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      pdf.save(`Work-Permit-Visa-${visaType.replace(/\s+/g, '-')}.pdf`);
      
      toast.success("Work Permit Visa downloaded as PDF!");
      setShowDownloadPopup(false);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const handlePhoneSubmit = () => {
    // Allow 9 digits (7XXXXXXXX) or 10 digits (07XXXXXXXX)
    if (!phoneNumber || (phoneNumber.length < 9 && phoneNumber.length !== 10)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    // If 10 digits starting with 0, remove the 0
    // If 9 digits starting with 7, add 254 prefix
    const fullPhone = phoneNumber.length === 10 && phoneNumber.startsWith("0")
      ? "254" + phoneNumber.substring(1)
      : phoneNumber.startsWith("254")
        ? phoneNumber
        : "254" + phoneNumber;
    setPhoneNumber(fullPhone);
    setStep(3);
    initiateStkPush(fullPhone);
  };

  const initiateStkPush = async (phone: string) => {
    setIsProcessing(true);
    setPaymentStatus("initiating");
    
    try {
      const url = `${SWIFTPAY_BASE_URL}/api/mpesa/stk-push-api`;
      console.log("Sending STK push to:", url);
      console.log("Phone:", phone);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SWIFTPAY_API_KEY}`,
        },
        body: JSON.stringify({
          phone_number: phone,
          amount: 1000,
          till_id: SWIFTPAY_TILL_ID,
          reference: `VISA-${visaType.replace(/\s+/g, '-').toUpperCase()}`,
          description: `Activation fee for ${visaType}`,
        }),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        toast.error(`Server error (${response.status}). Please try again later.`);
        setPaymentStatus("failed");
        setIsProcessing(false);
        return;
      }

      if (!response.ok || data.status === "error") {
        toast.error(data.message || `Failed to initiate payment (${response.status})`);
        setPaymentStatus("failed");
        setIsProcessing(false);
        return;
      }

      if (data.success && data.data?.checkout_id) {
        setCheckoutRequestId(data.data.checkout_id);
        setPaymentStatus("pending");
        toast.success("STK Push sent! Check your phone");
        
        // Start polling for payment status
        pollPaymentStatus(data.data.checkout_id);
      } else {
        toast.error("Invalid response from payment gateway");
        setPaymentStatus("failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("STK Push Error:", error);
      toast.error("Failed to send STK push. Please try again.");
      setPaymentStatus("failed");
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutId: string) => {
    const maxAttempts = 30; // 2.5 minutes (5 seconds * 30)
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        toast.error("Payment verification timed out. Please check your M-Pesa messages.");
        setPaymentStatus("timeout");
        setIsProcessing(false);
        return;
      }

      attempts++;

      try {
        const response = await fetch(`${SWIFTPAY_BASE_URL}/api/mpesa-verification-proxy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkoutId: checkoutId,
          }),
        });

        const data = await response.json();
        console.log("Payment status check:", JSON.stringify(data, null, 2));
        console.log("Payment status:", data.payment?.status);
        console.log("Payment resultCode:", data.payment?.resultCode);
        console.log("Payment resultDesc:", data.payment?.resultDesc);

        // Check if payment was successful
        // Response format: { success: true, payment: { status: 'completed'|'success'|'paid'|'succeeded', resultCode: '0', ... } }
        const successStatuses = ['completed', 'success', 'paid', 'succeeded'];
        if (data.success && data.payment?.status && successStatuses.includes(data.payment.status.toLowerCase())) {
          setPaymentStatus("success");
          setIsProcessing(false);
          setIsComplete(true);
          setStep(4);
          setShowDownloadPopup(true);
          toast.success("Payment confirmed! Your card is now active.");
          return;
        }

        // If payment failed
        const failedStatuses = ['failed', 'cancelled', 'rejected'];
        if (data.success && data.payment?.status && failedStatuses.includes(data.payment.status.toLowerCase())) {
          setPaymentStatus("failed");
          setIsProcessing(false);
          toast.error(data.payment.resultDesc || "Payment failed. Please try again.");
          return;
        }

        // If payment is still processing, continue polling
        const processingStatuses = ['processing', 'pending'];
        if (data.success && data.payment?.status && processingStatuses.includes(data.payment.status.toLowerCase())) {
          // Continue polling
          setTimeout(checkStatus, 5000);
          return;
        }

        // Unknown status - log it and continue polling if we haven't exhausted attempts
        console.log("Unknown payment status:", data.payment?.status);
        console.log("Full response:", JSON.stringify(data));
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setPaymentStatus("timeout");
          setIsProcessing(false);
          toast.error("Payment verification timed out. Please click 'I've Completed Payment' to check manually.");
        }
      } catch (error) {
        console.error("Status check error:", error);
        // Continue polling even on error
        setTimeout(checkStatus, 5000);
      }
    };

    // Start polling after 5 seconds (give user time to enter PIN)
    setTimeout(checkStatus, 5000);
  };

  const handlePaymentComplete = () => {
    setIsProcessing(true);
    // Trigger manual status check
    if (checkoutRequestId) {
      pollPaymentStatus(checkoutRequestId);
    }
  };

  const steps = [
    { id: 1, title: "Information", icon: Shield },
    { id: 2, title: "Phone Number", icon: Phone },
    { id: 3, title: "Payment", icon: CreditCard },
    { id: 4, title: "Complete", icon: CheckCircle2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg glass-card rounded-2xl sm:rounded-3xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6">
          <div className="absolute top-4 right-4 opacity-20">
            <img src={mapleLeafGold} alt="" className="w-12 sm:w-16 h-12 sm:h-16" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-semibold text-white">
                Activate Your {visaType}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm">Complete your application</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4 sm:mt-6">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-7 sm:w-8 h-7 sm:h-8 rounded-full transition-all ${
                    step >= s.id
                      ? "bg-white text-primary"
                      : "bg-white/20 text-white/60"
                  }`}
                  animate={step === s.id ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {step > s.id ? (
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  ) : (
                    <s.icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-0.5 sm:mx-1 ${step > s.id ? "bg-white" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
              <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                    <img src={mapleLeafGold} alt="Canada" className="w-12 h-12" />
                    <Shield className="w-5 h-5 text-primary absolute -bottom-1 -right-1" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    Service Processing Fee
                  </h3>
                  <p className="text-muted-foreground">
                    A one-time processing fee is required to activate your visa card.
                  </p>
                </div>

                <div className="glass-card bg-secondary/30 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span className="text-2xl font-bold text-primary">KSH 1000</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Enables your card to receive payments from your employer in Canada
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Active {visaType} serves as official proof of employment
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Full access to Canadian work authorization benefits
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    Enter Your Phone Number
                  </h3>
                  <p className="text-muted-foreground">
                    We'll send an M-Pesa STK push to this number
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        +254
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="7XX XXX XXX or 07XXXXXXXX"
                        className="pl-14 bg-secondary/50 border-border text-lg tracking-wider"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your M-Pesa registered phone number
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-border"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePhoneSubmit}
                    disabled={phoneNumber.length < 9 || (phoneNumber.length === 10 && !phoneNumber.startsWith("0")) || (phoneNumber.length > 10)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Send STK Push
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    ) : (
                      <CreditCard className="w-10 h-10 text-primary" />
                    )}
                  </motion.div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    Complete Payment
                  </h3>
                  <p className="text-muted-foreground">
                    {isProcessing 
                      ? "Waiting for payment confirmation..." 
                      : "Check your phone for the STK push prompt"}
                  </p>
                </div>

                <div className="glass-card bg-secondary/30 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
                  <p className="text-3xl font-bold text-primary">KSH 1000</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sending to: +254 {phoneNumber}
                  </p>
                </div>

                {!isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          STK Push Sent!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enter your M-Pesa PIN to complete payment
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={handlePaymentComplete}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      I've Completed Payment
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>

                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-2 mb-2"
                  >
                    <Sparkles className="w-5 h-5 text-gold" />
                    <h3 className="text-2xl font-serif font-semibold text-foreground">
                      Payment Successful!
                    </h3>
                    <Sparkles className="w-5 h-5 text-gold" />
                  </motion.div>
                  <p className="text-muted-foreground">
                    Your {visaType} card is now fully activated
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-card bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-sm text-foreground">
                      Card activated for employer payments
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-sm text-foreground">
                      Official proof of employment ready
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <p className="text-sm text-foreground">
                      Full work authorization enabled
                    </p>
                  </div>
                </motion.div>

                <Button
                  onClick={onComplete}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  View My Active Card
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Download Popup Modal */}
      <AnimatePresence>
        {showDownloadPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDownloadPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-background rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto"
                >
                  <Download className="w-8 h-8 text-white" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    Download Your Work Permit Visa
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your {visaType} work permit visa is ready to download. Keep this document for your records.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleDownloadVisa}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Visa Document
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowDownloadPopup(false)}
                    className="w-full"
                  >
                    Download Later
                  </Button>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    The visa document will be downloaded as a PDF file that you can save for your records.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaymentFlow;
