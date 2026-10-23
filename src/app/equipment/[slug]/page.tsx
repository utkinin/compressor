import { notFound } from "next/navigation";
import { contentRepository } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { PublicEquipmentPage } from "@/components/public-equipment-page";

export async function generateStaticParams() {
  const { equipment } = await contentRepository.getSnapshot();
  return equipment.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { equipment } = await contentRepository.getSnapshot();
  const item = equipment.find((entry) => entry.slug === slug);
  return item ? pageMetadata(item.title, item.summary, `/equipment/${item.slug}/`) : {};
}

export default async function EquipmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await contentRepository.getSnapshot();
  const item = content.equipment.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return <PublicEquipmentPage equipment={item} content={content} />;
}
