import { useTranslations } from "next-intl";
import { DownloadPdfButton } from "../downloadPDF";

export function AboutIntroduction({ paragraphs }: { paragraphs: readonly string[] }) {
  const t = useTranslations("about");
  const lastIndex = paragraphs.length - 1;

  return (
    <div className="max-w-3xl space-y-6">
      {paragraphs.map((paragraph, pi) => (
        <p key={pi} className="text-xl leading-[1.7] font-light text-foreground/85 sm:text-2xl">
          {paragraph}
          {pi === lastIndex && (
            <>
              {" "}
              <DownloadPdfButton label={t("downloadPdf")} />
            </>
          )}
        </p>
      ))}
    </div>
  );
}
