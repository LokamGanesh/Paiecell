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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export const BulkEmail = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [customEmailDialogOpen, setCustomEmailDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [reminderForm, setReminderForm] = useState({
    reminderType: "event",
    itemId: "",
    userType: "all",
    customMessage: ""
  });

  const [customEmailForm, setCustomEmailForm] = useState({
    subject: "",
    message: "",
    userType: "all"
  });

  useEffect(() => {
    fetchItemsForReminder();
  }, []);

  const fetchItemsForReminder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/email/items-for-reminder`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const handleSetReminder = async () => {
    if (!reminderForm.reminderType) {
      toast({
        title: "Error",
        description: "Please select a reminder type",
        variant: "destructive"
      });
      return;
    }

    if (reminderForm.reminderType !== "general" && !reminderForm.itemId) {
      toast({
        title: "Error",
        description: "Please select an event or course",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/email/send-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reminderForm)
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Success",
          description: `Reminder sent to ${data.results.sent} users. Failed: ${data.results.failed}`,
        });
        setReminderDialogOpen(false);
        setReminderForm({
          reminderType: "event",
          itemId: "",
          userType: "all",
          customMessage: ""
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to send reminder",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!customEmailForm.subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive"
      });
      return;
    }

    if (!customEmailForm.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/email/send-custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(customEmailForm)
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Success",
          description: `Email sent to ${data.results.sent} users. Failed: ${data.results.failed}`,
        });
        setCustomEmailDialogOpen(false);
        setCustomEmailForm({
          subject: "",
          message: "",
          userType: "all"
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to send email",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending custom email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Bulk Email Management
          </CardTitle>
          <CardDescription>
            Send reminders and custom emails to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setReminderDialogOpen(true)}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <AlertCircle className="w-6 h-6" />
              <span>Send Reminder</span>
            </Button>
            <Button
              onClick={() => setCustomEmailDialogOpen(true)}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <Send className="w-6 h-6" />
              <span>Send Custom Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Send event or course reminders to users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reminder-type">Reminder Type</Label>
              <Select
                value={reminderForm.reminderType}
                onValueChange={(value) =>
                  setReminderForm({ ...reminderForm, reminderType: value, itemId: "" })
                }
              >
                <SelectTrigger id="reminder-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event Reminder</SelectItem>
                  <SelectItem value="course">Course Reminder</SelectItem>
                  <SelectItem value="general">General Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reminderForm.reminderType !== "general" && (
              <div>
                <Label htmlFor="item-select">
                  {reminderForm.reminderType === "event" ? "Select Event" : "Select Course"}
                </Label>
                <Select
                  value={reminderForm.itemId}
                  onValueChange={(value) =>
                    setReminderForm({ ...reminderForm, itemId: value })
                  }
                >
                  <SelectTrigger id="item-select">
                    <SelectValue placeholder="Choose an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderForm.reminderType === "event"
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
            )}

            <div>
              <Label htmlFor="user-type">Send To</Label>
              <Select
                value={reminderForm.userType}
                onValueChange={(value) =>
                  setReminderForm({ ...reminderForm, userType: value })
                }
              >
                <SelectTrigger id="user-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="registered">Registered Users</SelectItem>
                  <SelectItem value="unregistered">Unregistered Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Textarea
                id="custom-message"
                placeholder="Add a custom message to the reminder..."
                value={reminderForm.customMessage}
                onChange={(e) =>
                  setReminderForm({ ...reminderForm, customMessage: e.target.value })
                }
                className="min-h-24"
              />
            </div>

            <Button
              onClick={handleSetReminder}
              disabled={sendingEmail}
              className="w-full"
            >
              {sendingEmail ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reminder
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Email Dialog */}
      <Dialog open={customEmailDialogOpen} onOpenChange={setCustomEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Custom Email</DialogTitle>
            <DialogDescription>
              Send a custom email to users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Email subject..."
                value={customEmailForm.subject}
                onChange={(e) =>
                  setCustomEmailForm({ ...customEmailForm, subject: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Email message..."
                value={customEmailForm.message}
                onChange={(e) =>
                  setCustomEmailForm({ ...customEmailForm, message: e.target.value })
                }
                className="min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="email-user-type">Send To</Label>
              <Select
                value={customEmailForm.userType}
                onValueChange={(value) =>
                  setCustomEmailForm({ ...customEmailForm, userType: value })
                }
              >
                <SelectTrigger id="email-user-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="facilitators">Facilitators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSendCustomEmail}
              disabled={sendingEmail}
              className="w-full"
            >
              {sendingEmail ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 