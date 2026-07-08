import { PageHeader } from "@/components/sections/page-header";
import { SubNav } from "@/components/sections/sub-nav";
import type { ContentBlock, NavChild } from "@/lib/content/types";

interface ContentPageProps {
  block: ContentBlock;
  subNavItems?: NavChild[];
}

export function ContentPage({ block, subNavItems }: ContentPageProps) {
  return (
    <>
      <PageHeader title={block.heading} description={block.summary} />
      {subNavItems && <SubNav items={subNavItems} />}
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:text-base lg:px-8">
        {block.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </>
  );
}
