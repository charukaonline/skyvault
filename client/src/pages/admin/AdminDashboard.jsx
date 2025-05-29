import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Camera,
  ShoppingCart,
  DollarSign,
  Activity,
  Eye,
  Ban,
  CheckCircle,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalBuyers: 0,
    pendingCreators: 0,
    totalSales: 0,
    revenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    // Check if user is admin and logged in
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      showError(
        "Access Denied",
        "You don't have permission to access this page."
      );
      navigate("/auth/login");
      return;
    }

    setAdminData(user);
    fetchDashboardData();
  }, [navigate, showError]);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual endpoints
      setTimeout(() => {
        const mockUsers = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "creator",
            joinDate: "2024-01-15",
            status: "active",
            approved: true,
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "buyer",
            joinDate: "2024-01-14",
            status: "active",
            approved: true,
          },
          {
            id: 3,
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "creator",
            joinDate: "2024-01-13",
            status: "pending",
            approved: false,
          },
          {
            id: 4,
            name: "Sarah Wilson",
            email: "sarah@example.com",
            role: "buyer",
            joinDate: "2024-01-12",
            status: "active",
            approved: true,
          },
          {
            id: 5,
            name: "David Brown",
            email: "david@example.com",
            role: "creator",
            joinDate: "2024-01-11",
            status: "suspended",
            approved: true,
          },
          {
            id: 6,
            name: "Alex Thompson",
            email: "alex@example.com",
            role: "creator",
            joinDate: "2024-01-10",
            status: "pending",
            approved: false,
          },
        ];

        const pending = mockUsers.filter(
          (user) => user.role === "creator" && !user.approved
        );

        setStats({
          totalUsers: mockUsers.length,
          totalCreators: mockUsers.filter((u) => u.role === "creator").length,
          totalBuyers: mockUsers.filter((u) => u.role === "buyer").length,
          pendingCreators: pending.length,
          totalSales: 342,
          revenue: 28750,
        });

        setUsers(mockUsers);
        setPendingCreators(pending);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showError("Error", "Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleApproveCreator = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [`approve_${userId}`]: true }));

    try {
      // Simulate API call
      setTimeout(() => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, approved: true, status: "active" }
              : user
          )
        );
        setPendingCreators((prev) => prev.filter((user) => user.id !== userId));
        setStats((prev) => ({
          ...prev,
          pendingCreators: prev.pendingCreators - 1,
        }));

        showSuccess(
          "Success",
          "Creator account has been approved successfully!"
        );
        setActionLoading((prev) => ({ ...prev, [`approve_${userId}`]: false }));
      }, 1000);
    } catch (error) {
      showError("Error", "Failed to approve creator account");
      setActionLoading((prev) => ({ ...prev, [`approve_${userId}`]: false }));
    }
  };

  const handleRejectCreator = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [`reject_${userId}`]: true }));

    try {
      // Simulate API call
      setTimeout(() => {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setPendingCreators((prev) => prev.filter((user) => user.id !== userId));
        setStats((prev) => ({
          ...prev,
          pendingCreators: prev.pendingCreators - 1,
          totalUsers: prev.totalUsers - 1,
          totalCreators: prev.totalCreators - 1,
        }));

        showSuccess(
          "Success",
          "Creator account has been rejected and removed!"
        );
        setActionLoading((prev) => ({ ...prev, [`reject_${userId}`]: false }));
      }, 1000);
    } catch (error) {
      showError("Error", "Failed to reject creator account");
      setActionLoading((prev) => ({ ...prev, [`reject_${userId}`]: false }));
    }
  };

  const handleSuspendUser = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [`suspend_${userId}`]: true }));

    try {
      setTimeout(() => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: "suspended" } : user
          )
        );

        showSuccess("Success", "User has been suspended!");
        setActionLoading((prev) => ({ ...prev, [`suspend_${userId}`]: false }));
      }, 1000);
    } catch (error) {
      showError("Error", "Failed to suspend user");
      setActionLoading((prev) => ({ ...prev, [`suspend_${userId}`]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleIcon = (role) => {
    return role === "creator" ? (
      <Camera className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {adminData?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalUsers}
              </div>
              <p className="text-xs text-gray-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Creators
              </CardTitle>
              <Camera className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalCreators}
              </div>
              <p className="text-xs text-gray-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.pendingCreators}
              </div>
              <p className="text-xs text-gray-400">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Needs attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${stats.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +18% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Pending Approvals ({stats.pendingCreators})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              All Users ({stats.totalUsers})
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-400" />
                  Pending Creator Approvals
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve new creator account requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingCreators.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">No pending approvals</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">
                            Creator
                          </th>
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">
                            Join Date
                          </th>
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingCreators.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-slate-700 hover:bg-slate-700/50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <Camera className="h-5 w-5 text-blue-400" />
                                <div>
                                  <p className="text-white font-medium">
                                    {user.name}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {new Date(user.joinDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveCreator(user.id)}
                                  disabled={actionLoading[`approve_${user.id}`]}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {actionLoading[`approve_${user.id}`] ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectCreator(user.id)}
                                  disabled={actionLoading[`reject_${user.id}`]}
                                >
                                  {actionLoading[`reject_${user.id}`] ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserX className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Users Tab */}
          <TabsContent value="all">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All Users
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage all registered users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Join Date
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">
                                {user.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <span className="text-gray-300 capitalize">
                                {user.role}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {user.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleSuspendUser(user.id)}
                                  disabled={actionLoading[`suspend_${user.id}`]}
                                >
                                  {actionLoading[`suspend_${user.id}`] ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Ban className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
