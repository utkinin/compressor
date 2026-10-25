import Image from "next/image";
import { getVisualAsset } from "@/content/visuals";
import { withBasePath } from "@/lib/preview";
import "./visual-system.css";

type HeroVisualProps = {
  id: string;
  variant?: "hero" | "card" | "editorial";
  priority?: boolean;
  caption?: boolean;
  className?: string;
};

/** Public illustration assets are selected by the content registry, never by a source model. */
export function HeroVisual({ id, variant = "hero", priority = false, caption, className }: HeroVisualProps) {
  const asset = getVisualAsset(id);
  if (!asset?.approvedForPublic || !asset.src) return null;

  const source = variant === "card" && asset.cardSrc ? asset.cardSrc : asset.src;
  const sizes = variant === "card"
    ? "(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 45vw, 33vw"
    : "(min-width: 1440px) 600px, (min-width: 1024px) 46vw, (min-width: 768px) calc(100vw - 56px), calc(100vw - 40px)";
  const responsiveSources = variant === "card"
    ? [...(asset.responsiveSources?.filter(candidate => candidate.width < (asset.cardWidth ?? asset.width)) ?? []), ...(asset.cardSrc && asset.cardWidth ? [{ src: asset.cardSrc, width: asset.cardWidth }] : [])]
    : asset.responsiveSources;
  const responsiveSet = responsiveSources?.map(candidate => `${withBasePath(candidate.src)} ${candidate.width}w`).join(", ");
  const showCaption = caption ?? variant !== "card";
  const visibleCaption = asset.caption ?? (asset.depiction === "concept"
    ? "Иллюстрация компоновки. Исполнение определяется при подборе."
    : undefined);

  return <figure
    className={["hero-visual", "hero-visual--" + variant, "hero-visual--" + asset.kind, className].filter(Boolean).join(" ")}
    data-visual-id={asset.id}
    data-visual-kind={asset.kind}
    data-visual-variant={variant}
  >
    <div className="hero-visual-media" style={{ aspectRatio: variant === "card" ? "3 / 2" : asset.aspectRatio }}>
      <picture>
        {responsiveSet ? <source srcSet={responsiveSet} sizes={sizes} /> : variant !== "card" && asset.mobileSrc && <source media="(max-width: 767px)" srcSet={withBasePath(asset.mobileSrc)} />}
        <Image
          src={withBasePath(source)}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          unoptimized
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          style={{ objectPosition: asset.focalPoint ?? "50% 50%" }}
          sizes={sizes}
        />
      </picture>
    </div>
    {showCaption && visibleCaption && <figcaption>{visibleCaption}</figcaption>}
  </figure>;
}
