import Link from "next/link";
import { articles, cases, documents, equipment, gases, industries } from "@/content";
import { TechnicalDiagram } from "@/components/technical-diagram";
import { TrackedLink } from "@/components/tracked-link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Сжатие технологических газов под рабочую точку процесса",
  "Oil-Free компрессоры, бустеры, recovery и skid-системы для N₂, He, H₂, O₂, CO₂ и смесей. Подбор по Gas + P₁ + P₂ + Q и режиму работы.",
  "/",
);

const tasks = [
  { title: "Дожать азот после генератора", text: "Согласовать давление источника, буфер и потребление оборудования.", href: "nitrogen-booster-after-generator" },
  { title: "Повысить давление газа", text: "Перейти от условий источника к рабочей точке процесса.", href: "oil-free-gas-booster" },
  { title: "Подать газ в оборудование", text: "Учесть чистоту, потери давления и реальный цикл потребления.", href: "process-gas-compressor" },
  { title: "Вернуть газ в процесс", text: "Спроектировать сбор, подготовку и повторное сжатие.", href: "gas-transfer-recovery" },
  { title: "Заполнить буфер или ресивер", text: "Связать объём, время заполнения и пиковый расход.", href: "buffer-receiver-charging" },
  { title: "Встроить модуль в OEM-изделие", text: "Согласовать габариты, интерфейсы и границы управления.", href: "oem-gas-compression-module" },
  { title: "Собрать компрессорный skid", text: "Объединить компрессор, охлаждение, КИП и автоматику.", href: "compressor-skid" },
  { title: "Решить специальную задачу", text: "Начать с состава газа, диапазона режимов и ограничений.", href: "process-gas-compressor" },
];

const gasNotes: Record<string, string> = {
  n2: "Генерация, дожатие, подача в процесс", he: "Компрессия, герметичность, recovery", h2: "Состав, материалы, Ex-требования",
  o2: "Чистота, материалы, совместимость", co2: "Температура, давление, фазность", mixtures: "Состав и условия конкретного процесса",
};

const steps = [
  { title: "Разбираем процесс", text: "Источник газа, потребитель, состав, диапазон рабочих режимов. Фиксируем, что узел должен делать и где заканчивается его ответственность." },
  { title: "Проверяем рабочую точку", text: "P₁, P₂ и Q с единицами, температура, пики и непрерывность работы. Проверяем ограничения источника и тепловой режим." },
  { title: "Определяем конфигурацию", text: "Компрессорная часть, ступени, привод, охлаждение, буфер и регулирование. Согласуем материалы и газоспецифичные требования." },
  { title: "Согласуем поставку", text: "Компоновка, обвязка, КИП, интерфейсы автоматики, документация и приёмка. Результат — определённый функциональный узел." },
];

const scope = [
  { title: "Компрессорная часть и привод", text: "Под газ, давления, расход и согласованный режим нагрузки." },
  { title: "Охлаждение и буферизация", text: "Межступенчатое и конечное охлаждение, ресивер — по расчётной схеме." },
  { title: "Газовый тракт и КИП", text: "Арматура, измерение давления и температуры, согласованные защиты." },
  { title: "Управление и интеграция", text: "Шкаф, сигналы, последовательности пуска и останова, интерфейсы площадки." },
  { title: "Документация и границы поставки", text: "Схема, габарит, подключения, перечень сигналов и согласованный состав документов." },
];

export default function HomePage() {
  const featuredDocuments = documents.filter((document) => document.access !== "internal").slice(0, 3);
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">PROCESS GAS · OIL-FREE · BOOSTING · SKID</p>
          <h1>Сжимаем технологический газ под <span>рабочую точку процесса</span></h1>
          <p className="hero-description">Безмасляный компрессор, booster или skid-система — от рабочей точки Gas + P₁ + P₂ + Q до интеграции в ваш процесс. С охлаждением, КИП, обвязкой и автоматикой в согласованных границах.</p>
          <div className="hero-actions"><TrackedLink event="hero_rfq_click" className="button" href="/rfq/?source=%2F">Подобрать решение <span aria-hidden="true">→</span></TrackedLink><Link className="button button-secondary" href="#tasks">Смотреть типовые задачи <span aria-hidden="true">↓</span></Link></div>
          <p className="hero-note">Для инженера, интегратора и OEM.<br />Подбор начинается с процесса, газа и реальных условий работы.</p>
        </div>
        <div className="hero-art">
          <div className="hero-art-topline"><span>FUNCTIONAL COMPRESSION SYSTEM</span><span><span className="status-dot" />КОНЦЕПЦИЯ УЗЛА</span></div>
          <TechnicalDiagram kind="hero" />
          <div className="hero-point-note"><span>ВХОД <strong>Gas / P₁ / T₁</strong></span><span aria-hidden="true">→</span><span>ПРОЦЕСС <strong>P₂ / Q / режим</strong></span></div>
        </div>
      </div>
    </section>

    <section className="working-point-section" aria-labelledby="working-point-title">
      <div className="container working-point"><div className="working-point-title"><h2 id="working-point-title">Начните с рабочей точки</h2><p>Пять параметров для предметного разговора</p></div>
        <div className="working-point-fields">
          {[{ label: "Газ", symbol: "Gas", note: "состав и чистота" }, { label: "Давление на входе", symbol: "P₁", note: "минимум / максимум" }, { label: "Давление на выходе", symbol: "P₂", note: "на выходе узла" }, { label: "Производительность", symbol: "Q", note: "расход с единицами" }, { label: "Режим работы", symbol: "Duty", note: "24/7, циклы, пики" }].map((field) => <div className="working-point-field" key={field.symbol}><strong>{field.label}</strong><span className="wp-symbol">{field.symbol}</span><span>{field.note}</span></div>)}
          <div className="working-point-action"><Link href="/rfq/?source=%2F">Задать параметры <span aria-hidden="true">→</span></Link></div>
        </div>
      </div>
    </section>

    <section className="section" id="tasks" aria-labelledby="tasks-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">01 / Задача процесса</p><h2 id="tasks-title">Что должен делать<br />ваш газовый узел?</h2></div><Link href="/solutions/" className="text-link">Все решения <span aria-hidden="true">→</span></Link></div>
      <div className="task-grid">{tasks.map((task, index) => <Link className="task-card" href={`/solutions/${task.href}/`} key={`${task.href}-${index}`}><span className="task-card-index">0{index + 1} / TASK</span><h3>{task.title}</h3><p>{task.text}</p><span className="task-card-arrow" aria-hidden="true">→</span></Link>)}</div>
    </div></section>

    <section className="section gas-section" aria-labelledby="gases-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">02 / Газ определяет исполнение</p><h2 id="gases-title">Один процесс.<br />Разные требования к газу.</h2></div><p>Состав, чистота, температура и требования к герметичности меняют схему подбора. Начните с вашего газа.</p></div>
      <div className="gas-grid">{gases.map((gas) => <Link key={gas.id} href={`/gases/${gas.slug}/`} className="gas-tile"><span className="gas-symbol">{gas.symbol}</span><span className="gas-tile-title">{gas.title}</span><small>{gasNotes[gas.id]}</small><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div>
      <p className="gas-disclaimer">Применимость оборудования подтверждается для состава газа и выбранного исполнения. Наличие страницы газа не заменяет такую проверку.</p>
    </div></section>

    <section className="section" aria-labelledby="equipment-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">03 / Функциональные уровни</p><h2 id="equipment-title">От компрессорной части<br />до узла на общей раме.</h2></div><Link href="/equipment/" className="text-link">Типы оборудования <span aria-hidden="true">→</span></Link></div>
      <div className="equipment-feature"><div><TechnicalDiagram kind="medium" /><p className="equipment-notice">Схематическое изображение. Конструкция, мощность и рабочий диапазон определяются после инженерного расчёта.</p></div><div className="equipment-list">{equipment.map((item, index) => <Link key={item.id} href={`/equipment/${item.slug}/`} className="equipment-row"><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.summary}</p></div><span className="link-arrow" aria-hidden="true">→</span></Link>)}</div></div>
    </div></section>

    <section className="section engineering-section" aria-labelledby="engineering-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">04 / Инженерный подбор</p><h2 id="engineering-title">Сначала рабочая точка.<br />Затем конфигурация.</h2></div><p>Название модели не отвечает на вопрос, как узел будет работать в вашей системе. Подбор проходит четыре связанных этапа.</p></div>
      <div className="engineering-steps">{steps.map((step, index) => <div key={step.title} className="engineering-step"><span className="step-number">0{index + 1} —</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
      <div className="engineering-bottom"><p>Каталожный диапазон семейства не является гарантированной рабочей точкой. Газ, условия всасывания и режим проверяются отдельно.</p><Link href="/engineering/" className="text-link">Как выполняется подбор <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className="section skid-section" aria-labelledby="skid-title"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">05 / Границы поставки</p><h2 id="skid-title">Компрессор — часть системы.<br />Согласуем весь узел.</h2></div><p>В skid могут входить перечисленные функции. Итоговая комплектация фиксируется под процесс и условия площадки.</p></div>
      <div className="skid-layout"><TechnicalDiagram kind="large" /><div className="skid-scope">{scope.map((item) => <div key={item.title} className="scope-row"><div><h3>{item.title}</h3><p>{item.text}</p></div></div>)}</div></div>
    </div></section>

    <section className="section industry-section" aria-labelledby="industries-title"><div className="container industry-layout">
      <div className="industry-intro"><p className="eyebrow">06 / Контекст применения</p><h2 id="industries-title">Ваш процесс<br />задаёт требования.</h2><p>От отдельного стенда до OEM-машины. Проверяем связь компрессорной функции с задачей, интерфейсами и условиями эксплуатации.</p><Link className="text-link" href="/industries/">Отрасли и применения <span aria-hidden="true">→</span></Link></div>
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

    <section className="final-cta" aria-labelledby="final-cta-title"><div className="container final-cta-inner"><div><p className="eyebrow">10 / Следующий шаг</p><h2 id="final-cta-title">Опишите процесс.<br />Начнём с рабочей точки.</h2><p>Если параметры известны — укажите их с единицами. Если задача ещё формируется — добавьте диапазоны, источник газа и ограничения. Система подготовит структурированный инженерный запрос.</p></div><div className="final-cta-action"><strong>Gas + P₁ + P₂ + Q<br />Температура + режим + условия</strong><Link className="button" href="/rfq/?source=%2F">Передать рабочую точку <span aria-hidden="true">→</span></Link><p>Предварительный класс решения.<br />Подтверждение параметров — после расчёта.</p></div></div></section>
  </>;
}
