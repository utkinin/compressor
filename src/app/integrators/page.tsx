import Link from "next/link";
import { Breadcrumbs, BulletList, ContentSection } from "@/components/content-page";
import { CommercialHero } from "@/components/commercial-hero";
import { ProcessVisual } from "@/components/process-visual";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import "./integrators.css";

const title = "Компрессорные модули и системы для интеграторов";
const description = "Проектный подбор безмасляных компрессоров, бустеров и пневматических модулей для встраивания в машины и установки: от опытного образца до повторяемых поставок.";

export const metadata = pageMetadata(title, description, "/integrators/");

const directions = [
  {
    title: "Безмасляные поршневые компрессорные модули",
    text: "Для встраивания в машины, газогенераторы, лабораторные и испытательные установки. Конкретное исполнение подбирается по режиму, питанию, охлаждению, габаритам и интерфейсам.",
  },
  {
    title: "Компактные безмасляные компрессорные системы",
    text: "Компрессор с необходимыми функциями охлаждения, управления, накопления и подготовки воздуха — только в составе, который действительно требуется проекту.",
  },
  {
    title: "Безмасляные вакуумные модули",
    text: "Для технологических, аналитических и лабораторных установок, где вакуумный модуль является частью оборудования интегратора. Параметры и применимость подтверждаются для конкретной задачи.",
  },
  {
    title: "Компрессорные модули для транспорта и спецтехники",
    text: "Электрический или гидравлический привод, компактная установка на машине и воздухоснабжение пневматических потребителей. Тип компрессора и исполнение определяются требованиями конкретной машины.",
  },
] as const;

const inputs = [
  "Тип машины или системы и функция компрессорного модуля.",
  "Среда: воздух или технологический газ; известные требования к чистоте.",
  "Давление на входе, требуемое давление и производительность — если уже известны.",
  "Режим работы: непрерывный, периодический или заданный цикл.",
  "Питание или тип привода, доступное охлаждение и условия окружающей среды.",
  "Габаритные ограничения, монтажное положение и требования к шуму или вибрации, если они критичны.",
  "Интерфейсы управления, сигналы готовности, блокировки и требования к автоматике.",
  "Стадия проекта: концепт, прототип, испытания, серия или замена существующего оборудования.",
];

const deliverables = [
  "Инженерный подбор и согласование конфигурации под ТЗ машины или установки.",
  "Габаритные и присоединительные данные выбранного исполнения.",
  "Согласование электрических, газовых, охлаждающих и управляющих интерфейсов.",
  "CAD/3D — по запросу для идентифицированного проекта и при наличии модели выбранного исполнения.",
  "Состав поставки, документация, ЗИП и сервисная поддержка в согласованных границах.",
  "Фиксация согласованной конфигурации для повторяемых поставок.",
];

const projectStages = [
  ["Концепт", "Проверяем принцип, ограничения по габаритам, среде, давлению, расходу и приводу."],
  ["Прототип", "Фиксируем интерфейсы, состав модуля и данные для монтажа в опытную машину."],
  ["Испытания", "Уточняем режим, управление, охлаждение и требования к приёмке по фактической работе."],
  ["Повторяемая поставка", "Сохраняем согласованную конфигурацию, документацию и состав ЗИП для следующих машин."],
] as const;

export default function IntegratorsPage() {
  const rfq = "/rfq/?intake=integration&solution=equipment-integration&source=%2Fintegrators%2F";
  return <>
    <Breadcrumbs items={[{ label: "Интеграторам", href: "/integrators/" }]} />
    <CommercialHero
      eyebrow="Проектные поставки · интеграция в оборудование"
      title={title}
      summary="Подбираем компрессоры, бустеры и пневматические модули под ТЗ вашей машины или установки: производительность, давление, режим, питание, охлаждение, габариты, интерфейсы и управление. От опытного образца до повторяемых поставок."
      visualId="solution-integration"
      action={<div className="integrator-hero-actions"><Link className="button" href={rfq}>Передать ТЗ проекта <span aria-hidden="true">→</span></Link><a className="button button-secondary" href="#integration-data">Что подготовить</a></div>}
    />

    <section className="container integrator-focus" aria-labelledby="integrator-focus-title">
      <p className="eyebrow">Фокус Lanfor</p>
      <h2 id="integrator-focus-title">Проектные и повторяемые поставки для оборудования и машин</h2>
      <p>Основной сценарий — компрессорный или пневматический модуль становится частью вашей машины, стенда или технологической системы. Прорабатываем конфигурацию под конкретный проект и сохраняем её для следующих поставок.</p>
    </section>

    <section className="section" aria-labelledby="integrator-directions-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">Направления</p><h2 id="integrator-directions-title">Что можно встроить в оборудование</h2></div><p>Направления сгруппированы по функции и задаче. Конкретное исполнение, характеристики и документация определяются после инженерного подбора.</p></div>
      <div className="integrator-direction-grid">{directions.map((direction, index) => <article key={direction.title} className="integrator-direction-card"><span className="integrator-direction-index" aria-hidden="true">0{index + 1}</span><div><h3>{direction.title}</h3><p>{direction.text}</p></div></article>)}</div>
    </div></section>

    <section className="section integrator-interface-section" id="integration-data" aria-labelledby="integration-data-title"><div className="container integrator-interface-layout">
      <div><p className="eyebrow">Границы интеграции</p><h2 id="integration-data-title">Компрессорный модуль как часть вашей системы</h2><p>Модуль согласуется не только по производительности. Для повторяемой интеграции заранее фиксируем подключения и ограничения по четырём основным интерфейсам.</p><ProcessVisual id="process-integration" /></div>
      <ContentSection title="Что передать для начала"><BulletList items={inputs} /></ContentSection>
    </div></section>

    <section className="section" aria-labelledby="integrator-result-title"><div className="container integrator-result-layout">
      <ContentSection title="Что получает интегратор"><BulletList items={deliverables} /></ContentSection>
      <div><p className="eyebrow">От первого образца к серии</p><h2 id="integrator-result-title">Одна конфигурация — понятный путь проекта</h2><div className="integrator-stage-grid">{projectStages.map(([stage, text], index) => <article key={stage}><span aria-hidden="true">0{index + 1}</span><h3>{stage}</h3><p>{text}</p></article>)}</div></div>
    </div></section>

    <section className="container integrator-cta" aria-labelledby="integrator-cta-title"><div><p className="eyebrow">Начать проект</p><h2 id="integrator-cta-title">Передайте ТЗ, схему или данные существующего оборудования</h2><p>Если давления и расхода пока нет, достаточно описать функцию компрессорного модуля, машину, ограничения по установке и стадию проекта. Недостающие параметры уточним в процессе проработки.</p></div><Link className="button" href={rfq}>Передать ТЗ на интеграцию <span aria-hidden="true">→</span></Link></section>

    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: absoluteUrl("/integrators/"), inLanguage: "ru-RU", about: { "@type": "Thing", name: "Компрессорные модули для интеграции в оборудование" } }} />
  </>;
}
