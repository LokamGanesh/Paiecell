import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { coursesApi } from "@/lib/api";

const Courses = () => {
  const [active, setActive] = useState<string>("All");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesApi.getAll();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = ["All", ...Array.from(new Set(courses.map(c => c.category)))];
  const filtered = active === "All" ? courses : courses.filter((c) => c.category === active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Courses</h1>
        <p className="text-muted-foreground mb-8">Explore our transformative programs — YES+, Sahaj, DSN & more</p>

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
          <p className="text-center text-muted-foreground py-12">Loading courses...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <EventCard key={course._id} event={course} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No courses found in this category.</p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
