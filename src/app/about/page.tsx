import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeroVisual } from "@/components/hero-visual";
import { ProcessVisual } from "@/components/process-visual";
import "@/components/commercial-visuals.css";
import { NewsSection } from "@/components/news-section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("О компании Lanfor Gas Systems", "Подбор компрессоров и бустеров для технологических газов. Параметры оборудования, необходимая комплектация и согласование границ поставки.", "/about/");

export default function AboutPage() {
  return <div className="container">
    <Breadcrumbs items={[{ label: "О компании", href: "/about/" }]} />
    <header className="commercial-hero"><div className="commercial-hero-copy"><p className="eyebrow">LANFOR / GAS SYSTEMS</p><h1>Подбираем компрессор.<br />Согласуем комплектацию.</h1><p className="page-summary">Lanfor Gas Systems подбирает компрессоры и бустеры для технологических газов. Начинаем с условий вашего процесса, затем определяем необходимую комплектацию и границы поставки.</p><div className="hero-actions"><Link className="button" href="/rfq/">Подобрать компрессор <span aria-hidden="true">→</span></Link></div></div><HeroVisual id="equipment-range" priority caption /></header>
    <section className="detail-layout content-section commercial-about-detail"><div className="prose"><h2>От параметров к выбору компрессора</h2><p>Сначала фиксируем состав газа, минимальное и максимальное давление всасывания, давление нагнетания, расход с условиями приведения и режим работы. Затем проверяем температуры, материалы, герметичность, охлаждение и требования площадки.</p><p>Сначала выбирается компрессор или бустер. Затем определяются необходимые опции: охлаждение, КИП, арматура, ресивер и автоматика. Возможна поставка отдельного компрессора или комплектной системы на общей раме. Состав и технические характеристики должны быть согласованы для конкретного исполнения.</p><h2>Что получит инженер и закупщик</h2><ul><li>Перечень исходных данных и открытых технических вопросов.</li><li>Согласованные параметры компрессора, подключения и границы поставки.</li><li>Состав документации и критерии приёмки для выбранной конфигурации.</li><li>Основание для расчёта и коммерческого предложения после проверки параметров.</li></ul></div><div className="commercial-about-visual"><ProcessVisual id="process-integration" compact /></div></section>
    <section className="content-section prose"><h2>Как начать подбор</h2><p>Укажите газ, давление на входе, требуемое давление на выходе, расход и режим работы. Если часть параметров ещё неизвестна, опишите задачу и ограничения процесса: уточним исходные данные при проработке.</p><p>В запрос можно добавить требования к чистоте, герметичности, размещению и автоматике. Комплектацию и техническую документацию согласуем для выбранного исполнения оборудования.</p><Link className="button" href="/rfq/">Подобрать компрессор</Link></section>
    <NewsSection />
  </div>;
}
