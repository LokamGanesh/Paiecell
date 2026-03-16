import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SignupDialog = ({ open, onOpenChange, onSwitchToLogin }: SignupDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    college: "SRKR Engineering College",
    department: "",
    year: "",
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword ||
        !form.phone || !form.college || !form.department || !form.year) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          role: "student",
          userType: "student",
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user data temporarily for payment callback
      sessionStorage.setItem('pendingUserId', data.userId);
      sessionStorage.setItem('pendingUserData', JSON.stringify(data));

      toast({
        title: "Redirecting to Payment",
        description: "You will be redirected to PhonePe payment gateway",
      });

      // Redirect to PhonePe payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Student Account</DialogTitle>
          <DialogDescription>
            Fill in your details to register as a student. A registration fee of ₹100 will be charged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">+91</span>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: value });
                }}
                placeholder="XXXXX XXXXX"
                maxLength={10}
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
          </div>
          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={loading}
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
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="college">College *</Label>
            <Input
              id="college"
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              placeholder="Your college name"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="department">Branch *</Label>
            <Select
              value={form.department}
              onValueChange={(v) => setForm({ ...form, department: v })}
              disabled={loading}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AIDS">AIDS</SelectItem>
                <SelectItem value="AIML">AIML</SelectItem>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="CSD">CSD</SelectItem>
                <SelectItem value="CIC">CIC</SelectItem>
                <SelectItem value="CSB">CSBS</SelectItem>
                <SelectItem value="SCS">CSIT</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="CIVIL">CIVIL</SelectItem>
                <SelectItem value="MECH">MECH</SelectItem>
                <SelectItem value="ECE">ECE</SelectItem>
                <SelectItem value="EEE">EEE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Year of Study *</Label>
            <Select
              value={form.year}
              onValueChange={(v) => setForm({ ...form, year: v })}
              disabled={loading}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Year">1st Year</SelectItem>
                <SelectItem value="2nd Year">2nd Year</SelectItem>
                <SelectItem value="3rd Year">3rd Year</SelectItem>
                <SelectItem value="4th Year">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Registration Fee:</strong> ₹100 (One-time payment via PhonePe)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Create Account & Pay ₹100"
            )}
          </Button>
        </form>

        <div className="text-center text-sm mt-4">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              if (onSwitchToLogin) onSwitchToLogin();
            }}
            className="text-primary hover:underline"
            disabled={loading}
          >
            Already have an account? Login
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
