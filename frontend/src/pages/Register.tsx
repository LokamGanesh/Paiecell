import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { eventsApi, registrationsApi } from "@/lib/api";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const Register = () => {
  const [searchParams] = useSearchParams();
  const preselectedEvent = searchParams.get("event") || "";
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    college: "SRKR Engineering College",
    department: "",
    year: "",
    eventId: preselectedEvent,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getAll();
        const upcoming = (data.events || []).filter((e: any) => 
          !e.isExternal && new Date(e.date) >= new Date()
        );
        setEvents(upcoming);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    // Autofill form if user is logged in
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        college: user.college || "",
        department: user.department || "",
        year: user.year || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.college || !form.department || !form.year || !form.eventId) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!user && (!form.password || !form.confirmPassword)) {
      toast({ title: "Please enter and confirm your password", variant: "destructive" });
      return;
    }
    if (!user && form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!user && form.password && form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      if (user) {
        // If logged in, use the registration API
        await registrationsApi.create({
          eventId: form.eventId,
          type: 'event'
        });
      } else {
        // For non-logged in users, just simulate (you can add a guest registration endpoint later)
        await new Promise((r) => setTimeout(r, 1200));
      }
      
      setSubmitted(true);
      toast({ 
        title: "Registration successful!",
        description: "You have been registered for the event."
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Registration Successful!</h1>
          <p className="text-muted-foreground max-w-md mb-2">
            Thank you for registering. A confirmation email will be sent to <strong>{form.email}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">You'll also receive a reminder 24 hours before the event.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20 max-w-lg">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Register for an Event</h1>
        <p className="text-muted-foreground mb-8">Fill in your details to secure your spot</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="Your full name"
              disabled={!!user}
            />
            {user && <p className="text-xs text-muted-foreground mt-1">Autofilled from your profile</p>}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="you@example.com"
              disabled={!!user}
            />
            {user && <p className="text-xs text-muted-foreground mt-1">Autofilled from your profile</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              placeholder="+91 XXXXX XXXXX"
              disabled={!!user}
            />
            {user && <p className="text-xs text-muted-foreground mt-1">Autofilled from your profile</p>}
          </div>
          {!user && (
            <>
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    placeholder="Min. 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword} 
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
                    placeholder="Re-enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="college">College *</Label>
            <Input 
              id="college" 
              value={form.college} 
              onChange={(e) => setForm({ ...form, college: e.target.value })} 
              placeholder="Your college"
              disabled={!!user}
            />
            {user && <p className="text-xs text-muted-foreground mt-1">Autofilled from your profile</p>}
          </div>
          <div>
            <Label htmlFor="department">Department *</Label>
            <Input 
              id="department" 
              value={form.department} 
              onChange={(e) => setForm({ ...form, department: e.target.value })} 
              placeholder="Your department"
              disabled={!!user}
            />
            {user && <p className="text-xs text-muted-foreground mt-1">Autofilled from your profile</p>}
          </div>
          <div>
            <Label>Year of Study *</Label>
            <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })} disabled={!!user}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user && <p className="text-xs text-muted-foreground mt-1">Autofilled from your profile</p>}
          </div>
          <div>
            <Label>Event *</Label>
            <Select value={form.eventId} onValueChange={(v) => setForm({ ...form, eventId: v })}>
              <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev._id} value={ev._id}>{ev.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Registering..." : "Register Now"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
