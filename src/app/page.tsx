import Link from "next/link";
import { articles, cases, documents, equipment, industries } from "@/content";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { TrackedLink } from "@/components/tracked-link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Компрессоры для технологических газов",
  "Подбираем компрессоры и бустеры для N₂, He, SF₆, CO₂ и других технологических газов по давлению на входе, требуемому давлению, расходу и режиму работы.",
  "/",
);

const tasks = [
  { title: "Дожать азот после генератора", text: "Согласовать давление источника, буфер и потребление оборудования.", href: "nitrogen-booster-after-generator" },
  { title: "Повысить давление газа", text: "Подобрать бустер под давление источника и требования процесса.", href: "oil-free-gas-booster" },
  { title: "Подать газ в оборудование", text: "Учесть чистоту, потери давления и реальный цикл потребления.", href: "process-gas-compressor" },
  { title: "Вернуть газ в процесс", text: "Спроектировать сбор, подготовку и повторное сжатие.", href: "gas-transfer-recovery" },
  { title: "Заполнить буфер или ресивер", text: "Связать объём, время заполнения и пиковый расход.", href: "buffer-receiver-charging" },
  { title: "Встроить компрессор в оборудование", text: "Согласовать габариты, подключения и управление с вашей системой.", href: "oem-gas-compression-module" },
  { title: "Поставить комплектную систему", text: "Определить необходимые опции и компоновку на общей раме.", href: "compressor-skid" },
  { title: "Решить специальную задачу", text: "Начать с состава газа, диапазона режимов и ограничений.", href: "process-gas-compressor" },
];

const featuredGases = [
  { symbol: "N₂", title: "Азот", note: "Дожатие после генератора, подача в процесс", href: "/gases/nitrogen/" },
  { symbol: "He", title: "Гелий", note: "Сжатие, герметичность, возврат газа", href: "/gases/helium/" },
  { symbol: "SF₆", title: "Элегаз", note: "Состав газа и параметры задачи для подбора", href: "/rfq/?gas=mixtures&source=%2F" },
  { symbol: "CO₂", title: "Диоксид углерода", note: "Температура, давление и фазовое состояние", href: "/gases/carbon-dioxide/" },
  { symbol: "Другие", title: "Технологические газы и смеси", note: "Подбор по составу и условиям процесса", href: "/gases/process-gas/" },
];

const steps = [
  { title: "Разбираем задачу", text: "Уточняем источник газа, потребителя, состав и диапазон режимов. Определяем требования к компрессору и подключениям." },
  { title: "Проверяем параметры", text: "P₁, P₂ и Q с единицами, температура, пики и непрерывность работы. Учитываем ограничения источника и тепловой режим." },
  { title: "Определяем конфигурацию", text: "Компрессорная часть, ступени, привод, охлаждение, буфер и регулирование. Согласуем материалы и газоспецифичные требования." },
  { title: "Согласуем поставку", text: "Определяем нужные опции, подключения, состав документации и приёмку. Фиксируем исполнение и комплектацию компрессора." },
];

const scope = [
  { title: "Охлаждение", text: "Воздушное или водяное охлаждение — по тепловой нагрузке и условиям площадки." },
  { title: "КИП", text: "Измерение давления и температуры — для контроля согласованных режимов." },
  { title: "Арматура", text: "Запорная и регулирующая арматура — под схему подключения компрессора." },
  { title: "Ресивер", text: "Буферный объём — если он необходим при переменном потреблении или заполнении системы." },
  { title: "Автоматика", text: "Управление и защиты — под компрессор и требования оборудования площадки." },
  { title: "Обвязка", text: "Трубопроводы и соединения — в согласованных границах поставки." },
];

export default function HomePage() {
  const featuredDocuments = documents.filter((document) => document.access !== "internal").slice(0, 3);
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">ГАЗОВЫЕ КОМПРЕССОРЫ · БУСТЕРЫ</p>
          <h1>Компрессоры для <span>технологических газов</span></h1>
          <p className="hero-description">Подбираем компрессоры и бустеры под ваши параметры. N₂, He, SF₆, CO₂ и другие технологические газы. Подбор по давлению на входе, требуемому давлению, расходу и режиму работы.</p>
          <div className="hero-actions"><TrackedLink event="hero_rfq_click" className="button" href="/rfq/?source=%2F">Подобрать компрессор <span aria-hidden="true">→</span></TrackedLink><Link className="button button-secondary" href="/rfq/?source=%2F">Отправить параметры <span aria-hidden="true">→</span></Link></div>
          <p className="hero-note">Для инженеров, технологов и снабжения.<br />Подбор по условиям вашего процесса.</p>
        </div>
        <div className="hero-art">
          <div className="hero-art-topline"><span>КОМПРЕССОР</span><span><span className="status-dot" />ПРИМЕР КОМПОНОВКИ</span></div>
          <TechnicalDiagram kind="small" title="Компрессор: входные и требуемые параметры" />
          <div className="hero-point-note"><span>НА ВХОДЕ <strong>Газ / P₁ / T₁</strong></span><span aria-hidden="true">→</span><span>НА ВЫХОДЕ <strong>P₂ / Q / режим</strong></span></div>
        </div>
      </div>
    </section>

    <section className="working-point-section selection-parameters" aria-labelledby="working-point-title">
      <div className="container working-point"><div className="working-point-title"><h2 id="working-point-title">Начнём с 5 основных параметров</h2><p>Укажите газ, давление на входе, требуемое давление на выходе, расход и режим работы. Этого достаточно, чтобы начать подбор компрессора. Остальные параметры уточним в процессе проработки.</p></div>
        <div className="working-point-fields">
          {[{ label: "Газ", note: "Состав и чистота" }, { label: "P₁ — давление на входе", note: "Доступное давление источника" }, { label: "P₂ — требуемое давление", note: "Необходимое давление после компрессора" }, { label: "Q — расход", note: "Значение с единицей измерения" }, { label: "Режим работы", note: "Непрерывно, периодически, по циклам" }].map((field) => <div className="working-point-field" key={field.label}><strong>{field.label}</strong><span>{field.note}</span></div>)}
        </div>
        <div className="selection-parameters-footer"><Link href="/rfq/?source=%2F">Отправить параметры <span aria-hidden="true">→</span></Link></div>
      </div>
    </section>

    <section className="section configuration-section" aria-labelledby="configuration-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">01 / Комплектация</p><h2 id="configuration-title">Комплектуем компрессор под задачу</h2></div><p>После выбора компрессора определяем необходимую комплектацию — от базового исполнения до комплектной системы на общей раме.</p></div>
      <ol className="configuration-flow" aria-label="От компрессора к комплектной системе"><li><span>КОМПРЕССОР</span></li><li><span>+ НЕОБХОДИМЫЕ ОПЦИИ</span></li><li><span>КОМПЛЕКТНАЯ СИСТЕМА</span></li></ol>
      <div className="configuration-options">{scope.map((item) => <article key={item.title}><div><h3>{item.title}</h3><span>По необходимости</span></div><p>{item.text}</p></article>)}</div>
      <p className="configuration-note">Не все опции обязательны. Состав поставки зависит от газа, параметров компрессора и условий эксплуатации. Комплектную систему на общей раме также называют skid-системой.</p>
    </div></section>

    <section className="section" id="tasks" aria-labelledby="tasks-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">02 / Задача процесса</p><h2 id="tasks-title">Какую задачу должен<br />решать компрессор?</h2></div><Link href="/solutions/" className="text-link">Все решения <span aria-hidden="true">→</span></Link></div>
      <div className="task-grid">{tasks.map((task, index) => <Link className="task-card" href={`/solutions/${task.href}/`} key={`${task.href}-${index}`}><span className="task-card-index">0{index + 1} / TASK</span><h3>{task.title}</h3><p>{task.text}</p><span className="task-card-arrow" aria-hidden="true">→</span></Link>)}</div>
    </div></section>

    <section className="section gas-section" aria-labelledby="gases-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">03 / Газ определяет исполнение</p><h2 id="gases-title">Один процесс.<br />Разные требования к газу.</h2></div><p>Состав, чистота, температура и требования к герметичности меняют схему подбора. Начните с вашего газа.</p></div>
      <div className="gas-grid home-gas-grid">{featuredGases.map((gas) => <Link key={gas.symbol} href={gas.href} className="gas-tile"><span className="gas-symbol">{gas.symbol}</span><span className="gas-tile-title">{gas.title}</span><small>{gas.note}</small><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div>
      <p className="gas-disclaimer">Применимость оборудования подтверждается для состава газа и выбранного исполнения. Наличие страницы газа не заменяет такую проверку.</p>
    </div></section>

    <section className="section" aria-labelledby="equipment-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">04 / Типы оборудования</p><h2 id="equipment-title">Компрессор, бустер<br />или комплектная система.</h2></div><Link href="/equipment/" className="text-link">Типы оборудования <span aria-hidden="true">→</span></Link></div>
      <div className="equipment-feature"><div><TechnicalDiagram kind="medium" title="Пример исполнения компрессора" /><p className="equipment-notice">Схематическое изображение. Конструкция, мощность и рабочий диапазон определяются после инженерного расчёта.</p></div><div className="equipment-list">{equipment.map((item, index) => <Link key={item.id} href={`/equipment/${item.slug}/`} className="equipment-row"><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.summary}</p></div><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div></div>
    </div></section>

    <section className="section engineering-section" aria-labelledby="engineering-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">05 / Инженерный подбор</p><h2 id="engineering-title">Сначала параметры.<br />Затем выбор компрессора.</h2></div><p>Название модели не отвечает на вопрос, как компрессор будет работать в вашей системе. Подбор проходит четыре связанных этапа.</p></div>
      <div className="engineering-steps">{steps.map((step, index) => <div key={step.title} className="engineering-step"><span className="step-number">0{index + 1} —</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
      <div className="engineering-bottom"><p>Каталожный диапазон семейства не подтверждает производительность в конкретных условиях. Газ, давления, температура и режим проверяются при расчёте.</p><Link href="/engineering/" className="text-link">Как выполняется подбор <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section industry-section" aria-labelledby="industries-title"><div className="container industry-layout">
      <div className="industry-intro"><p className="eyebrow">06 / Контекст применения</p><h2 id="industries-title">Ваш процесс<br />задаёт требования.</h2><p>От испытательного стенда до технологической линии. Проверяем связь компрессора с задачей, подключениями и условиями эксплуатации.</p><Link className="text-link" href="/industries/">Отрасли и применения <span aria-hidden="true">→</span></Link></div>
      <div className="industry-list">{industries.slice(0, 8).map((industry) => <Link key={industry.id} href={`/industries/${industry.slug}/`}>{industry.title}<span className="link-arrow" aria-hidden="true">→</span></Link>)}</div>
    </div></section>

    <section className="section" aria-labelledby="documents-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">07 / Основание для решения</p><h2 id="documents-title">Документы, с которыми<br />можно двигаться дальше.</h2></div><Link href="/documents/" className="text-link">Центр документов <span aria-hidden="true">→</span></Link></div>
      <div className="document-home-grid">{featuredDocuments.map((document) => <article key={document.id} className="document-home-card"><div className="document-type"><span>{document.type}</span><span aria-hidden="true">→</span></div><h3>{document.title}</h3><p>{document.summary}</p><Link className="text-link" href={`/documents/${document.slug}/`}>{document.access === "public" ? "Открыть документ" : "Запросить документ"}<span aria-hidden="true">→</span></Link><span className="document-access">{document.access === "public" ? "Открытый доступ" : "Для согласованной конфигурации"}</span></article>)}</div>
    </div></section>

    <section className="section" aria-labelledby="cases-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">08 / Типовые рабочие задачи</p><h2 id="cases-title">Как задача превращается<br />в инженерный запрос.</h2></div><p>Разборы типовых сценариев. Они помогают сформулировать запрос и не выдаются за реализованные проекты.</p></div>
      <div className="case-home-grid">{cases.slice(0, 3).map((item) => <article key={item.id} className="case-home-card"><span className="case-kind">Типовая инженерная задача</span><h3>{item.title}</h3><p>{item.summary}</p><Link className="text-link" href={`/cases/${item.slug}/`}>Разобрать задачу <span aria-hidden="true">→</span></Link></article>)}</div>
    </div></section>

    <section className="section knowledge-home" aria-labelledby="knowledge-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">09 / Инженерные ответы</p><h2 id="knowledge-title">Общие единицы.<br />Предметный разговор.</h2></div><Link href="/knowledge/" className="text-link">База знаний <span aria-hidden="true">→</span></Link></div>
      <div className="knowledge-home-list">{articles.slice(0, 6).map((article, index) => <Link key={article.id} href={`/knowledge/${article.slug}/`} className="knowledge-home-item"><span>0{index + 1}</span><div><h3>{article.title}</h3><p>{article.summary}</p></div><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div>
    </div></section>

    <section className="final-cta" aria-labelledby="final-cta-title"><div className="container final-cta-inner"><div><p className="eyebrow">10 / Следующий шаг</p><h2 id="final-cta-title">Расскажите о задаче.<br />Подберём компрессор.</h2><p>Укажите газ, давления, расход с единицами и режим работы. Если задача ещё формируется — добавьте известные параметры, источник газа и ограничения. Остальное уточним при подборе.</p></div><div className="final-cta-action"><strong>Газ + P₁ + P₂ + Q<br />Температура + режим + условия</strong><Link className="button" href="/rfq/?source=%2F">Отправить параметры <span aria-hidden="true">→</span></Link><p>Подбор исполнения и комплектации.<br />Характеристики проверяются расчётом.</p></div></div></section>
  </>;
}
