import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  FileText,
  Video
} from "lucide-react";

interface Application {
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
  card_number: string;
  expiry_date: string;
  issue_date: string;
  is_active: boolean;
  created_at: string;
  payment_status?: string;
  payment_amount?: number;
  payment_date?: string;
}

interface Stats {
  totalApplicants: number;
  activeCards: number;
  pendingActivation: number;
  totalRevenue: number;
  todayApplications: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
}

interface InterviewBooking {
  id: string;
  user_id: string;
  application_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  visa_type: string;
  preferred_date: string;
  preferred_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviewBookings, setInterviewBookings] = useState<InterviewBooking[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<InterviewBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "pending">("all");
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applications");
  const [stats, setStats] = useState<Stats>({
    totalApplicants: 0,
    activeCards: 0,
    pendingActivation: 0,
    totalRevenue: 0,
    todayApplications: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin - disabled for testing
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) {
  //       toast.error("Please sign in to access admin dashboard");
  //       navigate("/");
  //     }
  //   };
  //   checkAuth();
  // }, [navigate]);

  // Fetch all applications and interview bookings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      console.log("Fetching applications from Supabase...");
      
      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      console.log("Supabase response - apps data:", appsData);
      console.log("Supabase response - apps error:", appsError);

      if (appsError) {
        console.error('Error fetching applications:', appsError);
        toast.error(`Failed to load applications: ${appsError.message}`);
      } else if (appsData && appsData.length > 0) {
        console.log(`Found ${appsData.length} applications`);
        const appsWithPayment = appsData.map((app: Application) => ({
          ...app,
          payment_status: app.is_active ? "completed" : "pending",
          payment_amount: app.is_active ? 10 : 0,
          payment_date: app.is_active ? new Date().toISOString() : null,
        }));
        
        setApplications(appsWithPayment);
        setFilteredApps(appsWithPayment);
      } else {
        console.log("No applications found in database");
      }

      // Fetch interview bookings
      console.log("Fetching interview bookings from Supabase...");
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('interview_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      console.log("Supabase response - bookings data:", bookingsData);
      console.log("Supabase response - bookings error:", bookingsError);

      if (bookingsError) {
        console.error('Error fetching interview bookings:', bookingsError);
        toast.error(`Failed to load interview bookings: ${bookingsError.message}`);
      } else if (bookingsData) {
        console.log(`Found ${bookingsData.length} interview bookings`);
        setInterviewBookings(bookingsData);
        setFilteredBookings(bookingsData);
      }
      
      // Calculate stats
      const today = new Date().toDateString();
      const appsArray = appsData || [];
      const bookingsArray = bookingsData || [];
      
      setStats({
        totalApplicants: appsArray.length,
        activeCards: appsArray.filter((a: Application) => a.is_active).length,
        pendingActivation: appsArray.filter((a: Application) => !a.is_active).length,
        totalRevenue: appsArray.filter((a: Application) => a.is_active).length * 1000,
        todayApplications: appsArray.filter((a: Application) => 
          new Date(a.created_at).toDateString() === today
        ).length,
        totalBookings: bookingsArray.length,
        pendingBookings: bookingsArray.filter((b: InterviewBooking) => b.status === 'pending').length,
        confirmedBookings: bookingsArray.filter((b: InterviewBooking) => b.status === 'confirmed').length,
      });
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.first_name.toLowerCase().includes(query) ||
        app.last_name.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.card_number.includes(query) ||
        app.visa_type.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (selectedFilter === "active") {
      filtered = filtered.filter(app => app.is_active);
    } else if (selectedFilter === "pending") {
      filtered = filtered.filter(app => !app.is_active);
    }
    
    setFilteredApps(filtered);
  }, [searchQuery, selectedFilter, applications]);

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Visa Type", "Nationality", "Card Number", "Status", "Payment Status", "Amount"],
      ...filteredApps.map(app => [
        `${app.first_name} ${app.last_name}`,
        app.email,
        app.phone || "N/A",
        app.visa_type,
        app.nationality,
        app.card_number,
        app.is_active ? "Active" : "Pending",
        app.payment_status || "N/A",
        app.payment_amount || 0
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">Manage all visa applications and interviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "applications" && (
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm">Total Applicants</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalApplicants}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm">Active Cards</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.activeCards}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm">Pending</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.pendingActivation}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm">Revenue (KSH)</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalRevenue}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm">Today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.todayApplications}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="applications" className="data-[state=active]:bg-primary">
              <FileText className="w-4 h-4 mr-2" />
              Applications
              <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                {applications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="interviews" className="data-[state=active]:bg-primary">
              <Video className="w-4 h-4 mr-2" />
              Interview Bookings
              <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                {interviewBookings.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-0">
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, card number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("all")}
                  className={selectedFilter === "all" ? "bg-primary" : "border-slate-600 text-slate-300"}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={selectedFilter === "active" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("active")}
                  className={selectedFilter === "active" ? "bg-green-600" : "border-slate-600 text-slate-300"}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Active
                </Button>
                <Button
                  variant={selectedFilter === "pending" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("pending")}
                  className={selectedFilter === "pending" ? "bg-yellow-600" : "border-slate-600 text-slate-300"}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              All Applications
              <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                {filteredApps.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Visa Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Card Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <AnimatePresence>
                  {filteredApps.map((app) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                            {app.first_name[0]}{app.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{app.first_name} {app.last_name}</p>
                            <p className="text-xs text-slate-400">{app.nationality}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Phone className="w-3 h-3" />
                              {app.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-white">{app.visa_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-sm text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">
                          {app.card_number}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={app.is_active 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {app.is_active ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={app.payment_status === "completed"
                              ? "border-green-500/30 text-green-400"
                              : "border-slate-600 text-slate-400"
                            }
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {app.payment_status === "completed" ? "Paid" : "Unpaid"}
                          </Badge>
                          {app.payment_amount > 0 && (
                            <p className="text-xs text-slate-400">KSH {app.payment_amount}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(app.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {expandedRow === app.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400">No applications found matching your criteria</p>
            </div>
          )}
        </Card>

        {/* Expanded Row Details */}
        <AnimatePresence>
          {expandedRow && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              {filteredApps.filter(app => app.id === expandedRow).map(app => (
                <Card key={app.id} className="bg-slate-800/80 border-slate-600">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Personal Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white"><span className="text-slate-400">DOB:</span> {app.date_of_birth}</p>
                          <p className="text-white"><span className="text-slate-400">Nationality:</span> {app.nationality}</p>
                          <p className="text-white"><span className="text-slate-400">Purpose:</span> {app.purpose_of_visit || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Card Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white"><span className="text-slate-400">Card Number:</span> {app.card_number}</p>
                          <p className="text-white"><span className="text-slate-400">Issue Date:</span> {app.issue_date}</p>
                          <p className="text-white"><span className="text-slate-400">Expiry Date:</span> {app.expiry_date}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Payment Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white">
                            <span className="text-slate-400">Status:</span>{" "}
                            <span className={app.payment_status === "completed" ? "text-green-400" : "text-yellow-400"}>
                              {app.payment_status === "completed" ? "✓ Completed" : "⏳ Pending"}
                            </span>
                          </p>
                          <p className="text-white"><span className="text-slate-400">Amount:</span> KSH {app.payment_amount || 0}</p>
                          {app.payment_date && (
                            <p className="text-white"><span className="text-slate-400">Date:</span> {new Date(app.payment_date).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>

      {/* Interview Bookings Tab */}
      <TabsContent value="interviews" className="mt-0">
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, visa type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={bookingFilter === "all" ? "default" : "outline"}
                  onClick={() => setBookingFilter("all")}
                  className={bookingFilter === "all" ? "bg-primary" : "border-slate-600 text-slate-300"}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={bookingFilter === "pending" ? "default" : "outline"}
                  onClick={() => setBookingFilter("pending")}
                  className={bookingFilter === "pending" ? "bg-yellow-600" : "border-slate-600 text-slate-300"}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </Button>
                <Button
                  variant={bookingFilter === "confirmed" ? "default" : "outline"}
                  onClick={() => setBookingFilter("confirmed")}
                  className={bookingFilter === "confirmed" ? "bg-blue-600" : "border-slate-600 text-slate-300"}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Bookings Table */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Interview Bookings
              <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                {filteredBookings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Visa Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <AnimatePresence>
                  {filteredBookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                            {booking.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{booking.full_name}</p>
                            <p className="text-xs text-slate-400">Booked {new Date(booking.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </div>
                          {booking.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Phone className="w-3 h-3" />
                              {booking.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-white">{booking.visa_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Calendar className="w-3 h-3" />
                            {booking.preferred_date}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Clock className="w-3 h-3" />
                            {booking.preferred_time}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={
                            booking.status === 'confirmed' 
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : booking.status === 'completed'
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : booking.status === 'cancelled'
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {booking.status === 'confirmed' && <><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</>}
                          {booking.status === 'completed' && <><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</>}
                          {booking.status === 'cancelled' && <><XCircle className="w-3 h-3 mr-1" /> Cancelled</>}
                          {booking.status === 'pending' && <><Clock className="w-3 h-3 mr-1" /> Pending</>}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookingExpansion(booking.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {expandedBooking === booking.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400">No interview bookings found</p>
            </div>
          )}
        </Card>

        {/* Expanded Booking Details */}
        <AnimatePresence>
          {expandedBooking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              {filteredBookings.filter(b => b.id === expandedBooking).map(booking => (
                <Card key={booking.id} className="bg-slate-800/80 border-slate-600">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Applicant Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white"><span className="text-slate-400">Name:</span> {booking.full_name}</p>
                          <p className="text-white"><span className="text-slate-400">Email:</span> {booking.email}</p>
                          <p className="text-white"><span className="text-slate-400">Phone:</span> {booking.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Interview Details</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white"><span className="text-slate-400">Visa Type:</span> {booking.visa_type}</p>
                          <p className="text-white"><span className="text-slate-400">Date:</span> {booking.preferred_date}</p>
                          <p className="text-white"><span className="text-slate-400">Time:</span> {booking.preferred_time}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Additional Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white"><span className="text-slate-400">Status:</span> <span className="capitalize">{booking.status}</span></p>
                          <p className="text-white"><span className="text-slate-400">Booked:</span> {new Date(booking.created_at).toLocaleString()}</p>
                          {booking.notes && (
                            <p className="text-white"><span className="text-slate-400">Notes:</span> {booking.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  </main>
</div>
  );
};

export default AdminDashboard;
