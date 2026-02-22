import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, User, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  visaType: string;
  purposeOfVisit: string;
}

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Travel Details", icon: FileText },
  { id: 3, title: "Confirmation", icon: CreditCard },
];

const visaTypes = [
  "Tourist Visa",
  "Work Permit",
  "Study Permit",
  "Permanent Residence",
  "Business Visa",
  "Super Visa",
];

const nationalities = [
  "Kenya", "United States", "United Kingdom", "India", "China", "Philippines",
  "Nigeria", "Brazil", "Mexico", "Germany", "France", "Japan", "Australia",
  "South Korea", "Pakistan", "Bangladesh", "Other"
];

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to submit an application");
        navigate("/");
        return;
      }
      setUser(user);
      // Pre-fill email if available
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    };
    getUser();
  }, [navigate]);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    visaType: "",
    purposeOfVisit: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.nationality) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        return true;
      case 2:
        if (!formData.visaType) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to submit an application");
      navigate("/");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate card data
      const cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
      const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" });
      const issueDate = new Date().toISOString().split('T')[0];

      // Save application to Supabase
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          date_of_birth: formData.dateOfBirth,
          nationality: formData.nationality,
          visa_type: formData.visaType,
          purpose_of_visit: formData.purposeOfVisit || null,
          card_number: cardNumber,
          expiry_date: expiryDate,
          issue_date: issueDate,
          is_active: false,
        })
        .select();

      if (error) {
        toast.error("Failed to submit application: " + error.message);
        console.error('Supabase error:', error);
        return;
      }

      // Store in localStorage for demo (fallback)
      const cardData = {
        fullName: `${formData.firstName} ${formData.lastName}`.toUpperCase(),
        cardNumber,
        expiryDate,
        nationality: formData.nationality,
        visaType: formData.visaType,
        issueDate,
        dateOfBirth: formData.dateOfBirth,
        isActive: false,
      };
      const existingCards = JSON.parse(localStorage.getItem("visaCards") || "[]");
      existingCards.push(cardData);
      localStorage.setItem("visaCards", JSON.stringify(existingCards));

      toast.success("Application submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                currentStep >= step.id
                  ? "bg-primary border-primary"
                  : "border-muted bg-transparent"
              }`}
              whileHover={{ scale: 1.05 }}
              animate={currentStep === step.id ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {currentStep > step.id ? (
                <Check className="w-5 h-5 text-primary-foreground" />
              ) : (
                <step.icon className={`w-5 h-5 ${currentStep >= step.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
              )}
            </motion.div>
            <div className="hidden sm:block ml-3">
              <p className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-4 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="glass-card p-8 rounded-2xl">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Personal Information</h2>
                <p className="text-muted-foreground">Please provide your personal details as they appear on your passport.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    placeholder="John"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="Doe"
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="john.doe@example.com"
                  className="bg-secondary/50 border-border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select value={formData.nationality} onValueChange={(value) => updateFormData("nationality", value)}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select your nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((nat) => (
                      <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Travel Details</h2>
                <p className="text-muted-foreground">Provide your passport and travel information.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visaType">Visa Type *</Label>
                <Select value={formData.visaType} onValueChange={(value) => updateFormData("visaType", value)}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
                <Input
                  id="purposeOfVisit"
                  value={formData.purposeOfVisit}
                  onChange={(e) => updateFormData("purposeOfVisit", e.target.value)}
                  placeholder="Tourism, Business, Study, etc."
                  className="bg-secondary/50 border-border"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Review & Confirm</h2>
                <p className="text-muted-foreground">Please review your application details before submitting.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <p className="text-muted-foreground">Name</p>
                    <p className="text-foreground font-medium">{formData.firstName} {formData.lastName}</p>
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-foreground">{formData.email}</p>
                    <p className="text-muted-foreground">Nationality</p>
                    <p className="text-foreground">{formData.nationality}</p>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="text-foreground">{formData.dateOfBirth}</p>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Travel Details</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <p className="text-muted-foreground">Visa Type</p>
                    <p className="text-foreground font-medium">{formData.visaType}</p>
                    <p className="text-muted-foreground">Purpose</p>
                    <p className="text-foreground">{formData.purposeOfVisit || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground">
                  By submitting this application, you confirm that all information provided is accurate and complete. 
                  False or misleading information may result in visa denial.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-border"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 min-w-32"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
