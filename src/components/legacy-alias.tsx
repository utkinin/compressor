import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { isStaticPreview, previewBasePath } from "@/lib/preview";

/** Static hosts cannot emit a 308. Their small alias page declares the canonical and refreshes. */
export function LegacyAlias({ target, note }: { target: string; note?: string }) {
  if (!isStaticPreview) permanentRedirect(target);
  const previewTarget = `${previewBasePath}${target}`;
  return <>
    <meta httpEquiv="refresh" content={`0;url=${previewTarget}`} />
    <section className="container page-hero">
      <p className="eyebrow">Один смысл — один адрес</p>
      <h1>Материал находится по новому адресу</h1>
      <p>{note || "Сохранена исходная инженерная задача. Для неё используется одна каноническая страница."}</p>
      <div className="hero-actions"><Link className="button" href={target}>Перейти к материалу →</Link></div>
    </section>
  </>;
}
