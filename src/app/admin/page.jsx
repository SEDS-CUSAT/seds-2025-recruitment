"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS, TEAMS, DEFAULT_UPI_LIST } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PhoneIcon } from "lucide-react";

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState({});
  const [loadingTeams, setLoadingTeams] = useState(new Set());
  const [loadedTeams, setLoadedTeams] = useState(new Set());
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [selectedUpi, setSelectedUpi] = useState("");
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const getDuplicateInfo = useCallback((applicants) => {
    const emailGroups = {};
    const transactionGroups = {};
    
    const allApplicants = Object.values(applicants).flat();

    allApplicants.forEach((app) => {
      if (app.email) {
        if (!emailGroups[app.email]) emailGroups[app.email] = [];
        emailGroups[app.email].push(app.userId);
      }
      if (app.transactionId) {
        if (!transactionGroups[app.transactionId]) transactionGroups[app.transactionId] = [];
        transactionGroups[app.transactionId].push(app.userId);
      }
    });

    return { emailGroups, transactionGroups };
  }, []);

  const isDuplicate = useCallback(
    (applicant, emailGroups, transactionGroups) => {
      return (
        emailGroups[applicant.email]?.length > 1 ||
        transactionGroups[applicant.transactionId]?.length > 1
      );
    },
    []
  );

  useEffect(() => {
    fetchUpiData();
  }, []);

  useEffect(() => {
    const allApplicants = Object.values(applicants).flat();
    setCounts({
      pending: allApplicants.filter((a) => a.status === "pending").length,
      verified: allApplicants.filter((a) => a.status === "verified").length,
      rejected: allApplicants.filter((a) => a.status === "rejected").length,
    });
  }, [applicants]);

  useEffect(() => {
    if (fullscreenImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [fullscreenImage]);

  async function fetchApplicantsByTeam(team) {
    try {
      setLoadingTeams((prev) => new Set([...prev, team]));
      const res = await fetch(
        `/api/admin/applicants?team=${encodeURIComponent(team)}`
      );
      if (res.status === 401) {
        await handleLogout();
        return;
      }
      const data = await res.json();

      setApplicants((prev) => ({
        ...prev,
        [team]: data.applicants,
      }));

      setLoadingTeams((prev) => {
        const newSet = new Set(prev);
        newSet.delete(team);
        return newSet;
      });
      setLoadedTeams((prev) => new Set([...prev, team]));
    } catch (error) {
      console.error(`Error fetching ${team} team:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${team} team data`,
        variant: "destructive",
      });
      setLoadingTeams((prev) => {
        const newSet = new Set(prev);
        newSet.delete(team);
        return newSet;
      });
    }
  }

  async function handleVerify(userId, status) {
    try {
      setActionLoading(true);
      setActionType(status);
      const res = await fetch(`/api/admin/applicants/${userId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
        variant: "success",
      });

      setApplicants((prev) => {
        const updatedApplicants = { ...prev };
        Object.keys(updatedApplicants).forEach((team) => {
          updatedApplicants[team] = updatedApplicants[team].map((applicant) =>
            applicant.userId === userId ? { ...applicant, status } : applicant
          );
        });
        return updatedApplicants;
      });
      setSelectedApplicant(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} applicant`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(userId) {
    try {
      setActionLoading(true);
      setActionType("delete");
      const res = await fetch(`/api/admin/applicants/${userId}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete applicant");

      toast({
        title: "Success",
        description: "Application deleted successfully",
        variant: "success",
      });

      setApplicants((prev) => {
        const updatedApplicants = { ...prev };
        Object.keys(updatedApplicants).forEach((team) => {
          updatedApplicants[team] = updatedApplicants[team].filter(
            (applicant) => applicant.userId !== userId
          );
        });
        return updatedApplicants;
      });
      setSelectedApplicant(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete applicant",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpiChange(value) {
    try {
      const res = await fetch("/api/admin/upi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ person: value }),
      });

      if (res.status === 401) {
        await handleLogout();
        return;
      }

      if (!res.ok) throw new Error("Failed to update UPI person");
      setSelectedUpi(value);

      toast({
        title: "Success",
        description: "UPI person updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating UPI person:", error);
      toast({
        title: "Error",
        description: "Failed to update UPI person",
        variant: "destructive",
      });
    }
  }

  async function fetchUpiData() {
    try {
      const res = await fetch("/api/admin/upi");

      if (res.status === 401) {
        await handleLogout();
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch UPI data");

      const data = await res.json();
      setSelectedUpi(data.person);
    } catch (error) {
      console.error("Error fetching UPI data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch UPI data",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchUpiData();
  }, []);

  const filteredApplicants = useMemo(() => {

    const allApplicants = Object.values(applicants).flat();
    const { emailGroups, transactionGroups } = getDuplicateInfo(allApplicants);

   
    const filtered = allApplicants.filter((applicant) => {
      const matchesStatus = filterStatus === "all" || applicant.status === filterStatus;
      const matchesTeam = filterTeam === "all" || applicant.team === filterTeam;
      const matchesDepartment = filterDepartment === "all" || applicant.department === filterDepartment;
      const matchesDuplicate = !showDuplicatesOnly || isDuplicate(applicant, emailGroups, transactionGroups);
      const matchesSearch = searchQuery === "" ||
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.team.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesTeam && matchesDepartment && matchesSearch && (!showDuplicatesOnly || matchesDuplicate);
    });

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [applicants, filterStatus, filterTeam, filterDepartment, searchQuery, showDuplicatesOnly, getDuplicateInfo, isDuplicate]);

  const filteredCounts = useMemo(() => {
    const allApplicants = Object.values(applicants).flat();
    if (filterStatus !== "all") {
      const filteredByOtherCriteria = allApplicants.filter((applicant) => {
        const matchesTeam =
          filterTeam === "all" || applicant.team === filterTeam;
        const matchesDepartment =
          filterDepartment === "all" ||
          applicant.department === filterDepartment;
        const matchesSearch =
          searchQuery === "" ||
          applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          applicant.department
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          applicant.team.toLowerCase().includes(searchQuery.toLowerCase());
        const { emailGroups, transactionGroups } =
          getDuplicateInfo(allApplicants);
        const matchesDuplicate =
          !showDuplicatesOnly ||
          isDuplicate(applicant, emailGroups, transactionGroups);

        return (
          matchesTeam &&
          matchesDepartment &&
          matchesSearch &&
          (!showDuplicatesOnly || matchesDuplicate)
        );
      });

      return {
        all: filteredByOtherCriteria.length,
        pending: filteredByOtherCriteria.filter((a) => a.status === "pending")
          .length,
        verified: filteredByOtherCriteria.filter((a) => a.status === "verified")
          .length,
        rejected: filteredByOtherCriteria.filter((a) => a.status === "rejected")
          .length,
      };
    }

    return {
      all: filteredApplicants.length,
      pending: filteredApplicants.filter((a) => a.status === "pending").length,
      verified: filteredApplicants.filter((a) => a.status === "verified")
        .length,
      rejected: filteredApplicants.filter((a) => a.status === "rejected")
        .length,
    };
  }, [
    filteredApplicants,
    filterStatus,
    filterTeam,
    filterDepartment,
    searchQuery,
    showDuplicatesOnly,
    applicants,
    getDuplicateInfo,
    isDuplicate,
  ]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    }
  };

  const getDuplicateBadgeVariant = () => {
    return "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20";
  };

  const getCardStyle = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-500/5 border-emerald-500/20";
      case "rejected":
        return "bg-red-500/5 border-red-500/20";
      default:
        return "bg-card/50 border-border";
    }
  };

  const getActionButtons = (applicant) => {
    if (!applicant) return null;

    if (applicant.status === "pending") {
      return (
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="destructive"
            onClick={() => handleVerify(applicant.userId, "rejected")}
            disabled={actionLoading}
          >
            {actionLoading && actionType === "rejected" ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Rejecting...</span>
              </div>
            ) : (
              "Reject"
            )}
          </Button>
          <Button
            onClick={() => handleVerify(applicant.userId, "verified")}
            disabled={actionLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {actionLoading && actionType === "verified" ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify"
            )}
          </Button>
        </div>
      );
    } else if (applicant.status === "rejected") {
      return (
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="destructive"
            onClick={() => handleDelete(applicant.userId)}
            disabled={actionLoading}
            size="sm"
          >
            {actionLoading && actionType === "delete" ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Delete
              </div>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleVerify(applicant.userId, "pending")}
            disabled={actionLoading}
            className="text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
          >
            {actionLoading && actionType === "pending" ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </svg>
                <span>Moving to Pending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </svg>
                Move to Pending
              </div>
            )}
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => handleVerify(applicant.userId, "pending")}
            disabled={actionLoading}
            className="text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
          >
            {actionLoading && actionType === "pending" ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </svg>
                <span>Moving to Pending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </svg>
                Move to Pending
              </div>
            )}
          </Button>
        </div>
      );
    }
  };

  if (loadingTeams.size === TEAMS.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">
          Loading astronauts 🧑‍🚀
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait while we fetch the data
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <h1 className="text-2xl font-bold hover:text-violet-600">
                  Admin Dashboard
                </h1>
              </Link>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showDuplicatesOnly}
                  onCheckedChange={setShowDuplicatesOnly}
                  className="data-[state=checked]:bg-violet-500"
                />
                <span className="text-sm text-muted-foreground">
                  {showDuplicatesOnly
                    ? "Showing Duplicates"
                    : "Show Duplicates"}
                </span>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-[280px]">
                <Select value={selectedUpi} onValueChange={handleUpiChange}>
                  <SelectTrigger className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <SelectValue placeholder="Select UPI Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_UPI_LIST.map((upi) => (
                      <SelectItem key={upi.name} value={upi.name}>
                        {upi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full sm:w-auto text-white bg-red-600/90 hover:bg-red-600 border-red-600/20"
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-[2]">
              <div className="relative w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <Input
                  placeholder="Search by name, userId, ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <div className="flex-[1.5]">
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[2.5]">
              <Select
                value={filterDepartment}
                onValueChange={setFilterDepartment}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 min-h-[88px] sm:min-h-0">
              <TabsTrigger value="all" className="py-2.5">
                All ({filteredCounts.all})
              </TabsTrigger>
              <TabsTrigger value="pending" className="py-2.5">
                Pending ({filteredCounts.pending})
              </TabsTrigger>
              <TabsTrigger value="verified" className="py-2.5">
                Verified ({filteredCounts.verified})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="py-2.5">
                Rejected ({filteredCounts.rejected})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          {TEAMS.map((team) => (
            <Button
              key={team}
              variant={loadedTeams.has(team) ? "default" : "outline"}
              className={cn(
                "relative",
                loadedTeams.has(team) &&
                  "bg-primary/10 hover:bg-primary/20 text-primary",
                loadingTeams.has(team) && "pointer-events-none"
              )}
              onClick={() => {
                if (!loadedTeams.has(team) && !loadingTeams.has(team)) {
                  fetchApplicantsByTeam(team);
                }
              }}
            >
              {loadingTeams.has(team) && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
              <span
                className={cn(
                  "truncate",
                  loadedTeams.has(team) && "font-medium"
                )}
              >
                {team}
              </span>
              {loadedTeams.has(team) && (
                <span className="ml-1.5 text-xs">
                  ({(applicants[team] || []).length})
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplicants.map((applicant) => {
            const allApplicants = Object.values(applicants).flat();
            const { emailGroups, transactionGroups } =
              getDuplicateInfo(allApplicants);
            const hasDuplicate = isDuplicate(
              applicant,
              emailGroups,
              transactionGroups
            );

            return (
              <div
                key={applicant.userId}
                className={`border rounded-lg p-4 shadow-sm transition-colors cursor-pointer hover:shadow-md ${getCardStyle(
                  applicant.status
                )}`}
                onClick={() => setSelectedApplicant(applicant)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="font-semibold truncate">
                        {applicant.name}
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        ID: {applicant.userId}
                      </p>
                      <p className="text-sm text-yellow-400 font-bold truncate">
                        <span>
                          <PhoneIcon className="w-4 h-4 inline-block mr-1" />
                        </span>{" "}
                        {applicant.phoneNo}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${getStatusBadgeVariant(
                          applicant.status
                        )} shrink-0`}
                      >
                        {applicant.status}
                      </Badge>
                      {hasDuplicate && (
                        <Badge
                          variant="outline"
                          className={`${getDuplicateBadgeVariant()} shrink-0`}
                        >
                          repeated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm space-y-1.5">
                    <p>Year: {applicant.yearOfStudy}</p>
                    <p className="truncate">Dept: {applicant.department}</p>
                    <p className="text-muted-foreground">
                      Team: {applicant.team}
                    </p>
                  </div>
                  <div className="relative w-full h-[180px] sm:h-[200px]">
                    <Image
                      src={applicant.paymentScreenshot}
                      alt="Payment Screenshot"
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fullscreenImage && selectedApplicant && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setFullscreenImage(false)}
        >
          <Button
            variant="secondary"
            size="icon"
            className="fixed top-4 right-4 z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
          <div className="w-screen h-screen p-4 flex items-center justify-center">
            <img
              src={selectedApplicant.paymentScreenshot}
              alt="Payment Screenshot"
              className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedApplicant && !fullscreenImage}
        onOpenChange={() => setSelectedApplicant(null)}
      >
        <DialogContent className="p-0 sm:max-w-3xl lg:max-w-5xl">
          {selectedApplicant && (
            <div className="flex flex-col h-[100dvh] sm:h-[85vh]">
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <DialogHeader className="p-4">
                  <DialogTitle className="text-xl font-semibold flex flex-col gap-2">
                    <div className="flex items-center gap-3 flex-wrap w-full">
                      <span className="truncate">{selectedApplicant.name}</span>
                      <div className="flex items-center gap-[6px]">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeVariant(
                            selectedApplicant.status
                          )}
                        >
                          {selectedApplicant.status}
                        </Badge>
                        {isDuplicate(
                          selectedApplicant,
                          getDuplicateInfo(Object.values(applicants).flat())
                            .emailGroups,
                          getDuplicateInfo(Object.values(applicants).flat())
                            .transactionGroups
                        ) && (
                          <Badge
                            variant="outline"
                            className={getDuplicateBadgeVariant()}
                          >
                            duplicate
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                      <span className="truncate">
                        ID: {selectedApplicant.userId}
                      </span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                <div className="p-4 pb-20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Contact Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2 break-all">
                            <span className="text-muted-foreground shrink-0">
                              Email:
                            </span>
                            <span className="font-medium">
                              {selectedApplicant.email}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground shrink-0">
                              Phone:
                            </span>
                            <span className="font-medium">
                              {selectedApplicant.phoneNo}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-start gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                          </svg>
                          Academic Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">Year:</span>
                            <span className="font-medium">
                              {selectedApplicant.yearOfStudy}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">
                              Degree:
                            </span>
                            <span className="font-medium">
                              {selectedApplicant.degree}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">
                              Department:
                            </span>
                            <span className="font-medium">
                              {selectedApplicant.department}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">
                              Course:
                            </span>
                            <span className="font-medium">
                              {selectedApplicant.course}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                            <path d="M2 7h20" />
                          </svg>
                          Team & Payment
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Selected Team:
                            </span>
                            <span className="font-medium">
                              {selectedApplicant.team}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Transaction ID:
                            </span>
                            <span className="font-mono font-medium">
                              {selectedApplicant.transactionId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3L14.5 4z" />
                              <circle cx="12" cy="13" r="3" />
                            </svg>
                            Payment Screenshot
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFullscreenImage(true)}
                            className="shrink-0"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <polyline points="15 3 21 3 21 9" />
                              <polyline points="9 21 3 21 3 15" />
                              <line x1="21" y1="3" x2="14" y2="10" />
                              <line x1="3" y1="21" x2="10" y2="14" />
                            </svg>
                          </Button>
                        </h3>
                        <div className="relative w-full h-[300px]">
                          <Image
                            src={selectedApplicant.paymentScreenshot}
                            alt="Payment Screenshot"
                            fill
                            className="object-contain rounded-lg cursor-pointer"
                            onClick={() => setFullscreenImage(true)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
                    {getActionButtons(selectedApplicant)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
