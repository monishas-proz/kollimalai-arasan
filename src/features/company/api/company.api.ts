import { apiClient } from "@/lib/api/api-client";
import type { CompanyResponse, CompanyLogoUploadResult } from "../types";
import type { UpdateCompanySchemaInput } from "../validations/company.schema";

/**
 * Fetch company settings for Admin dashboard.
 * Endpoint: GET /api/admin/company
 */
export async function getAdminCompany(): Promise<CompanyResponse> {
  const response = await apiClient.get<CompanyResponse>("/api/admin/company");

  if (!response.data) {
    throw new Error(response.message || "Failed to load company details");
  }

  return response.data;
}

/**
 * Update single company settings for Admin dashboard.
 * Endpoint: PUT /api/admin/company
 */
export async function updateAdminCompany(
  data: UpdateCompanySchemaInput
): Promise<CompanyResponse> {
  const response = await apiClient.put<CompanyResponse>(
    "/api/admin/company",
    data
  );

  if (!response.data) {
    throw new Error(response.message || "Failed to update company details");
  }

  return response.data;
}

/**
 * Upload company logo for Admin dashboard.
 * Endpoint: POST /api/admin/company/logo
 */
export async function uploadAdminCompanyLogo(
  formData: FormData
): Promise<CompanyLogoUploadResult> {
  const response = await apiClient.post<CompanyLogoUploadResult>(
    "/api/admin/company/logo",
    formData
  );

  if (!response.data) {
    throw new Error(response.message || "Failed to upload company logo");
  }

  return response.data;
}

/**
 * Fetch public company settings for storefront.
 * Endpoint: GET /api/company
 */
export async function getPublicCompany(): Promise<CompanyResponse> {
  const response = await apiClient.get<CompanyResponse>("/api/company");

  if (!response.data) {
    throw new Error(response.message || "Failed to load company details");
  }

  return response.data;
}
