"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyKeys } from "@/lib/api/query-keys";
import {
  getAdminCompany,
  updateAdminCompany,
  uploadAdminCompanyLogo,
  getPublicCompany,
} from "../api/company.api";
import type { CompanyResponse, CompanyLogoUploadResult } from "../types";
import type { UpdateCompanySchemaInput } from "../validations/company.schema";

/**
 * Hook to fetch Admin Company details.
 */
export function useAdminCompany() {
  return useQuery<CompanyResponse>({
    queryKey: companyKeys.all,
    queryFn: getAdminCompany,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to update Admin Company details.
 */
export function useUpdateAdminCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, UpdateCompanySchemaInput>({
    mutationFn: (data: UpdateCompanySchemaInput) => updateAdminCompany(data),
    meta: {
      successMessage: "Company details updated successfully.",
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(companyKeys.all, updatedData);
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

/**
 * Hook to upload company logo.
 */
export function useUploadAdminCompanyLogo() {
  const queryClient = useQueryClient();

  return useMutation<CompanyLogoUploadResult, Error, FormData>({
    mutationFn: (formData: FormData) => uploadAdminCompanyLogo(formData),
    meta: {
      successMessage: "Company logo uploaded successfully.",
    },
    onSuccess: (result) => {
      if (result.company) {
        queryClient.setQueryData(companyKeys.all, result.company);
      }
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

/**
 * Hook to fetch Public Storefront Company details.
 */
export function usePublicCompany() {
  return useQuery<CompanyResponse>({
    queryKey: [...companyKeys.all, "public"],
    queryFn: getPublicCompany,
    staleTime: 5 * 60 * 1000,
  });
}
