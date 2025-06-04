import React, { useState, useEffect } from "react";
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
  Camera,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Ban,
  CheckCircle,
  Activity,
  Mail,
  Calendar,
  AlertCircle,
  Search,
} from "lucide-react";

const ManageCreators = () => {
  const { showSuccess, showError } = useNotification();
  const [creators, setCreators] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      setTimeout(() => {
        const mockCreators = [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "creator",
            approved: true,
            createdAt: "2024-01-15T10:30:00Z",
            status: "active",
            profilePicture: null,
            portfolio: "Professional drone photographer",
            equipment: "DJI Mavic 3, DJI Air 2S",
            experience: "5 years",
          },
          {
            id: "2",
            name: "Sarah Wilson",
            email: "sarah.wilson@example.com",
            role: "creator",
            approved: false,
            createdAt: "2024-01-18T14:22:00Z",
            status: "pending",
            profilePicture: null,
            portfolio: "Landscape and nature drone videography",
            equipment: "DJI Mini 3 Pro",
            experience: "2 years",
          },
          {
            id: "3",
            name: "Mike Johnson",
            email: "mike.j@example.com",
            role: "creator",
            approved: false,
            createdAt: "2024-01-19T09:15:00Z",
            status: "pending",
            profilePicture: null,
            portfolio: "Real estate and commercial drone photography",
            equipment: "DJI Phantom 4 Pro, DJI Mavic Air",
            experience: "3 years",
          },
          {
            id: "4",
            name: "Alex Thompson",
            email: "alex.thompson@example.com",
            role: "creator",
            approved: true,
            createdAt: "2024-01-10T16:45:00Z",
            status: "active",
            profilePicture: null,
            portfolio: "Event and wedding drone videography",
            equipment: "DJI Mavic 3 Cine",
            experience: "4 years",
          },
          {
            id: "5",
            name: "Emma Davis",
            email: "emma.davis@example.com",
            role: "creator",
            approved: false,
            createdAt: "2024-01-20T11:30:00Z",
            status: "pending",
            profilePicture: null,
            portfolio: "Sports and action drone footage",
            equipment: "DJI FPV, DJI Mini 4 Pro",
            experience: "1 year",
          },
        ];

        const approved = mockCreators.filter((creator) => creator.approved);
        const pending = mockCreators.filter((creator) => !creator.approved);

        setCreators(mockCreators);
        setPendingCreators(pending);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching creators:", error);
      showError("Error", "Failed to load creator data");
      setLoading(false);
    }
  };

  const handleApproveCreator = async (creatorId) => {
    setActionLoading((prev) => ({ ...prev, [`approve_${creatorId}`]: true }));

    try {
      // Simulate API call
      setTimeout(() => {
        setCreators((prev) =>
          prev.map((creator) =>
            creator.id === creatorId
              ? { ...creator, approved: true, status: "active" }
              : creator
          )
        );
        setPendingCreators((prev) =>
          prev.filter((creator) => creator.id !== creatorId)
        );

        const approvedCreator = creators.find((c) => c.id === creatorId);
        showSuccess(
          "Creator Approved",
          `${approvedCreator?.name} has been approved and can now access their account.`
        );
        setActionLoading((prev) => ({
          ...prev,
          [`approve_${creatorId}`]: false,
        }));
      }, 1500);
    } catch (error) {
      showError("Error", "Failed to approve creator account");
      setActionLoading((prev) => ({
        ...prev,
        [`approve_${creatorId}`]: false,
      }));
    }
  };

  const handleRejectCreator = async (creatorId) => {
    setActionLoading((prev) => ({ ...prev, [`reject_${creatorId}`]: true }));

    try {
      // Simulate API call
      setTimeout(() => {
        const rejectedCreator = creators.find((c) => c.id === creatorId);

        setCreators((prev) =>
          prev.filter((creator) => creator.id !== creatorId)
        );
        setPendingCreators((prev) =>
          prev.filter((creator) => creator.id !== creatorId)
        );

        showSuccess(
          "Creator Rejected",
          `${rejectedCreator?.name}'s application has been rejected and removed.`
        );
        setActionLoading((prev) => ({
          ...prev,
          [`reject_${creatorId}`]: false,
        }));
      }, 1500);
    } catch (error) {
      showError("Error", "Failed to reject creator account");
      setActionLoading((prev) => ({ ...prev, [`reject_${creatorId}`]: false }));
    }
  };

  const handleSuspendCreator = async (creatorId) => {
    setActionLoading((prev) => ({ ...prev, [`suspend_${creatorId}`]: true }));

    try {
      setTimeout(() => {
        setCreators((prev) =>
          prev.map((creator) =>
            creator.id === creatorId
              ? { ...creator, status: "suspended" }
              : creator
          )
        );

        const suspendedCreator = creators.find((c) => c.id === creatorId);
        showSuccess(
          "Creator Suspended",
          `${suspendedCreator?.name} has been suspended.`
        );
        setActionLoading((prev) => ({
          ...prev,
          [`suspend_${creatorId}`]: false,
        }));
      }, 1500);
    } catch (error) {
      showError("Error", "Failed to suspend creator");
      setActionLoading((prev) => ({
        ...prev,
        [`suspend_${creatorId}`]: false,
      }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
    };

    const colors = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      suspended: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredCreators = creators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPending = pendingCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-400">Loading creators...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Creators
          </h1>
          <p className="text-gray-400">Review and approve creator accounts</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-200 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Creators
              </CardTitle>
              <Camera className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {creators.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {pendingCreators.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Active Creators
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {
                  creators.filter((c) => c.approved && c.status === "active")
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creator Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Pending Approval ({filteredPending.length})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              All Creators ({filteredCreators.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-400" />
                  Pending Creator Applications
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Review new creator account requests and approve or reject them
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPending.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-200 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-400">
                      No pending creator applications to review
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredPending.map((creator) => (
                      <div
                        key={creator.id}
                        className="border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Camera className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {creator.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <Mail className="h-4 w-4" />
                                <span>{creator.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Applied{" "}
                                  {new Date(
                                    creator.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Review
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              Portfolio
                            </h4>
                            <p className="text-sm text-gray-400">
                              {creator.portfolio}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              Equipment
                            </h4>
                            <p className="text-sm text-gray-400">
                              {creator.equipment}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              Experience
                            </h4>
                            <p className="text-sm text-gray-400">
                              {creator.experience}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleApproveCreator(creator.id)}
                            disabled={actionLoading[`approve_${creator.id}`]}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {actionLoading[`approve_${creator.id}`] ? (
                              <Activity className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <UserCheck className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRejectCreator(creator.id)}
                            disabled={actionLoading[`reject_${creator.id}`]}
                          >
                            {actionLoading[`reject_${creator.id}`] ? (
                              <Activity className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <UserX className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Creators Tab */}
          <TabsContent value="all">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  All Creators
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage all creator accounts on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCreators.map((creator) => (
                        <tr
                          key={creator.id}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Camera className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {creator.name}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {creator.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(creator.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(creator.status)}
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
                              {creator.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    handleSuspendCreator(creator.id)
                                  }
                                  disabled={
                                    actionLoading[`suspend_${creator.id}`]
                                  }
                                >
                                  {actionLoading[`suspend_${creator.id}`] ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Ban className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {!creator.approved && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                  onClick={() =>
                                    handleApproveCreator(creator.id)
                                  }
                                  disabled={
                                    actionLoading[`approve_${creator.id}`]
                                  }
                                >
                                  {actionLoading[`approve_${creator.id}`] ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
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

export default ManageCreators;
