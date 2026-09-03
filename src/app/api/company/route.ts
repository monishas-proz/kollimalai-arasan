import { createApiHandler } from "@/lib/api/api-handler";
import { apiSuccess } from "@/lib/api/api-response";
import { companyService } from "@/features/company/services/company.service";

export const GET = createApiHandler(
  {
    GET: async () => {
      const company = await companyService.getCompany();
      return apiSuccess(company, "Company details fetched successfully");
    },
  },
  {
    requireAuth: false,
  }
);
