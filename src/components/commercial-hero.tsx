import type { ReactNode } from "react";
import { HeroVisual } from "@/components/hero-visual";
import "./commercial-visuals.css";

/** Copy and the object illustration have separate responsive space. */
export function CommercialHero({ eyebrow, title, summary, action, visualId }: {
  eyebrow: ReactNode;
  title: string;
  summary: string;
  action?: ReactNode;
  visualId: string;
}) {
  return <header className="container commercial-hero">
    <div className="commercial-hero-copy">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-summary">{summary}</p>
      {action ? <div className="hero-actions">{action}</div> : null}
    </div>
    <HeroVisual id={visualId} priority caption className="commercial-hero-image" />
  </header>;
}
