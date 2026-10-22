import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="container footer-top"><div><Link className="footer-brand" href="/">LANFOR<span>GAS SYSTEMS</span></Link><p>Безмасляные компрессоры<br />и бустеры для технологических газов.</p></div>
      <div className="footer-column"><strong>Решения</strong><Link href="/solutions/">Типовые задачи</Link><Link href="/gases/">Газы и смеси</Link><Link href="/equipment/">Типы оборудования</Link><Link href="/industries/">Отрасли и применения</Link></div>
      <div className="footer-column"><strong>Инженерная база</strong><Link href="/engineering/">Как подбираем</Link><Link href="/knowledge/">Инженерные ответы</Link><Link href="/cases/">Типовые рабочие задачи</Link><Link href="/documents/">Документы</Link></div>
      <div className="footer-column"><strong>Следующий шаг</strong><Link href="/rfq/">Подобрать компрессор</Link><Link href="/about/">О Lanfor</Link><Link href="/contacts/">Контакты</Link><Link href="/legal/">Правовая информация</Link></div>
    </div>
    <div className="container footer-bottom"><p>© {new Date().getFullYear()} Lanfor Gas Systems</p><div><Link href="/legal/privacy/">Политика обработки ПДн</Link><Link href="/legal/consent/">Согласие на обработку ПДн</Link></div><span className="footer-disclaimer">Каталожный диапазон не заменяет инженерный расчёт.</span></div>
  </footer>;
}
