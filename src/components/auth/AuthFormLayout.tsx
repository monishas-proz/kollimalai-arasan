"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { usePublicCompany } from "@/features/company/hooks";

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  showLogo?: boolean;
  bottomContent?: ReactNode;
  showFooter?: boolean;
}

export default function AuthFormLayout({
  title,
  subtitle,
  children,
  showLogo = false,
  bottomContent,
  showFooter = false,
}: AuthFormLayoutProps) {
  const { data: company } = usePublicCompany();
  const logoSrc = company?.logo || "/logo.svg";
  const brandName = company?.companyName || "Kollimalai Arasan";

  return (
    <div className="mx-auto flex w-full max-w-[300px] flex-col justify-center sm:max-w-[420px] lg:max-w-[420px]">
      {/* Logo */}
      {showLogo && (
        <div className="mb-3 flex justify-center">
          <Image
            src={logoSrc}
            alt={brandName}
            width={56}
            height={56}
            className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 object-contain rounded-lg"
            priority
            unoptimized={Boolean(company?.logo)}
          />
        </div>
      )}

      {/* Heading */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold leading-tight text-neutral-900 md:text-4xl lg:text-4xl"
          style={{ fontFamily: "var(--font-hanken)" }}
        >
          {title}
        </h1>

        <p className="pb-3 text-sm leading-7 text-neutral-600 md:text-base">
          {subtitle}
        </p>
      </div>

      {/* Form */}
      <div>{children}</div>

      {/* Bottom Content */}
      {bottomContent && (
        <div className="mt-5 text-center">
          {bottomContent}
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500 md:text-sm">
          <a
            href="/privacy-policy"
            className="transition-colors hover:text-secondary-600"
          >
            Privacy Policy
          </a>

          <span>•</span>

          <a
            href="/terms-and-conditions"
            className="transition-colors hover:text-secondary-600"
          >
            Terms & Conditions
          </a>

          <span>•</span>

          <a
            href="/contact"
            className="transition-colors hover:text-secondary-600"
          >
            Contact Us
          </a>
        </div>
      )}
    </div>
  );
}