import Link from "next/link";

export default function NotFound() {
  return <section className="container page-hero"><p className="eyebrow">404 / Страница не найдена</p><h1>Пойдём от вашей задачи</h1><p className="page-intro">По этому адресу нет опубликованного материала. Найдите решение по газу или укажите параметры компрессора.</p><div className="button-row"><Link className="button" href="/solutions/">Типовые задачи</Link><Link className="button-secondary" href="/rfq/">Отправить параметры</Link></div></section>;
}
