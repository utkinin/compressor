"use client";

import Link from "next/link";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import "./home-hero-v3.css";

const pains = [
  { id: "nitrogen", label: "Не хватает давления после генератора N₂", href: "/solutions/nitrogen-booster-after-generator/" },
  { id: "laser", label: "Нужен газ для лазерного станка", href: "/solutions/nitrogen-for-laser-cutting/" },
  { id: "helium", label: "Нужно вернуть гелий в процесс", href: "/solutions/helium-recovery/" },
  { id: "co2", label: "Нужно сжать CO₂ или другой газ", href: "/solutions/process-gas-compressor/" },
  { id: "integration", label: "Нужно встроить компрессор в оборудование", href: "/solutions/equipment-integration/" },
] as const;

const parameterRfq = "/rfq/?source=%2F";
const briefRfq = "/rfq/?intake=brief&source=%2F";

export function HomeHeroV3() {
  useEffect(() => { track("hero_view", { source_page: "/" }); }, []);

  return <section className="hero home-hero-v3" data-home-section="hero" aria-labelledby="home-hero-title">
    <div className="container home-hero-v3-grid">
      <div className="home-hero-v3-copy">
        <p className="eyebrow">БЕЗМАСЛЯНЫЕ КОМПРЕССОРЫ И БУСТЕРЫ · ТЕХНОЛОГИЧЕСКИЕ ГАЗЫ</p>
        <h1 id="home-hero-title">Компрессоры и бустеры для <span>технологических газов</span></h1>
        <p className="home-hero-v3-lead">Нужно повысить давление газа, вернуть его в процесс или подать в оборудование? Подберём компрессор или бустер по газу, P₁, P₂, расходу и режиму работы.</p>
        <div className="home-hero-v3-actions">
          <Link className="button" href={parameterRfq} onClick={() => track("hero_primary_cta_click", { source_page: "/", destination: "/rfq/" })}>Подобрать компрессор <span aria-hidden="true">→</span></Link>
          <Link className="button button-secondary" href={briefRfq} onClick={() => track("hero_secondary_cta_click", { source_page: "/", destination: "/rfq/" })}>Отправить ТЗ или параметры</Link>
        </div>
        <div className="home-pain-nav" aria-labelledby="home-pain-nav-title">
          <p id="home-pain-nav-title">С какой задачей вы пришли?</p>
          <div className="home-pain-nav-grid">
            {pains.map((pain, index) => <Link key={pain.id} href={pain.href} className={`home-pain-link${index === 0 ? " is-priority" : ""}`} onClick={() => track("hero_pain_click", { pain: pain.id, position: index + 1, source_page: "/", destination: pain.href })}>
              <span className="home-pain-index" aria-hidden="true">0{index + 1}</span><span>{pain.label}</span><span className="home-pain-arrow" aria-hidden="true">→</span>
            </Link>)}
          </div>
        </div>
      </div>

      <div className="home-product-visual" role="img" aria-label="Компрессорная система для сжатия технологического газа">
        <div className="home-product-visual-head"><span>Подбор по параметрам процесса</span><span>LANFOR GAS SYSTEMS</span></div>
        <div className="home-product-machine" aria-hidden="true">
          <div className="home-product-base" />
          <div className="home-product-motor"><i /><i /><i /><i /></div>
          <div className="home-product-coupling" />
          <div className="home-product-compressor"><span /><span /></div>
          <div className="home-product-cooler"><i /><i /><i /><i /><i /></div>
          <div className="home-product-control"><span /><i /></div>
          <div className="home-product-line line-a" />
          <div className="home-product-line line-b" />
        </div>
        <div className="home-product-parameters" aria-hidden="true"><span>Газ</span><span>P₁</span><span>P₂</span><span>Q</span><span>Режим</span></div>
        <p>Компрессор, охлаждение, КИП и другие элементы определяются после проверки исходных данных.</p>
      </div>
    </div>
  </section>;
}
