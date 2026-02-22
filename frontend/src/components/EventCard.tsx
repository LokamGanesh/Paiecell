import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CATEGORY_COLORS: Record<string, string> = {
  Workshop: "bg-blue-500",
  Seminar: "bg-purple-500",
  Corporate: "bg-green-500",
  Cultural: "bg-pink-500",
  Technical: "bg-orange-500",
  Sports: "bg-red-500",
  "Technical": "bg-indigo-500",
  "Soft Skills": "bg-teal-500",
  "Leadership": "bg-amber-500",
  "Career Development": "bg-cyan-500",
  "Personal Growth": "bg-violet-500",
};

const EventCard = ({ event }: { event: any }) => {
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="group rounded-xl border border-border bg-card card-shadow hover:card-hover-shadow transition-all duration-300 overflow-hidden flex flex-col">
      {event.image && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`${CATEGORY_COLORS[event.category] || 'bg-gray-500'} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
            {event.category}
          </span>
          {isPast && (
            <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              Past
            </span>
          )}
        </div>
        <h3 className="font-display font-bold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed line-clamp-3">
          {event.description}
        </p>
        <div className="flex flex-col gap-1.5 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {event.time && ` • ${event.time}`}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {event.venue}
          </div>
        </div>
        {!isPast && (
          event.isExternal ? (
            <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2">
                Register <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          ) : (
            <Link to={`/register?event=${event._id}`}>
              <Button className="w-full">Register Now</Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default EventCard;
