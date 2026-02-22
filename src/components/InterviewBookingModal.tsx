import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface InterviewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  visaType: string;
  applicationId?: string;
  userData: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM"
];

const InterviewBookingModal = ({ 
  isOpen, 
  onClose, 
  visaType, 
  applicationId,
  userData 
}: InterviewBookingModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData.fullName || "",
    email: userData.email || "",
    phone: userData.phone || "",
    preferredDate: "",
    preferredTime: "",
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error("Please select both date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to book an interview");
        return;
      }

      const { error } = await supabase
        .from('interview_bookings')
        .insert({
          user_id: user.id,
          application_id: applicationId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          visa_type: visaType,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          notes: formData.notes,
          status: 'pending'
        });

      if (error) {
        console.error('Booking error:', error);
        toast.error("Failed to book interview. Please try again.");
        return;
      }

      setStep(3); // Success step
      toast.success("Interview booked successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      fullName: userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      preferredDate: "",
      preferredTime: "",
      notes: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-background rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground">
                  Book Interview
                </h3>
                <p className="text-sm text-muted-foreground">{visaType}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-foreground mb-4">Personal Information</h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full mt-6"
                disabled={!formData.fullName || !formData.email}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-foreground mb-4">Select Date & Time</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Preferred Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Preferred Time
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleInputChange("preferredTime", time)}
                        className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                          formData.preferredTime === time
                            ? "bg-primary text-white border-primary"
                            : "bg-muted/50 border-border hover:bg-muted"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Additional Notes (Optional)
                  </Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any special requirements or notes..."
                    className="w-full p-3 rounded-lg border border-input bg-background text-sm min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={!formData.preferredDate || !formData.preferredTime || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Interview"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              
              <h4 className="text-xl font-semibold text-foreground mb-2">
                Interview Booked!
              </h4>
              <p className="text-muted-foreground mb-2">
                Your interview has been scheduled for:
              </p>
              <div className="bg-primary/10 rounded-lg p-4 mb-6">
                <p className="font-medium text-foreground">{formData.preferredDate}</p>
                <p className="text-primary">{formData.preferredTime}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You will receive a confirmation email shortly with all the details.
              </p>
              
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InterviewBookingModal;
