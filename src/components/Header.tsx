import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import mapleLeafGold from "@/assets/maple-leaf-gold.png";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface HeaderProps {
  onApplyClick?: () => void;
}

const Header = ({ onApplyClick }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    toast.success("Signed out successfully");
    navigate("/");
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Apply", path: "/apply" },
    { label: "My Cards", path: "/dashboard" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5"
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.img
              src={mapleLeafGold}
              alt="Canada"
              className="w-8 sm:w-10 h-8 sm:h-10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            />
            <div>
              <h1 className="text-base sm:text-lg font-serif font-semibold text-foreground">
                Canada<span className="text-primary">Visa</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">
                Immigration Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="max-w-[120px] truncate">{user.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-border"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  onApplyClick ? (
                    <Button
                      variant="default"
                      onClick={onApplyClick}
                      className="hidden sm:block bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4"
                    >
                      Apply Now
                    </Button>
                  ) : (
                    <Link to="/apply" className="hidden sm:block">
                      <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4">
                        Apply Now
                      </Button>
                    </Link>
                  )
                )}
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "text-foreground bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user.email}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  onApplyClick ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 mt-2"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onApplyClick();
                      }}
                    >
                      Apply Now
                    </Button>
                  ) : (
                    <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 mt-2">
                        Apply Now
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
