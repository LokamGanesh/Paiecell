import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useState, useEffect } from "react";
import { eventsApi } from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";

const stats = [
  { icon: Users, label: "Students Empowered", value: "2,000+" },
  { icon: Calendar, label: "Events Conducted", value: "150+" },
  { icon: Sparkles, label: "Programs Offered", value: "6" },
];

const Index = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { yesPlusSettings } = useSettings();

  const yesPlusLink = yesPlusSettings?.link || 'https://asplace.artofliving.org/register';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getAll();
        const upcoming = (data.events || [])
          .filter((e: any) => new Date(e.date) >= new Date())
          .slice(0, 3);
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="relative container py-24 md:py-36 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5" />
            Youth Empowerment & Wellness
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground max-w-3xl leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Transform Your College Life with <span className="text-gradient">PAIE Cell</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Discover powerful programs combining meditation, leadership skills, and personal growth. Join thousands of students on a journey of self-discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/events">
              <Button size="lg" className="gap-2 text-base px-8">
                Explore Events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={yesPlusLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                Register for YES+
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-6 card-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-card-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">Don't miss out on these transformative experiences</p>
          </div>
          <Link to="/events" className="hidden md:flex">
            <Button variant="ghost" className="gap-1 text-primary">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground py-8">Loading events...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">No upcoming events at the moment</p>
          ) : (
            upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </div>
        <div className="mt-6 flex justify-center md:hidden">
          <Link to="/events">
            <Button variant="ghost" className="gap-1 text-primary">
              View All Events <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* YES+ CTA */}
      <section className="container pb-20">
        <div className="rounded-2xl bg-hero-gradient p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready for the YES+ Experience?
          </h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto mb-6 text-lg">
            Join the internationally acclaimed Youth Empowerment & Skills program by The Art of Living.
          </p>
          <a href={yesPlusLink} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="secondary" className="gap-2 text-base">
              Register for YES+ <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
