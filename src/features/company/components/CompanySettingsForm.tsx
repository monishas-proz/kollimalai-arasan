"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  updateCompanySchema,
  type UpdateCompanySchemaInput,
} from "../validations/company.schema";
import {
  useAdminCompany,
  useUpdateAdminCompany,
  useUploadAdminCompanyLogo,
} from "../hooks/use-company";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export interface CompanyFormValues {
  companyName: string;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  website?: string | null;
  isActive?: boolean;
}

export function CompanySettingsForm() {
  const { data: company, isLoading, isError, error, refetch } = useAdminCompany();
  const updateMutation = useUpdateAdminCompany();
  const uploadLogoMutation = useUploadAdminCompanyLogo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(updateCompanySchema) as unknown as any,
    defaultValues: {
      companyName: "Kollimalai Arasan",
      email: null,
      phone: null,
      address: null,
      city: null,
      state: "Tamil Nadu",
      country: "India",
      pincode: null,
      gstNumber: null,
      panNumber: null,
      website: null,
      isActive: true,
    },
  });

  // Sync form with loaded data
  useEffect(() => {
    if (company) {
      reset({
        companyName: company.companyName || "Kollimalai Arasan",
        email: company.email || null,
        phone: company.phone ? company.phone.replace("+91", "") : null,
        address: company.address || null,
        city: company.city || null,
        state: company.state || "Tamil Nadu",
        country: company.country || "India",
        pincode: company.pincode || null,
        gstNumber: company.gstNumber || null,
        panNumber: company.panNumber || null,
        website: company.website || null,
        isActive: company.isActive ?? true,
      });

      if (company.logo) {
        setLogoPreview(company.logo);
      }
    }
  }, [company, reset]);

  // Handle Logo File Selection & Upload
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    setStatusMessage(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Logo image size must be less than 5MB");
      return;
    }

    // Validate type (SVG, JPEG, PNG, WebP, GIF)
    const validTypes = [
      "image/svg+xml",
      "image/svg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const isSvg =
      validTypes.includes(file.type.toLowerCase()) ||
      file.name.toLowerCase().endsWith(".svg");

    if (!validTypes.includes(file.type.toLowerCase()) && !isSvg) {
      setLogoError("Only SVG, JPEG, PNG, WebP, and GIF images are supported");
      return;
    }

    // Optimistic preview
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    // Upload via FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadLogoMutation.mutateAsync(formData);
      setLogoPreview(res.logo);
      setStatusMessage({
        type: "success",
        text: "Company logo uploaded and updated successfully!",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload logo";
      setLogoError(message);
      setLogoPreview(company?.logo || null);
    }
  };

  const onSubmit = async (values: UpdateCompanySchemaInput) => {
    setStatusMessage(null);
    try {
      await updateMutation.mutateAsync(values);
      setStatusMessage({
        type: "success",
        text: "Company settings updated successfully!",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save company settings";
      setStatusMessage({
        type: "error",
        text: message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <Spinner className="h-8 w-8 text-secondary-600 animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">
          Loading company settings...
        </p>
      </div>
    );
  }

  if (isError && !company) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 flex flex-col items-center space-y-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-base font-semibold">Failed to load company details</p>
        <p className="text-sm text-red-600">
          {(error as Error)?.message || "An unexpected error occurred."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Alert Header */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <p className="text-sm font-medium">{statusMessage.text}</p>
        </div>
      )}

      {/* Top Header Card: Brand Overview & Logo */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="pb-4 border-b border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-secondary-600" />
                Company Identity & Logo
              </CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                Configure your public brand identity, logo, and core business information.
              </p>
            </div>
            {company?.isActive !== undefined && (
              <Badge
                variant={company.isActive ? "default" : "secondary"}
                className={
                  company.isActive
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 self-start"
                    : "bg-neutral-100 text-neutral-600 border-neutral-200 self-start"
                }
              >
                {company.isActive ? "Active Company" : "Inactive"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Logo Preview Box */}
            <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center overflow-hidden p-2">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt={company?.companyName || "Company Logo"}
                  width={128}
                  height={128}
                  className="w-full h-full object-contain rounded-xl"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <Building2 className="h-8 w-8 text-neutral-400 mb-1" />
                  <span className="text-[11px] text-neutral-400 font-medium">
                    No Logo
                  </span>
                </div>
              )}

              {uploadLogoMutation.isPending && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                  <Spinner className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Logo Upload Actions */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-neutral-900">
                Company Brand Logo
              </h4>
              <p className="text-xs text-neutral-500 max-w-md">
                Recommended: Vector SVG, or square PNG, WebP, JPEG image (500x500px). Maximum file size: 5MB.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 justify-center sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/svg+xml,image/svg,.svg,image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadLogoMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 cursor-pointer font-medium hover:border-primary-500"
                >
                  <Upload className="h-4 w-4 text-primary-600" />
                  {uploadLogoMutation.isPending ? "Uploading..." : "Upload New Logo"}
                </Button>
              </div>

              {logoError && (
                <p className="text-xs text-red-600 font-medium pt-1">
                  {logoError}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details Card */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-neutral-100">
            <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-secondary-600" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    {...register("companyName")}
                    placeholder="e.g. Kollimalai Arasan"
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                </div>
                {errors.companyName && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Official Website
                </label>
                <div className="relative">
                  <Input
                    {...register("website")}
                    placeholder="e.g. https://kollimalaiarasan.com"
                    className={errors.website ? "border-red-500" : ""}
                  />
                </div>
                {errors.website && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 flex flex-col justify-center pt-2">
                <label className="text-xs font-semibold text-neutral-700">
                  Active Status
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value ?? true}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600" />
                        <span className="ml-3 text-xs font-medium text-neutral-700">
                          {field.value ? "Active" : "Inactive"}
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details Card */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-neutral-100">
            <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Support Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="e.g. support@kollimalaiarasan.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    {...register("phone")}
                    placeholder="e.g. 9876543210 or +919876543210"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address & Location Card */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-neutral-100">
            <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary-600" />
              Address & Headquarters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Street Address
              </label>
              <Input
                {...register("address")}
                placeholder="e.g. 123, Main Road, Hills Zone"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  City
                </label>
                <Input
                  {...register("city")}
                  placeholder="e.g. Namakkal"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  State
                </label>
                <Input
                  {...register("state")}
                  placeholder="e.g. Tamil Nadu"
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Country
                </label>
                <Input
                  {...register("country")}
                  placeholder="e.g. India"
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Postal Pincode
                </label>
                <Input
                  {...register("pincode")}
                  placeholder="e.g. 637001"
                  className={errors.pincode ? "border-red-500" : ""}
                />
                {errors.pincode && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Compliance Card */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-neutral-100">
            <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-secondary-600" />
              Tax & Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  GST Identification Number (GSTIN)
                </label>
                <Input
                  {...register("gstNumber")}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className={errors.gstNumber ? "border-red-500 uppercase" : "uppercase"}
                />
                {errors.gstNumber && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.gstNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Permanent Account Number (PAN)
                </label>
                <Input
                  {...register("panNumber")}
                  placeholder="e.g. AAAAA0000A"
                  className={errors.panNumber ? "border-red-500 uppercase" : "uppercase"}
                />
                {errors.panNumber && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.panNumber.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit & Metadata Information */}
        {company?.createdAt && (
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>
                Created: {new Date(company.createdAt).toLocaleString()}
              </span>
            </div>
            {company.updatedAt && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neutral-400" />
                <span>
                  Last Updated: {new Date(company.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className="text-neutral-400">
              UUID: <code className="font-mono text-[11px]">{company.id}</code>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 inline-flex items-center gap-2 font-medium bg-primary-600 hover:bg-primary-700 text-white cursor-pointer shadow-xs"
          >
            {updateMutation.isPending && (
              <Spinner className="h-4 w-4 text-white animate-spin" />
            )}
            Save Company Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
