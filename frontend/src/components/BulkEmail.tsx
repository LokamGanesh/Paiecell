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
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Bell, Search, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface UserItem {
  _id: string;
  name: string;
  email: string;
}

interface EventItem {
  _id: string;
  title: string;
  date: string;
}

interface CourseItem {
  _id: string;
  title: string;
}

// Target audience options for both reminder and custom email
const AUDIENCE_OPTIONS = [
  { value: "all",        label: "All users in database" },
  { value: "students",   label: "All students" },
  { value: "facilitators", label: "All facilitators" },
  { value: "event",      label: "Users registered for events" },
  { value: "course",     label: "Users registered for courses" },
  { value: "upcoming",   label: "Users registered for upcoming events/courses" },
  { value: "custom",     label: "Select users manually" },
];

export const BulkEmail = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Which dialog is open
  const [dialog, setDialog] = useState<"reminder" | "custom" | null>(null);
  const [sending, setSending] = useState(false);

  // Reminder form
  const [reminderForm, setReminderForm] = useState({
    reminderType: "event" as "event" | "course" | "general",
    itemId: "",
    userType: "all",
    customMessage: "",
  });

  // Custom email form
  const [customForm, setCustomForm] = useState({
    subject: "",
    message: "",
    userType: "all",
    itemId: "",
  });

  // Manual user selection state
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/email/items-for-reminder`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  const fetchAllUsers = async () => {
    if (allUsers.length > 0) return; // already loaded
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const openDialog = (type: "reminder" | "custom") => {
    setDialog(type);
    setSelectedUserIds([]);
    setUserSearch("");
  };

  const closeDialog = () => {
    setDialog(null);
    setReminderForm({ reminderType: "event", itemId: "", userType: "all", customMessage: "" });
    setCustomForm({ subject: "", message: "", userType: "all", itemId: "" });
    setSelectedUserIds([]);
    setUserSearch("");
  };

  const handleAudienceChange = (value: string, isReminder: boolean) => {
    if (isReminder) {
      setReminderForm((f) => ({ ...f, userType: value, itemId: "" }));
    } else {
      setCustomForm((f) => ({ ...f, userType: value, itemId: "" }));
    }
    if (value === "custom") fetchAllUsers();
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Send reminder ──────────────────────────────────────────────────────────
  const handleSendReminder = async () => {
    const { reminderType, itemId, userType, customMessage } = reminderForm;

    if (reminderType !== "general" && !itemId) {
      toast({ title: "Please select an event or course", variant: "destructive" });
      return;
    }
    if (userType === "custom" && selectedUserIds.length === 0) {
      toast({ title: "Please select at least one user", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const body: any = { reminderType, userType, customMessage };
      if (itemId) body.itemId = itemId;
      if (userType === "custom") body.userIds = selectedUserIds;

      const res = await fetch(`${API_URL}/email/send-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Reminder sent!",
          description: `Delivered to ${data.results.sent} user${data.results.sent !== 1 ? "s" : ""}${data.results.failed ? `, ${data.results.failed} failed` : ""}.`,
        });
        closeDialog();
      } else {
        toast({ title: "Failed to send reminder", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send reminder", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // ── Send custom email ──────────────────────────────────────────────────────
  const handleSendCustom = async () => {
    const { subject, message, userType, itemId } = customForm;

    if (!subject.trim()) {
      toast({ title: "Please enter a subject", variant: "destructive" });
      return;
    }
    if (!message.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }
    if ((userType === "event" || userType === "course") && !itemId) {
      toast({ title: "Please select an event or course", variant: "destructive" });
      return;
    }
    if (userType === "custom" && selectedUserIds.length === 0) {
      toast({ title: "Please select at least one user", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const body: any = { subject, message, userType };
      if (itemId) body.itemId = itemId;
      if (userType === "custom") body.userIds = selectedUserIds;

      const res = await fetch(`${API_URL}/email/send-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Email sent!",
          description: `Delivered to ${data.results.sent} user${data.results.sent !== 1 ? "s" : ""}${data.results.failed ? `, ${data.results.failed} failed` : ""}.`,
        });
        closeDialog();
      } else {
        toast({ title: "Failed to send email", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // ── User picker (shared) ───────────────────────────────────────────────────
  const UserPicker = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Select Users</Label>
        {selectedUserIds.length > 0 && (
          <Badge variant="secondary">{selectedUserIds.length} selected</Badge>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {loadingUsers ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="h-52 overflow-y-auto rounded-md border border-border p-2 space-y-1">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No users found</p>
          ) : (
            filteredUsers.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                  className="h-4 w-4 accent-primary rounded"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Bulk Email
          </CardTitle>
          <CardDescription>
            Send reminders and custom emails to targeted groups or individual users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => openDialog("reminder")}
              className="group h-28 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Bell className="w-6 h-6" />
              <span className="font-semibold text-sm">Send Reminder</span>
              <span className="text-xs opacity-70">Event / course / general</span>
            </button>
            <button
              onClick={() => openDialog("custom")}
              className="group h-28 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Send className="w-6 h-6" />
              <span className="font-semibold text-sm">Send Custom Email</span>
              <span className="text-xs opacity-70">Write your own subject &amp; body</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Reminder Dialog ── */}
      <Dialog open={dialog === "reminder"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Send Reminder
            </DialogTitle>
            <DialogDescription>Send an event, course, or general reminder to users</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reminder type */}
            <div>
              <Label>Reminder Type</Label>
              <Select
                value={reminderForm.reminderType}
                onValueChange={(v: any) =>
                  setReminderForm((f) => ({ ...f, reminderType: v, itemId: "" }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event Reminder</SelectItem>
                  <SelectItem value="course">Course Reminder</SelectItem>
                  <SelectItem value="general">General Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event / Course picker */}
            {reminderForm.reminderType !== "general" && (
              <div>
                <Label>
                  {reminderForm.reminderType === "event" ? "Select Event" : "Select Course"}
                </Label>
                <Select
                  value={reminderForm.itemId}
                  onValueChange={(v) => setReminderForm((f) => ({ ...f, itemId: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                  <SelectContent>
                    {(reminderForm.reminderType === "event" ? events : courses).map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.title}
                        {"date" in item && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {new Date((item as EventItem).date).toLocaleDateString()}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Audience */}
            <div>
              <Label>Send To</Label>
              <Select
                value={reminderForm.userType}
                onValueChange={(v) => handleAudienceChange(v, true)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manual user picker */}
            {reminderForm.userType === "custom" && <UserPicker />}

            {/* Custom message */}
            <div>
              <Label>Additional Message <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="Add a personal note to the reminder…"
                value={reminderForm.customMessage}
                onChange={(e) => setReminderForm((f) => ({ ...f, customMessage: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={closeDialog}>Cancel</Button>
              <Button className="flex-1" onClick={handleSendReminder} disabled={sending}>
                {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : <><Send className="w-4 h-4 mr-2" />Send Reminder</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Custom Email Dialog ── */}
      <Dialog open={dialog === "custom"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" /> Send Custom Email
            </DialogTitle>
            <DialogDescription>Compose and send an email to a targeted group</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Subject */}
            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Email subject…"
                value={customForm.subject}
                onChange={(e) => setCustomForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>

            {/* Audience */}
            <div>
              <Label>Send To *</Label>
              <Select
                value={customForm.userType}
                onValueChange={(v) => handleAudienceChange(v, false)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event / Course picker */}
            {(customForm.userType === "event" || customForm.userType === "course") && (
              <div>
                <Label>
                  {customForm.userType === "event" ? "Select Event" : "Select Course"}
                </Label>
                <Select
                  value={customForm.itemId}
                  onValueChange={(v) => setCustomForm((f) => ({ ...f, itemId: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                  <SelectContent>
                    {(customForm.userType === "event" ? events : courses).map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.title}
                        {"date" in item && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {new Date((item as EventItem).date).toLocaleDateString()}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Manual user picker */}
            {customForm.userType === "custom" && <UserPicker />}

            {/* Message */}
            <div>
              <Label>Message *</Label>
              <Textarea
                placeholder="Write your email message here…"
                value={customForm.message}
                onChange={(e) => setCustomForm((f) => ({ ...f, message: e.target.value }))}
                className="min-h-[140px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={closeDialog}>Cancel</Button>
              <Button className="flex-1" onClick={handleSendCustom} disabled={sending}>
                {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : <><Send className="w-4 h-4 mr-2" />Send Email</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
