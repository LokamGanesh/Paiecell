import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { eventsApi } from "@/lib/api";

const Events = () => {
  const [active, setActive] = useState<string>("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getAll();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = ["All", ...Array.from(new Set(events.map(e => e.category)))];
  const filtered = active === "All" ? events : events.filter((e) => e.category === active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">All Events</h1>
        <p className="text-muted-foreground mb-8">Browse our upcoming and past events across all categories</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading events...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No events found in this category.</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Events;
