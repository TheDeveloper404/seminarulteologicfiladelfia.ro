import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sections/page-header";
import { SubNav } from "@/components/sections/sub-nav";
import type { ContentBlock, NavChild } from "@/lib/content/types";

interface ContentPageProps {
  block: ContentBlock;
  subNavItems?: NavChild[];
  compact?: boolean;
}

const LABEL_PATTERN = /^([^:]{1,45}):\s*(.+)$/;
const TIME_RANGE_PATTERN = /^(\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}):\s*(.+)$/;

function isHeading(paragraph: string) {
  return (
    paragraph.length <= 45 &&
    !/[.:;!?]$/.test(paragraph) &&
    !/^\d+\./.test(paragraph)
  );
}

function renderParagraph(paragraph: string) {
  if (isHeading(paragraph)) {
    return (
      <span className="font-heading text-base font-semibold text-foreground sm:text-lg">
        {paragraph}
      </span>
    );
  }
  const timeMatch = paragraph.match(TIME_RANGE_PATTERN);
  if (timeMatch) {
    return (
      <>
        <span className="font-semibold text-foreground">{timeMatch[1]}:</span>{" "}
        {timeMatch[2]}
      </>
    );
  }
  const labelMatch = paragraph.match(LABEL_PATTERN);
  if (labelMatch) {
    return (
      <>
        <span className="font-semibold text-foreground">{labelMatch[1]}:</span>{" "}
        {labelMatch[2]}
      </>
    );
  }
  return paragraph;
}

export function ContentPage({ block, subNavItems, compact }: ContentPageProps) {
  return (
    <>
      <PageHeader title={block.heading} description={block.summary} />
      {subNavItems && <SubNav items={subNavItems} />}
      <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl ml-10">
          {block.body.length > 0 &&
            (compact ? (
              <div className="grid gap-x-8 gap-y-3 border-l-4 border-secondary/60 pl-6 sm:grid-cols-2 sm:pl-8">
                {block.body.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-snug text-muted-foreground">
                    {renderParagraph(paragraph)}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-6 border-l-4 border-secondary/60 pl-6 sm:pl-8">
                {block.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                  >
                    {renderParagraph(paragraph)}
                  </p>
                ))}
              </div>
            ))}
          {block.curriculum && block.curriculum.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="w-12 border-b border-border px-4 py-3 font-heading font-semibold text-foreground">
                      Nr.
                    </th>
                    <th className="border-b border-border px-4 py-3 font-heading font-semibold text-foreground">
                      Anul I
                    </th>
                    <th className="border-b border-border px-4 py-3 font-heading font-semibold text-foreground">
                      Anul II
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {block.curriculum.map((row, i) => (
                    <tr key={i} className="odd:bg-card even:bg-muted/40">
                      <td className="border-b border-border px-4 py-3 align-top text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="border-b border-border px-4 py-3 align-top text-muted-foreground">
                        {row.anul1}
                      </td>
                      <td className="border-b border-border px-4 py-3 align-top text-muted-foreground">
                        {row.anul2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {block.downloads && block.downloads.length > 0 && (
            <div className="space-y-6 border-l-4 border-secondary/60 pl-6 sm:pl-8">
              {block.downloads.map((file) => (
                <div key={file.url} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{file.label}</p>
                  <Button
                    nativeButton={false}
                    render={<a href={file.url} download />}
                    className="bg-primary text-primary-foreground hover:bg-primary/80"
                  >
                    <Download data-icon="inline-start" />
                    Descarcă fișier (.pdf)
                  </Button>
                </div>
              ))}
            </div>
          )}
          {block.image && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Image
                src={block.image.url}
                alt={block.image.alt}
                width={1286}
                height={648}
                className="h-auto w-full"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
