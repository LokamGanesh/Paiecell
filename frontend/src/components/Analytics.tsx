import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsProps {
  events: any[];
  courses: any[];
  users: any[];
  registrations: any[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

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
    let filteredRegs = registrations;
    if (selectedEvent !== "all") {
      filteredRegs = filteredRegs.filter(r => r.event?._id === selectedEvent);
    }
    if (selectedCourse !== "all") {
      filteredRegs = filteredRegs.filter(r => r.course?._id === selectedCourse);
    }

    const totalUsers = users.length;
    const studentUsers = users.filter(u => u.role === 'student').length;
    const facilitatorUsers = users.filter(u => u.role === 'facilitator').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    const totalRegistrations = filteredRegs.length;
    const confirmedRegs = filteredRegs.filter(r => r.status === 'confirmed').length;
    const pendingRegs = filteredRegs.filter(r => r.status === 'pending').length;
    const cancelledRegs = filteredRegs.filter(r => r.status === 'cancelled').length;
    const attendedRegs = filteredRegs.filter(r => r.status === 'attended').length;

    const eventRegs = filteredRegs.filter(r => r.type === 'event');
    const courseRegs = filteredRegs.filter(r => r.type === 'course');

    const departmentMap: { [key: string]: number } = {};
    filteredRegs.forEach(reg => {
      const dept = reg.userSnapshot?.department || reg.user?.department || 'Unknown';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;
    });
    const departmentData = Object.entries(departmentMap).map(([name, value]) => ({
      name,
      value
    }));

    const statusData = [
      { name: 'Confirmed', value: confirmedRegs },
      { name: 'Pending', value: pendingRegs },
      { name: 'Attended', value: attendedRegs },
      { name: 'Cancelled', value: cancelledRegs }
    ].filter(d => d.value > 0);

    const roleData = [
      { name: 'Students', value: studentUsers },
      { name: 'Facilitators', value: facilitatorUsers },
      { name: 'Admins', value: adminUsers }
    ].filter(d => d.value > 0);

    const collegeMap: { [key: string]: number } = {};
    filteredRegs.forEach(reg => {
      const college = reg.userSnapshot?.college || reg.user?.college || 'Unknown';
      collegeMap[college] = (collegeMap[college] || 0) + 1;
    });
    const collegeData = Object.entries(collegeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.substring(0, 15), value }));

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
      statusData,
      roleData,
      collegeData
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Real-time insights and statistics</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-full sm:w-[250px] bg-white">
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
          <SelectTrigger className="w-full sm:w-[250px] bg-white">
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

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Line Chart - Registrations Trend */}
        <Card className="lg:col-span-2 p-6 bg-white shadow-sm border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analyticsData.departmentData || []}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Donut Chart - Status Distribution */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h3>
          {analyticsData.statusData && analyticsData.statusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analyticsData.statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 w-full">
                {analyticsData.statusData.map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No data</p>
          )}
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white shadow-sm border-0">
          <p className="text-sm text-gray-600 font-medium mb-2">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.totalUsers || 0}</p>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-0">
          <p className="text-sm text-gray-600 font-medium mb-2">Total Registrations</p>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.totalRegistrations || 0}</p>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-0">
          <p className="text-sm text-gray-600 font-medium mb-2">Confirmed</p>
          <p className="text-3xl font-bold text-green-600">{analyticsData.confirmedRegs || 0}</p>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-0">
          <p className="text-sm text-gray-600 font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{analyticsData.pendingRegs || 0}</p>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-0">
          <p className="text-sm text-gray-600 font-medium mb-2">Attended</p>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.attendedRegs || 0}</p>
        </Card>
        <Card className="p-4 bg-white shadow-sm border-0">
          <p className="text-sm text-gray-600 font-medium mb-2">Cancelled</p>
          <p className="text-3xl font-bold text-red-600">{analyticsData.cancelledRegs || 0}</p>
        </Card>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrations by Department</h3>
          {analyticsData.departmentData && analyticsData.departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data</p>
          )}
        </Card>

        {/* College Distribution */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Colleges</h3>
          {analyticsData.collegeData && analyticsData.collegeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.collegeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data</p>
          )}
        </Card>
      </div>

      {/* User Roles & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles</h3>
          {analyticsData.roleData && analyticsData.roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.roleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No data</p>
          )}
        </Card>

        {/* Summary Stats */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Students</span>
              <span className="text-2xl font-bold text-gray-900">{analyticsData.studentUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Facilitators</span>
              <span className="text-2xl font-bold text-gray-900">{analyticsData.facilitatorUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Admins</span>
              <span className="text-2xl font-bold text-gray-900">{analyticsData.adminUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Event Registrations</span>
              <span className="text-2xl font-bold text-gray-900">{analyticsData.eventRegs || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Course Registrations</span>
              <span className="text-2xl font-bold text-gray-900">{analyticsData.courseRegs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Engagement Rate</span>
              <span className="text-2xl font-bold text-blue-600">{analyticsData.totalRegistrations > 0 ? Math.round((analyticsData.confirmedRegs / analyticsData.totalRegistrations) * 100) : 0}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
