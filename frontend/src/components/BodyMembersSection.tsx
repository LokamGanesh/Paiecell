import { useState, useEffect } from "react";
import { UserCircle2 } from "lucide-react";

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
              className="group flex flex-col items-center text-center gap-3"
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
  );
};

export default BodyMembersSection;
