"use client";

import { useLocale } from "next-intl";
import { Download } from "lucide-react";
import { cn } from "@/src/lib/utils";

const files: Record<string, string> = {
  mn: "/pdfFiles/Odin-Tech-Taniltsuulga.pdf",
  en: "/pdfFiles/Odin-Tech-Taniltsuulga-ENGLISH.pdf",
};

interface DownloadPdfButtonProps {
  label: string;
  className?: string;
}

export function DownloadPdfButton({ label, className }: DownloadPdfButtonProps) {
  const locale = useLocale();
  const href = files[locale] ?? files.mn;

  return (
    <a
      href={href}
      download
      className={cn(
        "inline-flex items-center gap-1.5  px-4 py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
        className,
      )}
    >
      <Download className="size-4" />
      {label}
    </a>
  );
}
