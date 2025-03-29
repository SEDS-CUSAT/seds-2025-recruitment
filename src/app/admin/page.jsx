"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicants();
  }, []);

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

  async function handleApprove(userId) {
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve");
      
      toast({
        title: "Success",
        description: "Applicant approved successfully",
        variant: "success",
      });
      
      // Refresh the applicants list
      fetchApplicants();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve applicant",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="space-y-6">
          {applicants.map((applicant) => (
            <div
              key={applicant.userId}
              className="bg-card rounded-lg p-6 shadow-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{applicant.name}</h2>
                  <p className="text-muted-foreground">ID: {applicant.userId}</p>
                </div>
                {!applicant.approved && (
                  <Button onClick={() => handleApprove(applicant.userId)}>
                    Approve
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Contact Information</h3>
                  <p>Email: {applicant.email}</p>
                  <p>Phone: {applicant.phoneNo}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Academic Information</h3>
                  <p>Year: {applicant.yearOfStudy}</p>
                  <p>Degree: {applicant.degree}</p>
                  <p>Department: {applicant.department}</p>
                  <p>Course: {applicant.course}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Team & Payment</h3>
                  <p>Selected Team: {applicant.team}</p>
                  <p>Transaction ID: {applicant.transactionId}</p>
                  <p>Status: {applicant.approved ? "Approved" : "Pending"}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Payment Screenshot</h3>
                  <div className="relative h-48 w-full">
                    <Image
                      src={applicant.paymentScreenshot}
                      alt="Payment Screenshot"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}