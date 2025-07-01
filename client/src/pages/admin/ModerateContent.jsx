import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { apiConfig } from "@/config/api";
import { Loader2, CheckCircle, XCircle, Ban, Search } from "lucide-react";

const statusColors = {
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING_REVIEW: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  SUSPENDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const ModerateContent = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line
  }, [statusFilter, refresh]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${apiConfig.endpoints.admin.content}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setContents(
        data.content || data.content || data?.content || data?.content || []
      );
    } catch (e) {
      setContents([]);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("token");
      await fetch(
        apiConfig.endpoints.admin.updateContentStatus(id) + `?status=${status}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRefresh((r) => r + 1);
    } catch (e) {}
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const filtered = contents.filter(
    (c) =>
      (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.creatorName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Moderate Content</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              placeholder="Search by title or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-24">
            No content found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((content) => (
              <Card key={content.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {content.title}
                    </h3>
                    <Badge className={statusColors[content.status] || ""}>
                      {content.status?.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    <span>By: {content.creatorName}</span>
                  </div>
                  <div className="text-gray-400 text-xs mb-2">
                    {content.category} | {content.location}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={actionLoading[content.id]}
                      onClick={() => handleStatusUpdate(content.id, "APPROVED")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={actionLoading[content.id]}
                      onClick={() => handleStatusUpdate(content.id, "REJECTED")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-600 hover:bg-gray-700"
                      disabled={actionLoading[content.id]}
                      onClick={() =>
                        handleStatusUpdate(content.id, "SUSPENDED")
                      }
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ModerateContent;
