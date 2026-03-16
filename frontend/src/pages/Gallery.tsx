import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { eventsApi, coursesApi } from "@/lib/api";
import { Play } from "lucide-react";

const Gallery = () => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 = Events, 100 = Courses
  const [events, setEvents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, coursesData] = await Promise.all([
          eventsApi.getAll(),
          coursesApi.getAll(),
        ]);
        setEvents(eventsData.events || []);
        setCourses(coursesData.courses || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Determine which items to display based on slider position
  const displayedItems = sliderPosition < 50 
    ? events.map(e => ({ ...e, type: 'event' }))
    : courses.map(c => ({ ...c, type: 'course' }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        {/* Slider Control - Center */}
        <div className="flex justify-center mb-12">
          <div className="w-32">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-medium text-muted-foreground">Events</span>
              <span className="font-medium text-muted-foreground">Courses</span>
            </div>
            <div className="relative h-6 bg-muted rounded-full overflow-hidden shadow-md">
              {/* Slider background indicator */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                <div className="flex-1 bg-gradient-to-l from-purple-500/20 to-transparent"></div>
              </div>
              
              {/* Draggable slider button */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {/* Visual slider thumb - positioned at left or right */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full shadow-lg transition-all duration-200 flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ left: sliderPosition < 50 ? '0px' : 'auto', right: sliderPosition >= 50 ? '0px' : 'auto' }}
              >
                <div className="w-1 h-3 bg-primary-foreground rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground mb-2 text-center">Gallery</h1>
        <p className="text-muted-foreground mb-8 text-center">
          {sliderPosition < 50 ? "Browse all events" : "Browse all courses"}
        </p>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading gallery...</p>
        ) : (
          <>
            {/* Videos Section */}
            {displayedItems.some(item => item.video) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedItems
                    .filter(item => item.video)
                    .map((item) => (
                      <div key={`${item._id}-video`} className="relative group cursor-pointer">
                        <div 
                          className="relative w-full h-48 bg-black rounded-lg overflow-hidden"
                          onClick={() => setSelectedVideo(item.video)}
                        >
                          <iframe
                            width="100%"
                            height="100%"
                            src={item.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            title={item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                        <div className="mt-3">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{item.category}</span>
                            <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded">
                              {item.type === 'event' ? 'Event' : 'Course'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Images Section */}
            {displayedItems.some(item => item.image) && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedItems
                    .filter(item => item.image)
                    .map((item) => (
                      <div key={`${item._id}-image`} className="relative">
                        <EventCard event={item} />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded">
                          {item.type === 'event' ? 'Event' : 'Course'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {displayedItems.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No {sliderPosition < 50 ? 'events' : 'courses'} found.
              </p>
            )}

            {displayedItems.length > 0 && !displayedItems.some(item => item.video) && !displayedItems.some(item => item.image) && (
              <p className="text-center text-muted-foreground py-12">
                No videos or images available for {sliderPosition < 50 ? 'events' : 'courses'}.
              </p>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;
