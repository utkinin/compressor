import Link from "next/link";
import { publicNews } from "@/content/news";

function newsDate(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function NewsSection() {
  const items = publicNews();
  if (!items.length) return null;

  return <section className="content-section" id="news" aria-labelledby="news-heading">
    <h2 id="news-heading">Новости Lanfor</h2>
    <div className="content-grid">
      {items.map((item) => <article className="content-card" key={item.id}>
        <p className="article-meta"><time dateTime={item.published}>{newsDate(item.published)}</time></p>
        <h3><Link href={`/news/${item.slug}/`}>{item.title}</Link></h3>
        <p>{item.summary}</p>
      </article>)}
    </div>
  </section>;
}
