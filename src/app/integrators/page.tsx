import Link from "next/link";
import { Breadcrumbs, BulletList, ContentSection } from "@/components/content-page";
import { CommercialHero } from "@/components/commercial-hero";
import { ProcessVisual } from "@/components/process-visual";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import "./integrators.css";

const title = "Компрессоры и модули для интеграции в оборудование";
const description = "Подбор компрессоров, бустеров и безмасляных модулей для производителей оборудования и системных интеграторов. Параметры, интерфейсы, данные для проектирования и повторяемые поставки.";

export const metadata = pageMetadata(title, description, "/integrators/");

const benefits = [
  {
    title: "Подбор под вашу систему",
    text: "Определяем подходящий тип компрессора или модуля по функции оборудования и исходным параметрам процесса.",
  },
  {
    title: "Интерфейсы для проектирования",
    text: "Согласовываем газовые, электрические, охлаждающие и управляющие подключения.",
  },
  {
    title: "Данные для компоновки",
    text: "Предоставляем габаритные и присоединительные данные выбранного исполнения. CAD/3D — по запросу для идентифицированного проекта и при наличии соответствующей модели.",
  },
  {
    title: "Повторяемая конфигурация",
    text: "После согласования фиксируем исполнение, состав поставки и документацию для следующих машин.",
  },
] as const;

const directions = [
  {
    title: "Компрессоры и бустеры для технологических газов",
    href: "/equipment/process-gas-compressors/",
    text: "Для азота, гелия, CO₂ и других технологических газов. Подбор выполняется по составу среды, P₁, P₂, расходу и режиму работы.",
  },
  {
    title: "Безмасляные поршневые компрессорные модули",
    href: "/equipment/oil-free-piston-compressor-modules/",
    text: "Для газогенераторов, аналитического, лабораторного, испытательного и другого оборудования, где компрессор является частью машины.",
  },
  {
    title: "Компактные безмасляные компрессорные системы",
    href: "/equipment/compact-oil-free-air-systems/",
    text: "Компрессор с необходимыми функциями охлаждения, управления, накопления и подготовки воздуха — в составе, который требуется конкретному проекту.",
  },
  {
    title: "Безмасляные вакуумные модули",
    href: "/equipment/oil-free-vacuum-modules/",
    text: "Для технологических, аналитических и лабораторных установок. Применимость и параметры подтверждаются для конкретной среды и режима.",
  },
] as const;

const quickStart = [
  "Что делает ваша машина и какую функцию должен выполнять компрессор или вакуумный модуль.",
  "Рабочая среда и известные значения давления, вакуума или расхода.",
  "Стадия проекта: концепт, прототип, испытания или серия.",
];

const deliverables = [
  "Тип компрессора или модуля.",
  "Параметры выбранного исполнения.",
  "Габаритные и присоединительные данные.",
  "Требования к питанию и охлаждению.",
  "Электрические и управляющие интерфейсы.",
  "Согласованный состав поставки.",
  "Техническая документация выбранного исполнения.",
  "Конфигурация для повторных поставок.",
];

const projectStages = [
  ["Концепт", "Проверяем принцип решения, среду, давление, расход, ограничения по размещению и тип привода."],
  ["Инженерный подбор", "Выбираем исполнение и фиксируем подключения, интерфейсы и границы поставки."],
  ["Опытная машина", "Уточняем режим работы, охлаждение, управление и требования по результатам испытаний."],
  ["Повторная поставка", "Сохраняем согласованную конфигурацию, документацию и состав поставки для следующих машин."],
] as const;

const orderChecks = [
  "Выбранное исполнение.",
  "Технические параметры.",
  "Состав и границы поставки.",
  "Комплект документации.",
  "Условия и срок поставки.",
  "Гарантийные условия.",
  "Требования к приёмке, если они предусмотрены проектом.",
  "ЗИП и сервис, если они входят в проект.",
];

export default function IntegratorsPage() {
  const rfq = "/rfq/?intake=integration&solution=equipment-integration&source=%2Fintegrators%2F";
  return <>
    <Breadcrumbs items={[{ label: "Интеграторам", href: "/integrators/" }]} />
    <CommercialHero
      eyebrow="Для производителей оборудования и системных интеграторов"
      title={title}
      summary="Подбираем компрессорный или вакуумный модуль под функцию вашей машины или установки. Согласуем параметры, габариты, подключения и управление — от первого проекта до повторяемой поставки."
      visualId="solution-integration"
      action={<div className="integrator-hero-actions"><Link className="button" href={rfq}>Передать ТЗ проекта <span aria-hidden="true">→</span></Link><a className="button button-secondary" href="#integration-data">Данные для проектирования</a></div>}
    />

    <section className="container integrator-focus" aria-labelledby="integrator-focus-title">
      <p className="eyebrow">Интеграция в оборудование</p>
      <h2 id="integrator-focus-title">Компрессорный узел как часть вашей машины</h2>
      <p>Lanfor помогает встроить компрессор, бустер или вакуумный модуль в оборудование заказчика и довести выбранную конфигурацию до повторяемой проектной поставки.</p>
      <p>Начинаем не с каталога, а с задачи оборудования: какая среда используется, какое давление или вакуум требуется, какой расход нужен, как работает машина и какие ограничения есть по питанию, охлаждению, габаритам и управлению.</p>
    </section>

    <section className="section" aria-labelledby="integrator-benefits-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">Что получает проект</p><h2 id="integrator-benefits-title">Инженерная определённость до заказа</h2></div><p>Задача — не просто подобрать компрессор, а заранее согласовать то, что понадобится вашей команде для компоновки, подключения и повторной поставки.</p></div>
      <div className="integrator-direction-grid">{benefits.map((benefit, index) => <article key={benefit.title} className="integrator-direction-card"><span className="integrator-direction-index" aria-hidden="true">0{index + 1}</span><div><h3>{benefit.title}</h3><p>{benefit.text}</p></div></article>)}</div>
    </div></section>

    <section className="section" aria-labelledby="integrator-directions-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">Направления</p><h2 id="integrator-directions-title">Что можно встроить в оборудование</h2></div><p>Направления сгруппированы по функции. Конкретное исполнение, характеристики и документация определяются после инженерного подбора.</p></div>
      <div className="integrator-direction-grid">{directions.map((direction, index) => <article key={direction.title} className="integrator-direction-card"><span className="integrator-direction-index" aria-hidden="true">0{index + 1}</span><div><h3><Link href={direction.href}>{direction.title}</Link></h3><p>{direction.text}</p><Link className="text-link" href={direction.href}>Подробнее о направлении <span aria-hidden="true">→</span></Link></div></article>)}</div>
    </div></section>

    <section className="section integrator-interface-section" id="integration-data" aria-labelledby="integration-data-title"><div className="container integrator-interface-layout">
      <div><p className="eyebrow">Для быстрого старта</p><h2 id="integration-data-title">Для начала достаточно описать задачу</h2><p>Необязательно иметь полностью подготовленное ТЗ. Для предварительной проработки достаточно трёх исходных пунктов.</p><ProcessVisual id="process-integration" /></div>
      <ContentSection title="Что передать"><BulletList items={quickStart} /><p>Если уже известны требования к питанию, охлаждению, габаритам, монтажному положению, шуму, вибрации или управлению — добавьте их к запросу.</p><p>Можно приложить ТЗ, схему, чертёж или данные существующего оборудования.</p></ContentSection>
    </div></section>

    <section className="section" aria-labelledby="integrator-result-title"><div className="container integrator-result-layout">
      <ContentSection title="Результат инженерной проработки"><BulletList items={deliverables} /></ContentSection>
      <div><p className="eyebrow">От первого проекта к повторяемой поставке</p><h2 id="integrator-result-title">Понятный путь проекта</h2><div className="integrator-stage-grid">{projectStages.map(([stage, text], index) => <article key={stage}><span aria-hidden="true">0{index + 1}</span><h3>{stage}</h3><p>{text}</p></article>)}</div></div>
    </div></section>

    <section className="section integrator-interface-section" aria-labelledby="integrator-order-title"><div className="container integrator-result-layout">
      <div><p className="eyebrow">До размещения заказа</p><h2 id="integrator-order-title">Что фиксируем в коммерческом предложении</h2><p>Техническая и коммерческая части проекта остаются привязаны к одной согласованной конфигурации. Подтверждаем только те параметры и условия, которые относятся к выбранному исполнению и конкретной поставке.</p></div>
      <ContentSection title="Подтверждаем по проекту"><BulletList items={orderChecks} /></ContentSection>
    </div></section>

    <section className="container integrator-cta" aria-labelledby="integrator-cta-title"><div><p className="eyebrow">Обсудить интеграцию</p><h2 id="integrator-cta-title">Передайте ТЗ, схему или кратко опишите оборудование</h2><p>Если часть параметров пока неизвестна, достаточно описать функцию компрессорного модуля и ограничения машины — недостающие данные уточним при инженерной проработке.</p></div><Link className="button" href={rfq}>Передать ТЗ проекта <span aria-hidden="true">→</span></Link></section>

    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": absoluteUrl("/integrators/#webpage"), name: title, description, url: absoluteUrl("/integrators/"), inLanguage: "ru-RU", about: { "@id": absoluteUrl("/integrators/#service") } },
        { "@type": "Service", "@id": absoluteUrl("/integrators/#service"), name: "Подбор и интеграция компрессорных модулей в оборудование", serviceType: "Инженерный подбор и проектная поставка компрессорных, бустерных и вакуумных модулей", provider: { "@type": "Organization", name: "Lanfor Gas Systems", url: absoluteUrl("/") } },
      ],
    }} />
  </>;
}
