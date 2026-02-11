import { motion } from "framer-motion";
import Header from "@/components/Header";
import ApplicationForm from "@/components/ApplicationForm";
import FloatingMapleLeaves from "@/components/FloatingMapleLeaves";

const Apply = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingMapleLeaves />
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Apply for Your <span className="text-primary">Canadian Visa</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Complete the application form below to begin your immigration journey. 
              Our streamlined process makes it easy to apply.
            </p>
          </motion.div>

          <ApplicationForm />
        </div>
      </main>
    </div>
  );
};

export default Apply;
