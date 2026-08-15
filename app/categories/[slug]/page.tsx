import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/data/categories";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/search?category=${encodeURIComponent(slug)}`);
}