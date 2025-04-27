"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import Link from "next/link";

import {
  DEPARTMENTS,
  TEAMS,
  MAX_FILE_SIZE,
  DEFAULT_UPI_LIST,
  LAST_DATE,
} from "@/lib/constants";
import { LinkedinIcon } from "lucide-react";

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentImage, setPaymentImage] = useState(null);
  const [currentUpi, setCurrentUpi] = useState(DEFAULT_UPI_LIST[0]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isRecruitmentEnded = useMemo(() => {
    return Date.now() > LAST_DATE;
  }, []);
  if (isRecruitmentEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="lg:max-w-3xl w-full mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="sm:text-3xl text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Recruitment&nbsp;Closed
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">
                The recruitment period for SEDS CUSAT 2025 has ended.
              </p>
            </div>

            <div className="relative w-48 sm:w-64 aspect-square mx-auto">
              <Image
                src="/rocket.png"
                alt="Rocket"
                fill
                className="object-contain animate-floating"
                sizes="(max-width: 640px) 192px, 256px"
                priority
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Thank you for your interest. Follow us on social media for
                future updates.
              </p>
              <div className="flex justify-center gap-4 items-center">
                <Link
                  href="https://linktr.ee/seds_ires_cusat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-green-400 to-green-600 p-1 rounded-md hover:opacity-90 transition-opacity"
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    strokeWidth="0"
                    strokeLinecap="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m13.73635 5.85251 4.00467-4.11665 2.3248 2.3808-4.20064 4.00466h5.9085v3.30473h-5.9365l4.22865 4.10766-2.3248 2.3338L12.0005 12.099l-5.74052 5.76852-2.3248-2.3248 4.22864-4.10766h-5.9375V8.12132h5.9085L3.93417 4.11666l2.3248-2.3808 4.00468 4.11665V0h3.4727zm-3.4727 10.30614h3.4727V24h-3.4727z" />
                  </svg>
                </Link>
                <Link
                  href="https://www.instagram.com/ires_cusat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md hover:opacity-90 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/sedscusat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground bg-blue-500 p-1 rounded-md hover:opacity-90 transition-opacity"
                >
                  <LinkedinIcon
                    className="w-5 h-5 text-white"
                    fill="white"
                    strokeWidth="0"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUpiData();
  }, []);

  const fetchUpiData = async () => {
    try {
      const res = await fetch("/api/admin/upi", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();
      if (data.person && data.details) {
        setCurrentUpi(data.details);
      } else {
        setCurrentUpi(DEFAULT_UPI_LIST[0]);
      }
    } catch (error) {
      console.error("Error fetching UPI data:", error);
      setCurrentUpi(DEFAULT_UPI_LIST[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = currentUpi.imagePath;
    link.download = "seds2025-payment-upi-qrcode.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPaymentImage(null);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(currentUpi.upiId);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
      variant: "success",
    });
  };

  const form = useForm({
    defaultValues: {
      name: "",
      phoneNo: "",
      email: "",
      yearOfStudy: "",
      degree: "",
      department: "",
      course: "",
      team: "",
      transactionId: "",
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload an image smaller than 500KB",
          });
          return;
        }
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        try {
          const base64String = await convertToBase64(file);
          setPaymentImage({
            preview: URL.createObjectURL(file),
            base64: base64String,
            name: file.name,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process image. Please try again.",
          });
        }
      }
    },
  });

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(data) {
    if (!paymentImage?.base64) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload a payment screenshot",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      formData.append("paymentScreenshot", paymentImage.base64);

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Submission failed");

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for applying to SEDS CUSAT.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const triggerConfetti = useCallback(() => {
    const end = Date.now() + 2000;

    const colors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#00FFEE",
    ];

    const fireSideConfetti = (side) => {
      confetti({
        particleCount: 100,
        angle: side === "left" ? 60 : 120,
        spread: 70,
        origin: { x: side === "left" ? 0 : 1, y: 0.9 },
        colors: colors,
        shapes: ["circle", "square", "star"],
        scalar: 1.2,
        decay: 0.9,
        disableForReducedMotion: true,
        startVelocity: 50,
        gravity: 1.5,
        drift: side === "left" ? 1 : -1,
        ticks: 400,
      });
    };

    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      fireSideConfetti("left");
      fireSideConfetti("right");
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      triggerConfetti();
    }
  }, [isSubmitted, triggerConfetti]);

  if (isSubmitted) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 animate-float z-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Thank You!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your application has been submitted successfully.
            </p>
          </div>
          <div className="mt-8 opacity-90">
            <p className="text-sm text-muted-foreground">
              Welcome to SEDS CUSAT! We'll be in touch soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">
          Fueling your space station...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SEDS CUSAT Recruitment 2025
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Join us in exploring the frontiers of space
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNo"
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number (10 digits, without country code)
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="1234567890"
                        {...field}
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="your.name@example.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearOfStudy"
                rules={{ required: "Please select your year of study" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Study</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degree"
                rules={{ required: "Please select your degree" }}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="UG" id="UG" />
                          <FormLabel htmlFor="UG">UG</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PG" id="PG" />
                          <FormLabel htmlFor="PG">PG</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                rules={{ required: "Please select your department" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course"
                rules={{ required: "Course is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., B.Tech Computer Science"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                rules={{ required: "Please select your team" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team you have been selected to</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TEAMS.map((team) => (
                          <SelectItem key={team} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-6 sm:p-8 border rounded-lg space-y-4 bg-card/50 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Payment Details
                </h2>
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center xs:gap-2 sm:gap-3">
                    <p className="text-base sm:text-lg">
                      UPI&nbsp;ID:&nbsp;
                      <span className="font-mono font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {currentUpi.upiId}
                      </span>
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyUPI}
                      className="px-[6px] py-[6px] h-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </Button>
                  </div>
                  <p className="text-base sm:text-lg pb-6">
                    Amount:{" "}
                    <span className="font-mono font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      ₹350
                    </span>
                  </p>
                  <div className="space-y-2 w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px]">
                    <Image
                      src={currentUpi.imagePath}
                      alt="Payment QR Code"
                      width={400}
                      height={400}
                      className="border-2 p-2 rounded-lg bg-white w-full h-auto transition-transform hover:cursor-pointer"
                      priority
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadQR}
                      className="w-full bg-card/50 backdrop-blur-sm hover:bg-accent/80"
                    >
                      Download QR Code
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Scan the QR code above or use the UPI ID to make the
                    payment. You can download the QR code if needed. After
                    payment, enter the transaction ID and upload the screenshot
                    below.
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="transactionId"
                rules={{ required: "Transaction ID is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI Transaction ID</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter the UPI transaction reference number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Payment Screenshot</FormLabel>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent bg-card/50 backdrop-blur-sm transition-colors",
                    isSubmitting && "pointer-events-none opacity-50"
                  )}
                >
                  <input {...getInputProps()} />
                  {paymentImage ? (
                    <div className="space-y-4">
                      <div className="relative max-w-xl mx-auto">
                        <Image
                          src={paymentImage.preview}
                          alt="Payment screenshot preview"
                          width={400}
                          height={400}
                          className="mx-auto object-contain rounded-lg shadow-sm"
                          style={{ maxHeight: "400px", width: "auto" }}
                          priority
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Selected: {paymentImage.name}
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="mt-2"
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>
                        Drag and drop your payment screenshot here, or click to
                        select
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Maximum file size: 500KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-accent/25 relative"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
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
                      <span>Submitting</span>
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <Toaster />
        </div>
      </div>
    </>
  );
}
