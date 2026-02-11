import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VisaCard from "@/components/VisaCard";
import FloatingMapleLeaves from "@/components/FloatingMapleLeaves";
import PaymentFlow from "@/components/PaymentFlow";
import ActivationPopup from "@/components/ActivationPopup";
import InterviewBookingModal from "@/components/InterviewBookingModal";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Calendar, Globe, CheckCircle2, Download, Share2, RefreshCw, HelpCircle, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CardData {
  id?: string;
  fullName: string;
  cardNumber: string;
  expiryDate: string;
  nationality: string;
  visaType: string;
  issueDate: string;
  dateOfBirth?: string;
  isActive?: boolean;
}

interface ApplicationData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string;
  nationality: string;
  visa_type: string;
  purpose_of_visit: string | null;
  arrival_date: string;
  departure_date: string | null;
  card_number: string;
  expiry_date: string;
  issue_date: string;
  is_active: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<number>(0);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationIds, setApplicationIds] = useState<string[]>([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Check authentication and fetch applications
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to view your dashboard");
        navigate("/");
        return;
      }
      setUser(user);

      // Fetch applications from Supabase
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error("Failed to load your applications");
      } else if (applications) {
        // Map applications to card data
        const mappedCards: CardData[] = applications.map((app: ApplicationData) => ({
          id: app.id,
          fullName: `${app.first_name} ${app.last_name}`.toUpperCase(),
          cardNumber: app.card_number,
          expiryDate: app.expiry_date,
          nationality: app.nationality,
          visaType: app.visa_type,
          issueDate: app.issue_date,
          dateOfBirth: app.date_of_birth,
          isActive: app.is_active,
        }));
        
        setCards(mappedCards);
        setApplicationIds(applications.map((app: ApplicationData) => app.id));
      }

      // Fallback to localStorage if no Supabase data
      if (!applications || applications.length === 0) {
        const storedCards = JSON.parse(localStorage.getItem("visaCards") || "[]");
        setCards(storedCards);
      }

      setIsLoading(false);
    };

    checkAuthAndFetchData();
  }, [navigate]);

  // Show activation popup after 3 seconds if card is not active
  useEffect(() => {
    if (cards.length > 0 && !cards[selectedCard]?.isActive) {
      const timer = setTimeout(() => {
        setShowActivationPopup(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cards, selectedCard]);

  const handleActivateCard = () => {
    setShowActivationPopup(false);
    setShowPaymentFlow(true);
  };

  const handlePaymentComplete = async () => {
    const currentCard = cards[selectedCard];
    const appId = applicationIds[selectedCard];

    if (appId) {
      // Update in Supabase
      const { error } = await supabase
        .from('applications')
        .update({ is_active: true })
        .eq('id', appId);

      if (error) {
        console.error('Error updating application:', error);
        toast.error("Failed to activate card");
        return;
      }
    }

    // Update the card to active locally
    const updatedCards = [...cards];
    updatedCards[selectedCard] = { ...updatedCards[selectedCard], isActive: true };
    setCards(updatedCards);
    localStorage.setItem("visaCards", JSON.stringify(updatedCards));
    setShowPaymentFlow(false);
    toast.success("Card activated successfully!");
  };

  const handleDownloadCard = async () => {
    const card = cards[selectedCard];
    if (!card) return;

    // Create a temporary div for PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '600px';
    tempDiv.style.padding = '40px';
    tempDiv.style.background = 'white';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    const docId = `WP-${Date.now()}`;
    
    tempDiv.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 25px; margin-bottom: 30px;">
        <div style="font-size: 40px; margin-bottom: 10px;">🍁</div>
        <h1 style="color: #667eea; font-size: 28px; font-weight: bold; margin-bottom: 5px;">CANADA WORK PERMIT VISA</h1>
        <p style="color: #666; font-size: 14px;">Official Employment Authorization Document</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Card Holder:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${card.fullName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Visa Type:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${card.visaType}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Status:</span>
          <span style="color: ${card.isActive ? '#10b981' : '#f59e0b'}; font-size: 14px; font-weight: bold;">${card.isActive ? '✓ ACTIVE' : '⏳ PENDING'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Card Number:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${card.cardNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Issue Date:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${card.issueDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Expiry Date:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${card.expiryDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 15px 0;">
          <span style="font-weight: 600; color: #667eea; font-size: 14px;">Nationality:</span>
          <span style="color: #333; font-size: 14px; font-weight: 500;">${card.nationality}</span>
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
      pdf.save(`Work-Permit-Visa-${card.visaType.replace(/\s+/g, '-')}.pdf`);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const currentCard = cards[selectedCard];

  return (
    <div className="min-h-screen bg-background">
      <FloatingMapleLeaves />
      <Header />

      {/* Activation Popup */}
      <ActivationPopup
        isOpen={showActivationPopup}
        onClose={() => setShowActivationPopup(false)}
        onActivate={handleActivateCard}
        visaType={currentCard?.visaType || "Visa Card"}
      />

      {/* Payment Flow Modal */}
      <AnimatePresence>
        {showPaymentFlow && currentCard && (
          <PaymentFlow
            visaType={currentCard.visaType}
            onComplete={handlePaymentComplete}
            onCancel={() => setShowPaymentFlow(false)}
          />
        )}
      </AnimatePresence>

      {/* Interview Booking Modal */}
      <InterviewBookingModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        visaType={currentCard?.visaType || "Visa Card"}
        applicationId={applicationIds[selectedCard]}
        userData={{
          fullName: currentCard?.fullName || "",
          email: user?.email || "",
        }}
      />

      <main className="pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                  My Visa <span className="text-primary">Cards</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manage and view all your Canadian visa cards in one place.
                </p>
              </div>
              <Link to="/apply">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>
          </motion.div>

          {cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 sm:p-12 rounded-2xl text-center"
            >
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CreditCard className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 sm:mb-4">
                No Visa Cards Yet
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
                You haven't applied for any visa cards yet. Start your Canadian journey today 
                by submitting your first application.
              </p>
              <Link to="/apply">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Visa Card
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Card Display */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCard}
                    initial={{ opacity: 0, rotateY: -10 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <VisaCard 
                      cardData={cards[selectedCard]} 
                      onActivate={handleActivateCard}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Card Selector */}
                {cards.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6 sm:mt-8">
                    {cards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCard(index)}
                        className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full transition-all ${
                          selectedCard === index
                            ? "bg-primary scale-125"
                            : "bg-muted hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Card Details */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="glass-card p-4 sm:p-6 rounded-2xl">
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground mb-3 sm:mb-4">
                    Card Details
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Visa Type</p>
                        <p className="text-sm sm:text-base text-foreground font-medium">{cards[selectedCard]?.visaType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Issue Date</p>
                        <p className="text-sm sm:text-base text-foreground font-medium">{cards[selectedCard]?.issueDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Nationality</p>
                        <p className="text-sm sm:text-base text-foreground font-medium">{cards[selectedCard]?.nationality}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6 rounded-2xl">
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground mb-3 sm:mb-4">
                    Quick Actions
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button variant="outline" onClick={handleDownloadCard} className="border-border text-xs sm:text-sm py-2 sm:py-3">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => setShowInterviewModal(true)} className="border-border text-xs sm:text-sm py-2 sm:py-3 bg-primary/5 hover:bg-primary/10 border-primary/20">
                      <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Book Interview
                    </Button>
                    <Button variant="outline" className="border-border text-xs sm:text-sm py-2 sm:py-3">
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Share Card
                    </Button>
                    <Button variant="outline" className="border-border text-xs sm:text-sm py-2 sm:py-3">
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Renew Visa
                    </Button>
                    <Button variant="outline" className="border-border text-xs sm:text-sm py-2 sm:py-3">
                      <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Get Support
                    </Button>
                  </div>
                </div>

                {currentCard?.isActive ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                      <p className="text-xs sm:text-sm text-foreground font-medium">Status: Active</p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Your visa card is fully activated and can receive payments from your employer in Canada.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gold/20 to-primary/10 border border-gold/30 rounded-2xl p-4 sm:p-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                      <p className="text-xs sm:text-sm text-foreground font-medium">Status: Pending Activation</p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                      Complete your application to activate your card and start receiving payments from Canadian employers.
                    </p>
                    <Button 
                      onClick={() => setShowActivationPopup(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-sm h-11 font-semibold shadow-lg shadow-primary/20"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Application
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
