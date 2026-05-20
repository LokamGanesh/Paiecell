import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X, ZoomIn } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CloudinaryResource {
  publicId: string;
  url: string;
  resourceType: string;
  format: string;
  width: number;
  height: number;
  createdAt: string;
  displayName: string;
}

const Gallery = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'courses'>('events');
  const [eventsMedia, setEventsMedia] = useState<CloudinaryResource[]>([]);
  const [coursesMedia, setCoursesMedia] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    fetchCloudinaryMedia();
  }, []);

  const fetchCloudinaryMedia = async () => {
    setLoading(true);
    try {
      const [eventsRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/media/cloudinary/events`),
        fetch(`${API_URL}/media/cloudinary/courses`)
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEventsMedia(data.resources || []);
      }
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCoursesMedia(data.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch Cloudinary media:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMedia = activeTab === 'events' ? eventsMedia : coursesMedia;
  const images = currentMedia.filter(r => r.resourceType === 'image');
  const videos = currentMedia.filter(r => r.resourceType === 'video');

  const openLightbox = (url: string, type: 'image' | 'video') => {
    setLightboxUrl(url);
    setLightboxType(type);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-24 pb-20">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2 text-center">Gallery</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Photos and videos from our events and courses
        </p>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full border border-border bg-muted p-1 gap-1">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Events
              {eventsMedia.length > 0 && (
                <span className="ml-2 text-xs opacity-70">({eventsMedia.length})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'courses'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Courses
              {coursesMedia.length > 0 && (
                <span className="ml-2 text-xs opacity-70">({coursesMedia.length})</span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : currentMedia.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No media found in {activeTab} gallery.
            </p>
          </div>
        ) : (
          <>
            {/* Videos Section */}
            {videos.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Videos <span className="text-sm text-muted-foreground font-normal">({videos.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((item) => (
                    <div
                      key={item.publicId}
                      className="group relative rounded-xl overflow-hidden bg-black cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                      onClick={() => openLightbox(item.url, 'video')}
                    >
                      <video
                        src={item.url}
                        className="w-full h-52 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-sm font-medium capitalize truncate">{item.displayName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Section */}
            {images.length > 0 && (
              <div>
                {videos.length > 0 && (
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Photos <span className="text-sm text-muted-foreground font-normal">({images.length})</span>
                  </h2>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((item) => (
                    <div
                      key={item.publicId}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                      onClick={() => openLightbox(item.url, 'image')}
                    >
                      <img
                        src={item.url}
                        alt={item.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={closeLightbox}
          >
            <X className="h-8 w-8" />
          </button>
          <div
            className="max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxType === 'image' ? (
              <img
                src={lightboxUrl}
                alt="Gallery"
                className="w-full h-full object-contain max-h-[90vh] rounded-lg"
              />
            ) : (
              <video
                src={lightboxUrl}
                controls
                autoPlay
                className="w-full max-h-[90vh] rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
