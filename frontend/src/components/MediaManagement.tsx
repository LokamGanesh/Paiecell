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
import { Image, Video, Trash2, Edit, Plus, Upload, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Media {
  _id: string;
  title: string;
  description: string;
  type: 'event' | 'course';
  itemId: string;
  itemTitle: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  createdAt: string;
}

export const MediaManagement = () => {
  const { toast } = useToast();
  const [media, setMedia] = useState<Media[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "event" as 'event' | 'course',
    itemId: "",
    mediaType: "image" as 'image' | 'video',
    mediaUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch completed events and courses
      const [eventsRes, coursesRes, mediaRes] = await Promise.all([
        fetch(`${API_URL}/events?status=completed`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/courses?status=completed`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/media`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }

      if (mediaRes.ok) {
        const data = await mediaRes.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "event",
      itemId: "",
      mediaType: "image",
      mediaUrl: ""
    });
    setEditingMedia(null);
  };

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('media', file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/upload/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const mediaUrl = `${API_URL.replace('/api', '')}${data.mediaUrl}`;
        setForm({ ...form, mediaUrl });
        toast({ title: "Media uploaded successfully!" });
      } else {
        toast({
          title: "Failed to upload media",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = form.mediaType === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: form.mediaType === 'image' ? "Image must be less than 5MB" : "Video must be less than 100MB",
          variant: "destructive",
        });
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleOpenDialog = (mediaItem?: Media) => {
    if (mediaItem) {
      setEditingMedia(mediaItem);
      setForm({
        title: mediaItem.title,
        description: mediaItem.description,
        type: mediaItem.type,
        itemId: mediaItem.itemId,
        mediaType: mediaItem.mediaType,
        mediaUrl: mediaItem.mediaUrl
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.itemId || !form.mediaUrl) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingMedia 
        ? `${API_URL}/media/${editingMedia._id}`
        : `${API_URL}/media`;
      
      const res = await fetch(url, {
        method: editingMedia ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ 
          title: editingMedia ? "Media updated successfully!" : "Media added successfully!" 
        });
        setShowDialog(false);
        resetForm();
        fetchData();
      } else {
        toast({
          title: "Failed to save media",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save media",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/media/${mediaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: "Media deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Failed to delete media", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error deleting media", variant: "destructive" });
    }
  };

  const getItemTitle = (type: string, itemId: string) => {
    if (type === 'event') {
      return events.find(e => e._id === itemId)?.title || 'Unknown Event';
    } else {
      return courses.find(c => c._id === itemId)?.title || 'Unknown Course';
    }
  };

  const getAvailableItems = () => {
    return form.type === 'event' ? events : courses;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Media Management</h2>
          <p className="text-muted-foreground">Add images and videos for completed events and courses</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Media
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Media Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading media...
                </TableCell>
              </TableRow>
            ) : media.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No media found
                </TableCell>
              </TableRow>
            ) : (
              media.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.type === 'event' ? 'Event' : 'Course'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.mediaType === 'image' ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      {item.mediaType}
                    </div>
                  </TableCell>
                  <TableCell>{item.itemTitle}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
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
            <DialogTitle>{editingMedia ? "Edit Media" : "Add New Media"}</DialogTitle>
            <DialogDescription>
              {editingMedia ? "Update media details" : "Add images or videos for completed events and courses"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Media title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Media description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as 'event' | 'course', itemId: "" })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mediaType">Media Type *</Label>
                <Select
                  value={form.mediaType}
                  onValueChange={(v) => setForm({ ...form, mediaType: v as 'image' | 'video' })}
                >
                  <SelectTrigger id="mediaType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="itemId">Select {form.type === 'event' ? 'Event' : 'Course'} *</Label>
              <Select
                value={form.itemId}
                onValueChange={(v) => setForm({ ...form, itemId: v })}
              >
                <SelectTrigger id="itemId">
                  <SelectValue placeholder={`Select a completed ${form.type}`} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableItems().map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mediaUrl">Media URL</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="mediaUrl"
                    value={form.mediaUrl}
                    onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                    placeholder={form.mediaType === 'image' ? "Or paste image URL" : "Or paste video URL"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('mediaFile')?.click()}
                    disabled={uploadingFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingFile ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    id="mediaFile"
                    type="file"
                    accept={form.mediaType === 'image' ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {form.mediaUrl && (
                  <div className="relative">
                    {form.mediaType === 'image' ? (
                      <img 
                        src={form.mediaUrl} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                        }}
                      />
                    ) : (
                      <video 
                        src={form.mediaUrl}
                        className="w-full h-40 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setForm({ ...form, mediaUrl: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : editingMedia ? "Update Media" : "Add Media"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
