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
import { BookOpen, Trash2, Edit, Plus, Upload, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = ['Technical', 'Soft Skills', 'Leadership', 'Career Development', 'Personal Growth'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  instructor?: string;
  level: string;
  image?: string;
  capacity: number;
  enrollmentCount: number;
  status: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
}

export const CourseManagement = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Technical",
    duration: "",
    instructor: "",
    level: "Beginner",
    image: "",
    video: "",
    capacity: 0,
    status: "upcoming",
    startDate: "",
    endDate: "",
    schedule: "",
    syllabus: ""
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/courses`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Technical",
      duration: "",
      instructor: "",
      level: "Beginner",
      image: "",
      capacity: 0,
      status: "upcoming",
      startDate: "",
      endDate: "",
      schedule: "",
      syllabus: ""
    });
    setEditingCourse(null);
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

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setForm({
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        instructor: course.instructor || "",
        level: course.level,
        image: course.image || "",
        capacity: course.capacity,
        status: course.status,
        startDate: course.startDate ? course.startDate.split('T')[0] : "",
        endDate: course.endDate ? course.endDate.split('T')[0] : "",
        schedule: course.schedule || "",
        syllabus: ""
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.duration) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingCourse 
        ? `${API_URL}/courses/${editingCourse._id}`
        : `${API_URL}/courses`;
      
      const res = await fetch(url, {
        method: editingCourse ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ 
          title: editingCourse ? "Course updated successfully!" : "Course created successfully!" 
        });
        setShowDialog(false);
        resetForm();
        fetchCourses();
      } else {
        toast({
          title: "Failed to save course",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: "Course deleted successfully" });
        fetchCourses();
      } else {
        toast({ title: "Failed to delete course", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error deleting course", variant: "destructive" });
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
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage courses</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrollment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(course.status)}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.enrollmentCount}/{course.capacity || '∞'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course._id)}
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
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details" : "Add a new course to the platform"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Course title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Course Image</Label>
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
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm({ ...form, level: v })}
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g., 4 weeks"
                  required
                />
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

            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="Instructor name"
              />
            </div>

            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                placeholder="e.g., Mon & Wed, 6-8 PM"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
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
              {loading ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
