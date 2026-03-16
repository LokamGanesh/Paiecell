import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, BookOpen, TrendingUp } from "lucide-react";

interface AnalyticsProps {
  events: any[];
  courses: any[];
  users: any[];
  registrations: any[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Analytics = ({ events, courses, users, registrations, loading }: AnalyticsProps) => {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [analyticsData, setAnalyticsData] = useState<any>({});

  useEffect(() => {
    if (!loading) {
      calculateAnalytics();
    }
  }, [events, courses, users, registrations, selectedEvent, selectedCourse, loading]);

  const calculateAnalytics = () => {
    // Filter registrations based on selection
    let filteredRegs = registrations;
    if (selectedEvent !== "all") {
      filteredRegs = filteredRegs.filter(r => r.event?._id === selectedEvent);
    }
    if (selectedCourse !== "all") {
      filteredRegs = filteredRegs.filter(r => r.course?._id === selectedCourse);
    }

    // User statistics
    const totalUsers = users.length;
    const studentUsers = users.filter(u => u.role === 'student').length;
    const facilitatorUsers = users.filter(u => u.role === 'facilitator').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    // Registration statistics
    const totalRegistrations = filteredRegs.length;
    const confirmedRegs = filteredRegs.filter(r => r.status === 'confirmed').length;
    const pendingRegs = filteredRegs.filter(r => r.status === 'pending').length;
    const cancelledRegs = filteredRegs.filter(r => r.status === 'cancelled').length;
    const attendedRegs = filteredRegs.filter(r => r.status === 'attended').length;

    // Event statistics
    const eventRegs = filteredRegs.filter(r => r.type === 'event');
    const courseRegs = filteredRegs.filter(r => r.type === 'course');

    // Department distribution
    const departmentMap: { [key: string]: number } = {};
    filteredRegs.forEach(reg => {
      const dept = reg.userSnapshot?.department || reg.user?.department || 'Unknown';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;
    });
    const departmentData = Object.entries(departmentMap).map(([name, value]) => ({
      name,
      value
    }));

    // Year distribution
    const yearMap: { [key: string]: number } = {};
    filteredRegs.forEach(reg => {
      const year = reg.userSnapshot?.year || reg.user?.year || 'Unknown';
      yearMap[year] = (yearMap[year] || 0) + 1;
    });
    const yearData = Object.entries(yearMap).map(([name, value]) => ({
      name,
      value
    }));

    // Event-wise registrations
    const eventRegData = events.map(event => ({
      name: event.title,
      registrations: registrations.filter(r => r.event?._id === event._id && r.status !== 'cancelled').length,
      capacity: event.capacity || 0
    }));

    // Course-wise enrollments
    const courseEnrollData = courses.map(course => ({
      name: course.title,
      enrollments: registrations.filter(r => r.course?._id === course._id && r.status !== 'cancelled').length,
      capacity: course.capacity || 0
    }));

    // Registration status distribution
    const statusData = [
      { name: 'Confirmed', value: confirmedRegs },
      { name: 'Pending', value: pendingRegs },
      { name: 'Attended', value: attendedRegs },
      { name: 'Cancelled', value: cancelledRegs }
    ].filter(d => d.value > 0);

    // User role distribution
    const roleData = [
      { name: 'Students', value: studentUsers },
      { name: 'Facilitators', value: facilitatorUsers },
      { name: 'Admins', value: adminUsers }
    ].filter(d => d.value > 0);

    // College distribution (top 10)
    const collegeMap: { [key: string]: number } = {};
    filteredRegs.forEach(reg => {
      const college = reg.userSnapshot?.college || reg.user?.college || 'Unknown';
      collegeMap[college] = (collegeMap[college] || 0) + 1;
    });
    const collegeData = Object.entries(collegeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    setAnalyticsData({
      totalUsers,
      studentUsers,
      facilitatorUsers,
      adminUsers,
      totalRegistrations,
      confirmedRegs,
      pendingRegs,
      cancelledRegs,
      attendedRegs,
      eventRegs: eventRegs.length,
      courseRegs: courseRegs.length,
      departmentData,
      yearData,
      eventRegData,
      courseEnrollData,
      statusData,
      roleData,
      collegeData
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((ev) => (
              <SelectItem key={ev._id} value={ev._id}>{ev.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.totalUsers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.totalRegistrations || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.confirmedRegs || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Attended</p>
              <p className="text-2xl font-bold text-foreground">{analyticsData.attendedRegs || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Registration Status */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Registration Status</h3>
            {analyticsData.statusData && analyticsData.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>

          {/* User Role Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">User Role Distribution</h3>
            {analyticsData.roleData && analyticsData.roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {/* Department Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Registrations by Department</h3>
            {analyticsData.departmentData && analyticsData.departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>

          {/* Year Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Registrations by Year</h3>
            {analyticsData.yearData && analyticsData.yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>

          {/* College Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Top 10 Colleges</h3>
            {analyticsData.collegeData && analyticsData.collegeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.collegeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Event-wise Registrations */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Event-wise Registrations</h3>
            {analyticsData.eventRegData && analyticsData.eventRegData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.eventRegData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="registrations" fill="#3b82f6" name="Registrations" />
                  <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No events available</p>
            )}
          </Card>

          {/* Event Details Table */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Event Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Event Name</th>
                    <th className="px-4 py-2 text-left">Registrations</th>
                    <th className="px-4 py-2 text-left">Capacity</th>
                    <th className="px-4 py-2 text-left">Occupancy %</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.eventRegData && analyticsData.eventRegData.map((event: any) => (
                    <tr key={event.name} className="border-t border-border">
                      <td className="px-4 py-2">{event.name}</td>
                      <td className="px-4 py-2">{event.registrations}</td>
                      <td className="px-4 py-2">{event.capacity || 'Unlimited'}</td>
                      <td className="px-4 py-2">
                        {event.capacity > 0 ? `${Math.round((event.registrations / event.capacity) * 100)}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {/* Course-wise Enrollments */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Course-wise Enrollments</h3>
            {analyticsData.courseEnrollData && analyticsData.courseEnrollData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.courseEnrollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#10b981" name="Enrollments" />
                  <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No courses available</p>
            )}
          </Card>

          {/* Course Details Table */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Course Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Course Name</th>
                    <th className="px-4 py-2 text-left">Enrollments</th>
                    <th className="px-4 py-2 text-left">Capacity</th>
                    <th className="px-4 py-2 text-left">Occupancy %</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.courseEnrollData && analyticsData.courseEnrollData.map((course: any) => (
                    <tr key={course.name} className="border-t border-border">
                      <td className="px-4 py-2">{course.name}</td>
                      <td className="px-4 py-2">{course.enrollments}</td>
                      <td className="px-4 py-2">{course.capacity || 'Unlimited'}</td>
                      <td className="px-4 py-2">
                        {course.capacity > 0 ? `${Math.round((course.enrollments / course.capacity) * 100)}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Students</p>
            <p className="text-xl font-bold text-foreground">{analyticsData.studentUsers || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Facilitators</p>
            <p className="text-xl font-bold text-foreground">{analyticsData.facilitatorUsers || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Admins</p>
            <p className="text-xl font-bold text-foreground">{analyticsData.adminUsers || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Event Regs</p>
            <p className="text-xl font-bold text-foreground">{analyticsData.eventRegs || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Course Regs</p>
            <p className="text-xl font-bold text-foreground">{analyticsData.courseRegs || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-foreground">{analyticsData.pendingRegs || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
