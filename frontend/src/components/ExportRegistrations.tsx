import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Loader } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Event {
  _id: string;
  title: string;
  date: string;
}

interface Course {
  _id: string;
  title: string;
}

export const ExportRegistrations = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [exportForm, setExportForm] = useState({
    type: "event",
    itemId: "",
    format: "excel"
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const [eventsRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/courses`, {
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
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const handleExport = async () => {
    if (!exportForm.itemId) {
      toast({
        title: "Error",
        description: `Please select an ${exportForm.type}`,
        variant: "destructive"
      });
      return;
    }

    setExporting(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = `${API_URL}/export/${exportForm.type}/${exportForm.itemId}/${exportForm.format}`;
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const selectedItem = exportForm.type === 'event' 
          ? events.find(e => e._id === exportForm.itemId)?.title 
          : courses.find(c => c._id === exportForm.itemId)?.title;
        
        const filename = `${exportForm.type}-registrations-${selectedItem || 'export'}.${exportForm.format === 'excel' ? 'xlsx' : 'csv'}`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Registrations exported successfully",
        });
        setExportDialogOpen(false);
        setExportForm({
          type: "event",
          itemId: "",
          format: "excel"
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to export registrations",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error exporting registrations:", error);
      toast({
        title: "Error",
        description: "Failed to export registrations",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Registrations
          </CardTitle>
          <CardDescription>
            Export registered users data for specific events or courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setExportDialogOpen(true)}
            className="w-full md:w-auto"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Registrations</DialogTitle>
            <DialogDescription>
              Select an event or course to export registered users data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="export-type">Type</Label>
              <Select
                value={exportForm.type}
                onValueChange={(value) =>
                  setExportForm({ ...exportForm, type: value, itemId: "" })
                }
              >
                <SelectTrigger id="export-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="export-item">
                Select {exportForm.type === "event" ? "Event" : "Course"}
              </Label>
              <Select
                value={exportForm.itemId}
                onValueChange={(value) =>
                  setExportForm({ ...exportForm, itemId: value })
                }
              >
                <SelectTrigger id="export-item">
                  <SelectValue placeholder="Choose an item..." />
                </SelectTrigger>
                <SelectContent>
                  {exportForm.type === "event"
                    ? events.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.title}
                        </SelectItem>
                      ))
                    : courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select
                value={exportForm.format}
                onValueChange={(value) =>
                  setExportForm({ ...exportForm, format: value })
                }
              >
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              {exporting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
