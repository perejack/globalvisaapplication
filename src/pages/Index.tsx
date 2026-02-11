import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import VisaCard from "@/components/VisaCard";
import FloatingMapleLeaves from "@/components/FloatingMapleLeaves";
import FeatureCard from "@/components/FeatureCard";
import StatsCounter from "@/components/StatsCounter";
import AuthModal from "@/components/AuthModal";
import heroBg from "@/assets/hero-bg.jpg";
import { 
  Shield, 
  Clock, 
  Globe, 
  FileCheck, 
  Users, 
  Award,
  ArrowRight,
  Sparkles
} from "lucide-react";

const sampleCardData = {
  fullName: "JOHN DOE",
  cardNumber: "4532015678901234",
  expiryDate: "12/29",
  nationality: "United States",
  visaType: "Tourist Visa",
  issueDate: "02/06/2026",
  passportNumber: "AB1234567",
};

const features = [
  {
    icon: Clock,
    title: "Fast Processing",
    description: "Get your visa card processed within 24-48 hours with our streamlined digital application system.",
  },
  {
    icon: Shield,
    title: "Secure & Encrypted",
    description: "Your data is protected with bank-grade 256-bit encryption and multi-factor authentication.",
  },
  {
    icon: Globe,
    title: "Worldwide Access",
    description: "Apply from anywhere in the world. Our platform supports applications from 150+ countries.",
  },
  {
    icon: FileCheck,
    title: "Digital Documentation",
    description: "Upload and manage all your documents digitally. No physical paperwork required.",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "24/7 assistance from certified immigration consultants to guide you through the process.",
  },
  {
    icon: Award,
    title: "Track Progress",
    description: "Real-time application tracking with status updates at every stage of your journey.",
  },
];

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingMapleLeaves />
      <Header onApplyClick={() => setShowAuthModal(true)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        {/* Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6"
              >
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm text-primary font-medium">Digital Immigration Portal</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-4 sm:mb-6">
                Your Gateway to{" "}
                <span className="text-primary">Canada</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Apply for your Canadian visa card seamlessly. Experience a modern, 
                secure, and efficient immigration process designed for the digital age.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 group"
                >
                  Start Application
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-border hover:bg-secondary">
                    View My Cards
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Card Display */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-30" />
              <div className="relative floating">
                <VisaCard cardData={sampleCardData} isInteractive={true} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <StatsCounter value={250000} suffix="+" label="Visas Processed" delay={0} />
            <StatsCounter value={150} suffix="+" label="Countries Served" delay={0.1} />
            <StatsCounter value={98} suffix="%" label="Approval Rate" delay={0.2} />
            <StatsCounter value={24} suffix="/7" label="Support Available" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Why Choose <span className="text-primary">CanadaVisa</span>?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Experience the most advanced and user-friendly immigration platform 
              designed to make your Canadian dream a reality.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.2)_0%,transparent_50%)]" />
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 sm:mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-8">
                Join thousands of successful applicants who have made Canada their new home. 
                Start your application today.
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 group"
              >
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-serif font-semibold text-foreground">
                Canada<span className="text-primary">Visa</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                © 2026 CanadaVisa. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
              <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
