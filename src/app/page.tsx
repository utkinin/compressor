import Link from "next/link";
import { articles, solutions } from "@/content";
import { HomeHeroV3 } from "@/components/home-hero-v3";
import { HeroVisual } from "@/components/hero-visual";
import { ProcessVisual } from "@/components/process-visual";
import { GasBadge } from "@/components/gas-badge";
import type { GasId } from "@/content";
import { pageMetadata } from "@/lib/seo";
import "./home-page.css";

export const metadata = pageMetadata(
  "Безмасляные компрессоры и бустеры для технологических газов",
  "Безмасляное сжатие N₂, He, CO₂ и газовых смесей: дожатие азота после генератора, возврат гелия, подача газа в оборудование и проектный подбор.",
  "/",
);

const parameterRfq = "/rfq/?source=%2F";
const briefRfq = "/rfq/?intake=brief&source=%2F";

const scenarios = [
  { title: "Не хватает давления после генератора азота", text: "Подбор бустера под фактическое давление и производительность источника, требуемое давление и график потребления. Бустер повышает давление, но не создаёт дополнительный газ.", action: "Рассчитать дожатие азота", href: "/solutions/nitrogen-booster-after-generator/", label: "Азот после генератора" },
  { title: "Требуется газоснабжение лазерного станка", text: "Подача газа по требованиям станка: источник, давление, расход и подготовка. Азот или сжатый воздух рассматриваем с учётом материала и технологии резки.", action: "Подобрать систему для лазера", href: "/solutions/nitrogen-for-laser-cutting/", label: "Лазерная резка" },
  { title: "Нужно вернуть дорогой газ в процесс", text: "Сбор, буферизация и повторное сжатие гелия или другой подходящей среды. Учитываем качество возврата, допустимые потери и баланс полного цикла.", action: "Рассчитать возврат газа", href: "/solutions/helium-recovery/", label: "Гелий и возврат газа" },
  { title: "Нужно сжать CO₂ или другой технологический газ", text: "Подбор по составу среды, давлениям, расходу, температуре и режиму. Для CO₂ проверяем фазовое состояние по маршруту сжатия и охлаждения.", action: "Отправить параметры газа", href: "/solutions/process-gas-compressor/", label: "CO₂ и газовые смеси" },
  { title: "Нужно встроить компрессор в ваше оборудование", text: "Подбор компрессора и необходимой комплектации под габарит и интерфейсы вашей установки. Согласуем газовые подключения, питание, охлаждение, управление и доступ для сервиса.", action: "Подобрать модуль для встраивания", href: "/solutions/equipment-integration/", label: "Встраивание в оборудование" },
];

const parameters = [
  { label: "Газ", note: "Название, состав смеси и известные требования к чистоте." },
  { label: "P₁ — давление на входе", note: "Доступное давление источника и его изменения под нагрузкой." },
  { label: "P₂ — требуемое давление", note: "Давление, необходимое потребителю или следующему этапу процесса." },
  { label: "Q — расход", note: "Средний и пиковый расход с единицами и условиями приведения." },
  { label: "Режим работы", note: "Непрерывная работа, периодические включения или известный цикл." },
];

const supplyFormats = [
  { title: "Отдельный компрессор / бустер", text: "Базовое оборудование для интеграции в существующую систему. Подключения и внешние вспомогательные функции согласуем до поставки." },
  { title: "Компрессорный модуль", text: "Компрессор с необходимым охлаждением, КИП, защитами и элементами подключения — в составе, который требуется вашей установке." },
  { title: "Комплектная система", text: "Компрессор, буфер, арматура, автоматика, фильтрация и обвязка в согласованных границах поставки. Общая рама — при необходимости." },
];

const gases: { id: GasId; symbol: string; title: string; text: string; href: string }[] = [
  { id: "n2", symbol: "N₂", title: "Азот", text: "Дожатие после генератора, накопление и подача в оборудование.", href: "/equipment/nitrogen-compressors/" },
  { id: "he", symbol: "He", title: "Гелий", text: "Сжатие и возврат с учётом герметичности и допустимых потерь.", href: "/equipment/helium-compressors/" },
  { id: "co2", symbol: "CO₂", title: "Диоксид углерода", text: "Подбор с проверкой температуры и фазового состояния.", href: "/equipment/co2-compressors/" },
  { id: "mixtures", symbol: "Газ / смесь", title: "Другие технологические газы", text: "Индивидуальная проверка состава, материалов и применимости.", href: "/equipment/process-gas-compressors/" },
];

const engineeringSteps = [
  { title: "Разбираем процесс", text: "Определяем источник, потребителя, текущую схему и проблему, которую требуется решить." },
  { title: "Проверяем исходные данные", text: "Сопоставляем давление, расход, температуру, чистоту и график потребления с возможностями источника." },
  { title: "Подбираем компрессор", text: "Проверяем конструкцию, ступени, привод, охлаждение, материалы и применимость к выбранной среде." },
  { title: "Формируем поставку", text: "Согласуем комплектацию, подключения, документацию и границы ответственности." },
];

const deliverables = [
  { title: "Проверка исходных данных", result: "Перечень подтверждённых параметров и вопросов, которые нужно уточнить." },
  { title: "Расчёт компрессора", result: "Выбранное исполнение и рабочие характеристики для заданного газа и режима." },
  { title: "Согласование комплектации", result: "Состав поставки, подключения, КИП, автоматика и необходимые дополнительные компоненты." },
  { title: "Коммерческое предложение", result: "Техническое описание, стоимость, срок и условия поставки выбранного оборудования." },
];

export default function HomePage() {
  const featuredIds = ["how-to-select-nitrogen-booster", "booster-vs-source", "pressure-after-nitrogen-generator", "oil-free-compression", "what-to-specify-for-gas-compressor", "normal-and-actual-flow"];
  const featuredArticles = featuredIds.flatMap(id => articles.filter(article => article.id === id));
  const scenarioVisuals = new Map(solutions.map(solution => [`/solutions/${solution.slug}/`, solution.heroVisualId]));
  return <>
    <HomeHeroV3 />

    <section className="container home-process-band" aria-label="Принцип подачи газа"><ProcessVisual id="process-home" compact /></section>

    <section className="section v21-scenarios" id="tasks" aria-labelledby="tasks-title" data-home-section="scenarios"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">01 / Задача</p><h2 id="tasks-title">Что требуется решить?</h2></div><p>Выберите ближайшую задачу. На странице решения — схема, данные для подбора и необходимые проверки.</p></div>
      <div className="v21-scenario-grid">{scenarios.map((scenario, index) => <article className="v21-scenario" key={scenario.href}>{scenarioVisuals.get(scenario.href) && <Link className="home-scenario-image" href={scenario.href} aria-label={scenario.title}><HeroVisual id={scenarioVisuals.get(scenario.href)!} variant="card" /></Link>}<p className="v21-scenario-label"><span>0{index + 1}</span>{scenario.label}</p><h3><Link href={scenario.href}>{scenario.title}</Link></h3><p>{scenario.text}</p><Link className="v21-card-action" href={scenario.href}>{scenario.action}<span aria-hidden="true">→</span></Link></article>)}</div>
      <div className="v21-section-links"><Link href="/solutions/">Все решения <span aria-hidden="true">→</span></Link><Link href="/industries/">Отрасли и применения <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="working-point-section selection-parameters v21-parameters" aria-labelledby="working-point-title" data-home-section="parameters"><div className="container working-point">
      <div className="working-point-title"><h2 id="working-point-title">Начнём с 5 основных параметров</h2><p>Укажите газ, давление на входе, требуемое давление на выходе, расход и режим работы. Этого достаточно, чтобы начать подбор компрессора. Остальные параметры уточним в процессе проработки.</p></div>
      <div className="working-point-fields">{parameters.map(parameter => <div className="working-point-field" key={parameter.label}><strong>{parameter.label}</strong><span>{parameter.note}</span></div>)}</div>
      <div className="v21-parameters-footer"><p>Если расход или давление пока неизвестны, начните с модели оборудования, схемы процесса или описания задачи.</p><Link href={briefRfq}>Отправить то, что уже известно <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section v21-supply" aria-labelledby="supply-title" data-home-section="supply"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">02 / Формат поставки</p><h2 id="supply-title">От компрессора до комплектной системы</h2></div><p>Сначала выбираем компрессор или бустер. Затем определяем, какие дополнительные функции нужны именно вашему процессу.</p></div>
      <ProcessVisual id="supply-compressor-to-system" />
      <div className="v21-supply-grid">{supplyFormats.map(format => <article key={format.title}><h3>{format.title}</h3><p>{format.text}</p></article>)}</div>
      <p className="v21-supply-note">Состав системы определяется процессом. Ресивер, фильтрация, автоматика и другие элементы не включаются автоматически, если они не нужны для конкретной задачи.</p>
      <div className="v21-section-links"><Link href="/equipment/">Каталог компрессоров и бустеров <span aria-hidden="true">→</span></Link><Link href="/solutions/compressor-skid/">Комплектация на общей раме <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section gas-section v21-gases" aria-labelledby="gases-title" data-home-section="gases"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">03 / Среда и условия</p><h2 id="gases-title">Технологические газы требуют разного исполнения</h2></div><p>Состав, чистота, температура и требования к герметичности учитываются вместе с давлением, расходом и режимом.</p></div>
      <div className="v21-gas-grid">{gases.map(gas => <Link key={gas.symbol} href={gas.href} className="gas-tile v21-gas"><GasBadge gas={gas.id} /><span className="gas-tile-title">{gas.title}</span><small>{gas.text}</small><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div>
      <div className="v21-specialized"><p>Оборудование для работы с элегазом (SF₆) представлено в специализированном направлении SF6RUS.</p><a href="https://www.sf6rus.ru/products/0000004/" target="_blank" rel="noopener noreferrer">Оборудование и решения для работы с SF₆ — SF6RUS <span aria-hidden="true">↗</span><span className="sr-only"> (откроется в новой вкладке)</span></a></div>
      <div className="v21-section-links"><Link href="/gases/">Особенности технологических газов <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section engineering-section v21-engineering" aria-labelledby="engineering-title" data-home-section="engineering"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">04 / Подбор оборудования</p><h2 id="engineering-title">Как проходит инженерный подбор</h2></div><p>От описания процесса к выбору компрессора, необходимой комплектации и согласованной поставке.</p></div>
      <div className="engineering-steps">{engineeringSteps.map((step, index) => <article key={step.title} className="engineering-step"><span className="step-number">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      <div className="v21-section-links"><Link href="/engineering/">Подробнее о подборе <span aria-hidden="true">→</span></Link><Link href="/cases/">Примеры расчётных задач <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section v21-deliverables" aria-labelledby="deliverables-title" data-home-section="deliverables"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">05 / Результаты этапов</p><h2 id="deliverables-title">От расчёта до технического предложения</h2></div><p>Техническое предложение связывает условия процесса с выбранным оборудованием и конкретным составом поставки.</p></div>
      <div className="v21-deliverables-grid"><ol className="v21-deliverable-list">{deliverables.map((item, index) => <li key={item.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{item.title}</h3><p><strong>Результат:</strong> {item.result}</p></div></li>)}</ol>
        <div className="v21-technical-table"><table><caption>Что фиксируем при согласовании</caption><thead><tr><th scope="col">Данные</th><th scope="col">Содержание</th></tr></thead><tbody><tr><th scope="row">Среда</th><td>Газ, состав, чистота и существенные примеси</td></tr><tr><th scope="row">Режим</th><td>Диапазон входного давления, требуемое давление, расход и цикл</td></tr><tr><th scope="row">Исполнение</th><td>Материалы, охлаждение, герметичность и условия площадки</td></tr><tr><th scope="row">Поставка</th><td>Комплектация, подключения, документация и приёмка</td></tr></tbody></table><p>Конкретные характеристики выбранного исполнения подтверждаются расчётом для заданного газа и режима.</p><Link href="/documents/process-gas-questionnaire/">Заполнить опросный лист <span aria-hidden="true">→</span></Link></div>
      </div>
    </div></section>

    <section className="section knowledge-home v21-knowledge" aria-labelledby="knowledge-title" data-home-section="knowledge"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">06 / Экспертный центр</p><h2 id="knowledge-title">Практические материалы</h2></div><Link href="/knowledge/" className="text-link">База знаний <span aria-hidden="true">→</span></Link></div>
      <div className="knowledge-home-list">{featuredArticles.map((article, index) => <Link key={article.id} href={`/knowledge/${article.slug}/`} className="knowledge-home-item"><HeroVisual id={article.heroVisualId} variant="card" /><div><span className="home-knowledge-index">0{index + 1}</span><h3>{article.title}</h3><p>{article.summary}</p></div><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div>
    </div></section>

    <section className="final-cta v21-rfq" aria-labelledby="final-cta-title" data-home-section="rfq"><div className="container final-cta-inner">
      <div><p className="eyebrow">07 / Ваша задача</p><h2 id="final-cta-title">Расскажите о задаче — начнём с того, что уже известно</h2><p>Укажите газ, давление на входе, требуемое давление, расход и режим работы. Если часть параметров неизвестна, начните с ТЗ, паспорта оборудования, модели установки, схемы или описания текущей системы.</p></div>
      <div className="final-cta-action"><strong>Параметры или описание задачи</strong><Link className="button" href={parameterRfq}>Подобрать компрессор <span aria-hidden="true">→</span></Link><Link className="button button-secondary v21-brief-button" href={briefRfq}>Отправить ТЗ или описание <span aria-hidden="true">→</span></Link><p>Уточним недостающие данные и определим подход к расчёту.</p></div>
    </div></section>
  </>;
}
