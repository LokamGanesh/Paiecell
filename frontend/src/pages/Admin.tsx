import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, FileDown, Mail, ExternalLink, LogOut, Menu, X, UserCog, BookOpen, Settings, Image, BarChart3, Loader, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserManagement } from "@/components/UserManagement";
import { EventManagement } from "@/components/EventManagement";
import { CourseManagement } from "@/components/CourseManagement";
import { MediaManagement } from "@/components/MediaManagement";
import { Analytics } from "@/components/Analytics";
import { ProfileDialog } from "@/components/ProfileDialog";
import { YesPlusSettingsDialog } from "@/components/YesPlusSettingsDialog";
import { ExportRegistrations } from "@/components/ExportRegistrations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Analytics", icon: BarChart3, id: "analytics" },
  { label: "Events", icon: Calendar, id: "events" },
  { label: "Courses", icon: BookOpen, id: "courses" },
  { label: "Media", icon: Image, id: "media" },
  { label: "Registrations", icon: Users, id: "registrations" },
  { label: "User Management", icon: UserCog, id: "users" },
  { label: "YES+ Tracking", icon: ExternalLink, id: "tracking" },
  { label: "Export Data", icon: FileDown, id: "export" },
  { label: "Bulk Email", icon: Mail, id: "email" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterEvent, setFilterEvent] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  const [yesPlusSettingsOpen, setYesPlusSettingsOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState<'users-csv' | 'users-excel' | 'registrations-csv' | 'registrations-excel' | null>(null);
  const [yesPlusSettings, setYesPlusSettings] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'facilitator'))) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, usersRes, registrationsRes, coursesRes, yesPlusRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/registrations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings/yesplus/link`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events || []);
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }

        if (registrationsRes.ok) {
          const registrationsData = await registrationsRes.json();
          setRegistrations(registrationsData.registrations || []);
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          // Store courses in a state variable if needed
        }

        if (yesPlusRes.ok) {
          const yesPlusData = await yesPlusRes.json();
          setYesPlusSettings(yesPlusData);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'facilitator')) {
    return null;
  }

  const handleExport = async (type: 'users' | 'registrations', format: 'csv' | 'excel') => {
    try {
      setExportLoading(`${type}-${format}` as any);
      const token = localStorage.getItem('token');
      const endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/${type}/${format}`;
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${type} exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: `Failed to export ${type} as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img src="/paie-logo.png" alt="PAIE Cell" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-display font-bold text-sidebar-foreground">Admin Panel</span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setProfileOpen(true)}
          >
            <Settings className="h-4 w-4" /> My Account
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 bg-background/80 nav-blur border-b border-border px-6 py-4 flex items-center gap-3">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h1>
        </header>

        <main className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Events", value: statsLoading ? "..." : events.length },
                  { label: "Total Users", value: statsLoading ? "..." : users.length },
                  { label: "Registrations", value: statsLoading ? "..." : registrations.length },
                  { label: "Students", value: statsLoading ? "..." : users.filter(u => u.role === 'student').length },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl border border-border p-5 card-shadow">
                    <div className="text-sm text-muted-foreground mb-1">{s.label}</div>
                    <div className="font-display text-3xl font-bold text-card-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-card-foreground mb-4">Recent Events</h3>
                <div className="space-y-3">
                  {statsLoading ? (
                    <p className="text-muted-foreground text-center py-4">Loading...</p>
                  ) : events.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No events yet</p>
                  ) : (
                    events.slice(0, 5).map((e) => (
                      <div key={e._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="font-medium text-card-foreground">{e.title}</div>
                          <div className="text-sm text-muted-foreground">{e.category} • {e.venue}</div>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <Analytics 
              events={events} 
              courses={courses} 
              users={users} 
              registrations={registrations} 
              loading={statsLoading}
            />
          )}

          {activeTab === "events" && <EventManagement />}

          {activeTab === "courses" && <CourseManagement />}

          {activeTab === "media" && <MediaManagement />}

          {activeTab === "registrations" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="text-muted-foreground">View and manage event registrations</p>
                <Select value={filterEvent} onValueChange={setFilterEvent}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by event" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((ev) => (
                      <SelectItem key={ev._id} value={ev._id}>{ev.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {statsLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading registrations...</div>
                ) : registrations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No registrations yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">College</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Year</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Event/Course</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations
                          .filter(r => filterEvent === 'all' || r.event?._id === filterEvent)
                          .map((reg) => (
                          <tr key={reg._id} className="border-t border-border hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm">{reg.userSnapshot?.name || reg.user?.name}</td>
                            <td className="px-4 py-3 text-sm">{reg.userSnapshot?.email || reg.user?.email}</td>
                            <td className="px-4 py-3 text-sm">{reg.userSnapshot?.phone || reg.user?.phone}</td>
                            <td className="px-4 py-3 text-sm">{reg.userSnapshot?.college || reg.user?.college}</td>
                            <td className="px-4 py-3 text-sm">{reg.userSnapshot?.department || reg.user?.department}</td>
                            <td className="px-4 py-3 text-sm">{reg.userSnapshot?.year || reg.user?.year}</td>
                            <td className="px-4 py-3 text-sm">{reg.event?.title || reg.course?.title}</td>
                            <td className="px-4 py-3 text-sm">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                reg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {reg.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && <UserManagement />}

          {activeTab === "tracking" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-card-foreground">YES+ Registration Link</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setYesPlusSettingsOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Link
                  </Button>
                </div>
                <p className="text-muted-foreground mb-6">Manage the registration link for YES+ ASPLACE program.</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Current Link:</span>
                    <span className="text-card-foreground font-medium truncate ml-2">{yesPlusSettings?.link || 'https://asplace.artofliving.org/register'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-card-foreground mb-3">How It Works</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The registration link you set here will be used across the website for all YES+ registration buttons. When you update the link, it will automatically reflect on all pages within 30 seconds.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Current Link:</p>
                  <div className="bg-background rounded p-3 border border-border">
                    <p className="text-xs font-mono break-all text-foreground">
                      {yesPlusSettings?.link || 'https://asplace.artofliving.org/register'}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  You can include UTM parameters in the link if needed for tracking purposes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileDown className="h-6 w-6 text-primary" />
                  <h3 className="font-display font-semibold text-card-foreground">Export Users Data</h3>
                </div>
                <p className="text-muted-foreground mb-6">Download all users information in your preferred format</p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleExport('users', 'csv')}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === 'users-csv' && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => handleExport('users', 'excel')}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === 'users-excel' && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileDown className="h-6 w-6 text-primary" />
                  <h3 className="font-display font-semibold text-card-foreground">Export Registrations Data</h3>
                </div>
                <p className="text-muted-foreground mb-6">Download all registrations information in your preferred format</p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleExport('registrations', 'csv')}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === 'registrations-csv' && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => handleExport('registrations', 'excel')}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === 'registrations-excel' && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    Export Excel
                  </Button>
                </div>
              </div>

              <ExportRegistrations />
            </div>
          )}

          {activeTab === "email" && (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-display font-semibold text-card-foreground mb-2">Bulk Email</h3>
              <p className="text-muted-foreground mb-6">Send notifications and reminders to registered participants</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline">Send Reminder</Button>
                <Button>Send Custom Email</Button>
              </div>
            </div>
          )}
        </main>
      </div>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <YesPlusSettingsDialog 
        open={yesPlusSettingsOpen} 
        onOpenChange={setYesPlusSettingsOpen}
        onSettingsUpdated={() => {
          // Refresh YES+ settings
          const fetchSettings = async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings/yesplus/link`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.ok) {
                const data = await response.json();
                setYesPlusSettings(data);
              }
            } catch (error) {
              console.error('Failed to refresh settings:', error);
            }
          };
          fetchSettings();
        }}
      />
    </div>
  );
};

export default Admin;
