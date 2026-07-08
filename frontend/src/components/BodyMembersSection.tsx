import { useState, useEffect } from "react";
import { UserCircle2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BodyMember {
  _id: string;
  name: string;
  role: string;
  department?: string;
  year?: string;
  bio?: string;
  imageUrl?: string;
}

const BodyMembersSection = () => {
  const [members, setMembers] = useState<BodyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BodyMember | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API_URL}/body-members`);
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error("Failed to fetch body members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (!loading && members.length === 0) return null;

  return (
    <>
    <section className="container pt-8 pb-0">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">Our Team</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Meet the dedicated members who make PAIE Cell thrive
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {members.map((member) => (
            <div
              key={member._id}
              className="group flex flex-col items-center text-center gap-3 cursor-pointer"
              onClick={() => setSelected(member)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(member)}
              aria-label={`View ${member.name}'s profile`}
            >
              {/* Avatar */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all duration-300 shrink-0">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <UserCircle2 className="h-12 w-12 text-primary/50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <p className="font-semibold text-foreground text-sm leading-tight">{member.name}</p>
                <p className="text-primary text-xs font-medium mt-0.5">{member.role}</p>
                {(member.department || member.year) && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {[member.department, member.year].filter(Boolean).join(" · ")}
                  </p>
                )}
                {member.bio && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* Full-image popup */}
    {selected && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={() => setSelected(null)}
        role="dialog"
        aria-modal="true"
        aria-label={`${selected.name}'s profile photo`}
      >
        <div
          className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Full image */}
          {selected.imageUrl ? (
            <img
              src={selected.imageUrl}
              alt={selected.name}
              className="w-full object-cover max-h-80"
            />
          ) : (
            <div className="w-full h-64 bg-primary/10 flex items-center justify-center">
              <UserCircle2 className="h-24 w-24 text-primary/50" />
            </div>
          )}

          {/* Details */}
          <div className="p-5">
            <h3 className="font-display font-bold text-lg text-foreground">{selected.name}</h3>
            <p className="text-primary text-sm font-medium mt-0.5">{selected.role}</p>
            {(selected.department || selected.year) && (
              <p className="text-muted-foreground text-sm mt-1">
                {[selected.department, selected.year].filter(Boolean).join(" · ")}
              </p>
            )}
            {selected.bio && (
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{selected.bio}</p>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default BodyMembersSection;
