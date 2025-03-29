"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    if (fullscreenImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [fullscreenImage]);

  async function fetchApplicants() {
    try {
      const res = await fetch("/api/admin/applicants");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setApplicants(data.applicants);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applicants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(userId, status) {
    try {
      setActionLoading(true);
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
      
      fetchApplicants();
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

  const filteredApplicants = applicants.filter(applicant => 
    filterStatus === "all" || applicant.status === filterStatus
  );

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
            {actionLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
            {actionLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify"
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
            {actionLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
                <span>Moving to Pending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
                Move to Pending
              </div>
            )}
          </Button>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplicants.map((applicant) => (
            <div
              key={applicant.userId}
              className={`border rounded-lg p-4 shadow-sm transition-colors cursor-pointer hover:shadow-md ${getCardStyle(applicant.status)}`}
              onClick={() => setSelectedApplicant(applicant)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold truncate">{applicant.name}</h2>
                    <p className="text-sm text-muted-foreground">ID: {applicant.userId}</p>
                  </div>
                  <Badge variant="outline" className={getStatusBadgeVariant(applicant.status)}>
                    {applicant.status}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p>Year: {applicant.yearOfStudy}</p>
                  <p className="truncate">Dept: {applicant.department}</p>
                  <p className="truncate text-muted-foreground">Team: {applicant.team}</p>
                </div>
                <div className="relative w-full h-[200px]">
                  <Image
                    src={applicant.paymentScreenshot}
                    alt="Payment Screenshot"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {fullscreenImage && selectedApplicant && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setFullscreenImage(false)}
        >
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </Button>
          <img
            src={selectedApplicant.paymentScreenshot}
            alt="Payment Screenshot"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Dialog 
        open={!!selectedApplicant && !fullscreenImage} 
        onOpenChange={() => {
          setSelectedApplicant(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          {selectedApplicant && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {selectedApplicant.name}
                    <Badge variant="outline" className={getStatusBadgeVariant(selectedApplicant.status)}>
                      {selectedApplicant.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                    ID: {selectedApplicant.userId}
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedApplicant.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedApplicant.phoneNo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      Academic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Year:</span>
                        <span className="font-medium">{selectedApplicant.yearOfStudy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Degree:</span>
                        <span className="font-medium">{selectedApplicant.degree}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{selectedApplicant.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Course:</span>
                        <span className="font-medium">{selectedApplicant.course}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
                      Team & Payment
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Selected Team:</span>
                        <span className="font-medium">{selectedApplicant.team}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono font-medium">{selectedApplicant.transactionId}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3L14.5 4z"/><circle cx="12" cy="13" r="3"/></svg>
                        Payment Screenshot
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFullscreenImage(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
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
              {getActionButtons(selectedApplicant)}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}