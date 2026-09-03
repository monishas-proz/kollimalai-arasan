"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { CompanySettingsForm } from "@/features/company/components/CompanySettingsForm";

export default function AdminCompanyPage() {
  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Settings", href: "/admin/dashboard/settings" },
          { label: "Company Settings" },
        ]}
      />

      <AdminPageHeader
        title="Company Settings"
        description="Manage company details, brand logo, contact information, headquarters address, and tax compliance."
      />

      <CompanySettingsForm />
    </div>
  );
}
