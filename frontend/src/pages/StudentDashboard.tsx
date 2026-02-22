import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, BookOpen, LogOut, User, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProfileDialog } from "@/components/ProfileDialog";
import { registrationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await registrationsApi.getMy();
        setRegistrations(data.registrations || []);
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const handleCancelRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    try {
      await registrationsApi.cancel(id);
      setRegistrations(registrations.filter(r => r._id !== id));
      toast({ title: "Registration cancelled successfully" });
    } catch (error) {
      toast({
        title: "Failed to cancel registration",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  };

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
              <p className="text-muted-foreground">Your student dashboard</p>
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
                  <span className="text-muted-foreground">College:</span>
                  <span className="text-card-foreground">{user?.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="text-card-foreground">{user?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="text-card-foreground">{user?.year}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 card-shadow">
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-display font-semibold text-card-foreground mb-2">My Registrations</h3>
              {loading ? (
                <p className="text-muted-foreground text-sm mb-4">Loading...</p>
              ) : registrations.length === 0 ? (
                <>
                  <p className="text-muted-foreground text-sm mb-4">
                    You haven't registered for any events yet.
                  </p>
                  <Link to="/events">
                    <Button className="w-full">Browse Events</Button>
                  </Link>
                </>
              ) : (
                <div className="space-y-3">
                  {registrations.slice(0, 3).map((reg) => (
                    <div key={reg._id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reg.event?.title || reg.course?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reg.event?.date ? new Date(reg.event.date).toLocaleDateString() : reg.course?.duration}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelRegistration(reg._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {registrations.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{registrations.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/events" className="block">
              <div className="bg-card rounded-xl border border-border p-6 card-shadow hover:shadow-lg transition-shadow">
                <Calendar className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-card-foreground mb-2">Upcoming Events</h3>
                <p className="text-muted-foreground text-sm">
                  Discover and register for workshops, seminars, and activities
                </p>
              </div>
            </Link>

            <Link to="/courses" className="block">
              <div className="bg-card rounded-xl border border-border p-6 card-shadow hover:shadow-lg transition-shadow">
                <BookOpen className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-card-foreground mb-2">Courses</h3>
                <p className="text-muted-foreground text-sm">
                  Explore available courses and learning opportunities
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default StudentDashboard;
