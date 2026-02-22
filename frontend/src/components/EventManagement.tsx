import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Edit, Plus, Upload, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = ['Workshop', 'Seminar', 'Corporate', 'Cultural', 'Technical', 'Sports'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  endDate?: string;
  duration: number;
  time: string;
  endTime?: string;
  venue: string;
  image?: string;
  capacity: number;
  registrationCount: number;
  status: string;
  isExternal: boolean;
  externalLink?: string;
}

export const EventManagement = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Workshop",
    date: "",
    endDate: "",
    duration: 1,
    time: "",
    endTime: "",
    venue: "",
    image: "",
    capacity: 0,
    isExternal: false,
    externalLink: "",
    status: "upcoming"
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Workshop",
      date: "",
      endDate: "",
      duration: 1,
      time: "",
      endTime: "",
      venue: "",
      image: "",
      capacity: 0,
      isExternal: false,
      externalLink: "",
      status: "upcoming"
    });
    setEditingEvent(null);
    setImageFile(null);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const imageUrl = `${API_URL.replace('/api', '')}${data.imageUrl}`;
        setForm({ ...form, image: imageUrl });
        toast({ title: "Image uploaded successfully!" });
      } else {
        toast({
          title: "Failed to upload image",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setForm({
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date.split('T')[0],
        endDate: event.endDate ? event.endDate.split('T')[0] : "",
        duration: event.duration || 1,
        time: event.time,
        endTime: event.endTime || "",
        venue: event.venue,
        image: event.image || "",
        capacity: event.capacity,
        isExternal: event.isExternal,
        externalLink: event.externalLink || "",
        status: event.status
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.date || !form.time || !form.venue) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingEvent 
        ? `${API_URL}/events/${editingEvent._id}`
        : `${API_URL}/events`;
      
      const res = await fetch(url, {
        method: editingEvent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ 
          title: editingEvent ? "Event updated successfully!" : "Event created successfully!" 
        });
        setShowDialog(false);
        resetForm();
        fetchEvents();
      } else {
        toast({
          title: "Failed to save event",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: "Event deleted successfully" });
        fetchEvents();
      } else {
        toast({ title: "Failed to delete event", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error deleting event", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      upcoming: "bg-blue-500",
      ongoing: "bg-green-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-muted-foreground">Create and manage events</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading events...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.registrationCount}/{event.capacity || '∞'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(event._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update event details" : "Add a new event to the platform"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Event description"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Event Image</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Or paste image URL"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('imageFile')?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>
                {form.image && (
                  <div className="relative">
                    <img 
                      src={form.image} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setForm({ ...form, image: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Start Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  min={form.date}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty for single-day event</p>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground mt-1">Number of days the event will run</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Start Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Event venue"
                required
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacity (0 for unlimited)</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
