import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Building2, GraduationCap, Calendar } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",
    organization: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user && open) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        college: user.college || "",
        department: user.department || "",
        year: user.year || "",
        organization: user.organization || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password change if attempted
    if (form.newPassword || form.confirmPassword || form.currentPassword) {
      if (!form.currentPassword) {
        toast({
          title: "Current password required",
          description: "Please enter your current password to change it",
          variant: "destructive",
        });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "New password and confirmation must match",
          variant: "destructive",
        });
        return;
      }
      if (form.newPassword.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const updateData: any = {
        name: form.name,
        phone: form.phone,
      };

      // Add role-specific fields
      if (user?.role === 'student') {
        updateData.college = form.college;
        updateData.department = form.department;
        updateData.year = form.year;
      } else if (user?.role === 'facilitator' || user?.userType === 'corporate') {
        updateData.organization = form.organization;
      }

      // Add password change if provided
      if (form.currentPassword && form.newPassword) {
        updateData.currentPassword = form.currentPassword;
        updateData.newPassword = form.newPassword;
      }

      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });

      // If password was changed, logout and ask to login again
      if (form.currentPassword && form.newPassword) {
        toast({
          title: "Password changed",
          description: "Please login again with your new password.",
        });
        setTimeout(() => {
          logout();
          onOpenChange(false);
        }, 1500);
      } else {
        // Refresh the page to update user data
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
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
          <DialogTitle>My Account</DialogTitle>
          <DialogDescription>
            Update your profile information and password
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          {/* Student-specific fields */}
          {user?.role === 'student' && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm">Student Information</h3>
              
              <div>
                <Label htmlFor="college" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  College/Department
                </Label>
                <Input
                  id="college"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="Your college"
                />
              </div>

              <div>
                <Label htmlFor="department" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Department
                </Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Your department"
                />
              </div>

              <div>
                <Label htmlFor="year" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Year
                </Label>
                <Input
                  id="year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="e.g., 2nd Year"
                />
              </div>
            </div>
          )}

          {/* Facilitator/Corporate fields */}
          {(user?.role === 'facilitator' || user?.userType === 'corporate') && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm">Organization Information</h3>
              
              <div>
                <Label htmlFor="organization" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization
                </Label>
                <Input
                  id="organization"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="Your organization"
                />
              </div>
            </div>
          )}

          {/* Password Change */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm">Change Password (Optional)</h3>
            
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
