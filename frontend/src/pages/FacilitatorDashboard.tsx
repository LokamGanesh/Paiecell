import { Link } from "react-router-dom";
import { useState } from "react";
import { Calendar, Users, LogOut, User, Building2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProfileDialog } from "@/components/ProfileDialog";

const FacilitatorDashboard = () => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome, {user?.name}!
              </h1>
              <p className="text-muted-foreground">Facilitator dashboard</p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-6 card-shadow">
              <div className="flex items-start justify-between mb-3">
                <User className="h-8 w-8 text-primary" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProfileOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <h3 className="font-display font-semibold text-card-foreground mb-2">Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-card-foreground">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="text-card-foreground capitalize">{user?.role}</span>
                </div>
                {user?.organization && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="text-card-foreground">{user?.organization}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 card-shadow">
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-card-foreground mb-2">My Events</h3>
              <p className="text-muted-foreground text-sm mb-4">
                You're not assigned to any events yet.
              </p>
              <Link to="/events">
                <Button className="w-full">View All Events</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 card-shadow">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-card-foreground mb-2">Participants</h3>
              <p className="text-muted-foreground text-sm mb-4">
                View participant lists for events you're facilitating
              </p>
              <Button variant="outline" className="w-full" disabled>
                View Participants
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 card-shadow">
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-card-foreground mb-2">Resources</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Access event materials and submit resources
              </p>
              <Button variant="outline" className="w-full" disabled>
                Manage Resources
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default FacilitatorDashboard;
