"use client";
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";

const MAX_FILE_SIZE = 512000;

const DEPARTMENTS = [
  'Cochin University College of Engineering Kuttanad (CUCEK)',
  'Department of Applied Economics',
  'Department of Biotechnology',
  'Department of Chemical Oceanography',
  'Department of Chemistry',
  'Department of Computer Applications (DCA)',
  'Department of Computer Science (DCS)',
  'Department of Electronics (DOE)',
  'Department of English and Foreign Languages',
  'Department of Hindi',
  'Department of Marine Biology, Microbiology & Biochemistry',
  'Department of Mathematics',
  'Department of Physical Oceanography',
  'Department of Physics',
  'Department of Polymer Science and Rubber Technology',
  'Department of Ship Technology',
  'Department of Statistics',
  'International School of Photonics (ISP)',
  'Kunjali Marakkar School of Marine Engineering (KMSME)',
  'School of Engineering (SOE)',
  'School of Environmental Studies',
  'School of Industrial Fisheries',
  'School of Legal Studies (SLS)',
  'School of Management Studies (SMS)'
];

const TEAMS = [
  'Ambience',
  'Content',
  'Curation',
  'Event',
  'HR',
  'Media and Production',
  'Outreach',
  'Project',
  'Sponsorship',
  'Tech'
];

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentImage, setPaymentImage] = useState(null);
  const { toast } = useToast();

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = '/payment-upi-qr.jpg';
    link.download = 'seds2025-payment-upi-qrcode.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPaymentImage(null);
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
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload an image smaller than 500KB"
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
            name: file.name
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process image. Please try again."
          });
        }
      }
    }
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
        title: "Error",
        description: "Please upload a payment screenshot"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
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

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg text-muted-foreground">
            Your application has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">SEDS CUSAT Recruitment 2025</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Fill in your details below to apply</p>
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
                    <Input {...field} />
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
                  message: "Please enter a valid 10-digit phone number"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
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
                  message: "Please enter a valid email address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Input {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="p-4 sm:p-6 border rounded-lg space-y-4 bg-muted/30">
              <h2 className="text-lg sm:text-xl font-semibold">Payment Details</h2>
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm sm:text-base">UPI ID: <span className="font-mono font-medium">abithabala20@oksbi</span></p>
                <div className="space-y-2 w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px]">
                  <Image
                    src="/payment-upi-qr.jpg"
                    alt="Payment QR Code"
                    width={400}
                    height={400}
                    className="border-2 p-2 rounded-lg bg-white w-full h-auto"
                    priority
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    className="w-full"
                  >
                    Download QR Code
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Scan the QR code above or use the UPI ID to make the payment. You can download the QR code if needed. After payment, enter the transaction ID and upload the screenshot below.
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Payment Screenshot</FormLabel>
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary"
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
                        style={{ maxHeight: '400px', width: 'auto' }}
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
                    <p>Drag and drop your payment screenshot here, or click to select</p>
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
                className="w-full sm:w-auto min-w-[200px]"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
        <Toaster />
      </div>
    </div>
  );
}
