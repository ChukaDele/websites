import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleView } from "../../../components/research/ArticleView";
import { ARTICLES, articleBySlug } from "../../../components/research/registry";
import { pageMetadata } from "../../../lib/seo";
import "../../research.css";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  return pageMetadata({ title: `${a.title} | The Bredge Research`, description: a.seoDescription, path: `/research/${a.slug}` });
}

export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();
  return (
    <PageShell>
      <ArticleView a={a} />
    </PageShell>
  );
}
