"use client";
import { useState, useCallback, useEffect } from "react";
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

import { DEPARTMENTS, TEAMS, MAX_FILE_SIZE } from "@/lib/constants";

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentImage, setPaymentImage] = useState(null);
  const { toast } = useToast();

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = "/payment-upi-qr.jpg";
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
    navigator.clipboard.writeText("abithabala20@oksbi");
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
                        abithabala20@oksbi
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
                      src="/payment-upi-qr.jpg"
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
