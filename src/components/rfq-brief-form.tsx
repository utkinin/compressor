"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { briefRfqSchema } from "@/lib/rfq/brief-schema";
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_TOTAL_BYTES } from "@/lib/rfq/attachment-policy";
import { CONSENT_VERSION, GAS_OPTIONS, publicRfqContextLabel, sanitizeRfqContext, type Gas, type RfqRequestContext } from "@/lib/rfq/schema";
import { track } from "@/lib/analytics";
import { withBasePath } from "@/lib/preview";
import type { RfqFormMode } from "./rfq-intake";

type Errors = Record<string, string>;
type Receipt = { id: string; delivery: "preview" | "local-staging" | "webhook" | "outbox" };

export function BriefRfqForm({ mode, initialGas, initialRequest = {} }: { mode: RfqFormMode; initialGas?: Gas; initialRequest?: RfqRequestContext }) {
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [gas, setGas] = useState<Gas | "">(initialGas ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const key = useRef<string | null>(null);
  const started = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const context = sanitizeRfqContext(initialRequest);

  function event(name: string, delivery?: string) { if (mode !== "preview") track(name, { mode, code: "brief", ...(delivery ? { delivery } : {}) }); }
  function changed() {
    key.current = null;
    setFailure("");
    if (!started.current) { started.current = true; event("rfq_start"); }
  }
  function chooseFiles(selected: File[]) {
    changed();
    const invalid = selected.length > ATTACHMENT_MAX_FILES || selected.some(file => file.size === 0 || file.size > ATTACHMENT_MAX_BYTES || !/\.(?:pdf|jpe?g|png|txt)$/i.test(file.name)) || selected.reduce((sum, file) => sum + file.size, 0) > ATTACHMENT_MAX_TOTAL_BYTES;
    if (invalid) {
      setFiles([]);
      setErrors(previous => ({ ...previous, files: "Допустимы до 3 файлов PDF, JPG, PNG или TXT: до 5 МБ каждый и до 10 МБ суммарно. Пустые файлы не принимаются." }));
      return;
    }
    setFiles(selected);
    setErrors(previous => { const clean = { ...previous }; delete clean.files; return clean; });
  }
  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (sending || mode === "disabled") return;
    const query = new URLSearchParams(window.location.search);
    const source = query.get("source");
    const sourcePage = source?.startsWith("/") && !source.startsWith("//") ? source.split(/[?#]/)[0].slice(0, 300) : window.location.pathname;
    const candidate = {
      intake: "brief", description, ...(model.trim() ? { model } : {}), ...(gas ? { gas } : {}), attachmentCount: files.length,
      contact: { name, company, email, ...(phone.trim() ? { phone } : {}) },
      consent: { accepted: consent, version: CONSENT_VERSION },
      attribution: { sourcePage, landingPage: window.location.pathname },
      ...(Object.keys(context).length ? { requestContext: context } : {}), honeypot,
    };
    const parsed = briefRfqSchema.safeParse(candidate);
    if (!parsed.success || errors.files) {
      const next: Errors = errors.files ? { files: errors.files } : {};
      if (!parsed.success) for (const issue of parsed.error.issues) next[issue.path.join(".")] ??= issue.message;
      setErrors(next);
      event("rfq_validation_error");
      requestAnimationFrame(() => document.querySelector<HTMLElement>(".rfq-brief-form [aria-invalid='true']")?.focus());
      return;
    }
    setErrors({});
    if (mode === "preview") {
      setReceipt({ id: "DEMO", delivery: "preview" });
      setName(""); setCompany(""); setEmail(""); setPhone(""); setFiles([]); setConsent(false);
      requestAnimationFrame(() => heading.current?.focus());
      return;
    }
    setSending(true); setFailure(""); key.current ??= crypto.randomUUID(); event("rfq_submit");
    try {
      let body: string | FormData = JSON.stringify(parsed.data);
      if (files.length) { const data = new FormData(); data.set("payload", JSON.stringify(parsed.data)); for (const file of files) data.append("files", file, file.name); body = data; }
      const response = await fetch(withBasePath("/api/rfq"), { method: "POST", headers: { "Idempotency-Key": key.current, ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}) }, body });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("ok" in result) || result.ok !== true || !("id" in result) || typeof result.id !== "string" || !("delivery" in result) || !["local-staging", "webhook", "outbox"].includes(String(result.delivery))) {
        if (result && typeof result === "object" && "issues" in result && Array.isArray(result.issues)) {
          const next: Errors = {};
          for (const issue of result.issues) if (issue && typeof issue === "object" && "path" in issue && typeof issue.path === "string" && "message" in issue && typeof issue.message === "string") next[issue.path] = issue.message;
          setErrors(next);
        }
        throw new Error(result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : "Не удалось подтвердить приём запроса. Повторите отправку.");
      }
      setReceipt({ id: result.id, delivery: result.delivery as Receipt["delivery"] });
      setFiles([]); event("rfq_success", String(result.delivery));
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) { setFailure(error instanceof Error ? error.message : "Соединение прервано. Повторите отправку."); event("rfq_fail"); }
    finally { setSending(false); }
  }
  function error(field: string) { return errors[field] ? <span className="rfq-error" id={`brief-${field.replaceAll(".", "-")}-error`}>{errors[field]}</span> : null; }

  if (receipt) return <section className="rfq-success" role="status" data-testid="brief-receipt">
    <h2 ref={heading} tabIndex={-1}>{receipt.delivery === "preview" ? "Демонстрация пройдена" : receipt.delivery === "local-staging" ? "Тестовая заявка сохранена локально" : receipt.delivery === "outbox" ? "Запрос сохранён в очереди доставки" : "Запрос передан"}</h2>
    <p>{receipt.delivery === "preview" ? "Описание и файлы не отправлены и не сохранены. Это демонстрация формы; при закрытии страницы введённые данные будут потеряны." : receipt.delivery === "local-staging" ? "Тестовый запрос принят вместе с приложенными файлами. Инженер не получил уведомление; внешняя отправка в этом режиме отключена." : receipt.delivery === "outbox" ? "Запрос принят, внешняя доставка ожидает повторной попытки. Получение инженером ещё не подтверждено." : "Следующий шаг — уточнение исходных данных и проверка возможности подбора. Исполнение и характеристики согласуются после расчёта."}</p>
    <p>Номер: <strong>{receipt.id}</strong></p><button type="button" className="button" onClick={() => { key.current = null; setReceipt(null); }}>Вернуться к описанию задачи</button>
  </section>;

  return <form className="rfq-brief-form" onSubmit={submit} noValidate aria-busy={sending}>
    <fieldset disabled={sending}>
      <h2 className="rfq-title" ref={heading} tabIndex={-1}>Опишите задачу или приложите ТЗ</h2>
      <p>Расскажите, откуда поступает газ, для какого оборудования он нужен и что требуется изменить. Давление и расход можно уточнить позже.</p>
      {mode !== "live" && <div className="notice"><strong>{mode === "preview" ? "Демонстрационный режим" : mode === "staging" ? "Тестовый режим · локальная проверка" : "Отправка запросов пока отключена"}</strong><p>{mode === "preview" ? "Форма работает только в памяти браузера. Файлы не загружаются, контакты не передаются. Используйте тестовые данные." : mode === "staging" ? "Запрос и файлы сохраняются только в тестовой среде и не отправляются инженеру. Используйте тестовые данные." : "Можно подготовить описание. Отправка доступна после подключения приёма заявок и утверждения условий обработки данных."}</p></div>}
      {Object.keys(context).length > 0 && <p className="rfq-help">{(["equipment", "solution", "document"] as const).map(kind => context[kind] ? publicRfqContextLabel(kind, context[kind]!) : undefined).filter(Boolean).join(" · ")}</p>}
      <div className="field"><label htmlFor="brief-description">Задача и известные параметры</label><textarea id="brief-description" rows={6} maxLength={12000} value={description} onChange={e => { changed(); setDescription(e.target.value); }} aria-invalid={Boolean(errors.description)} aria-describedby="brief-description-help brief-description-error" /><span className="rfq-help" id="brief-description-help">Достаточно описания, модели установки или приложенного документа. Неизвестные P₁, P₂ и Q уточним при проработке.</span>{error("description")}</div>
      <div className="field-row"><div className="field"><label htmlFor="brief-model">Модель вашего станка или установки <span className="rfq-optional">(при наличии)</span></label><input id="brief-model" value={model} maxLength={300} onChange={e => { changed(); setModel(e.target.value); }} aria-invalid={Boolean(errors.model)} />{error("model")}</div><div className="field"><label htmlFor="brief-gas">Газ <span className="rfq-optional">(если известен)</span></label><select id="brief-gas" value={gas} onChange={e => { changed(); setGas(e.target.value as Gas | ""); }}><option value="">Нужно уточнить</option>{GAS_OPTIONS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div></div>
      <div className="field"><label htmlFor="brief-files">ТЗ, паспорт, схема или фото шильды <span className="rfq-optional">(при наличии)</span></label><input id="brief-files" type="file" accept={ATTACHMENT_ACCEPT} multiple onChange={e => chooseFiles(Array.from(e.target.files ?? []))} aria-invalid={Boolean(errors.files || errors.attachmentCount)} aria-describedby="brief-files-help brief-files-error" /><span className="rfq-help" id="brief-files-help">До 3 файлов PDF, JPG, PNG или TXT: до 5 МБ каждый и до 10 МБ вместе. Не прикладывайте коммерческую тайну или персональные данные третьих лиц.</span>{error("files")}{error("attachmentCount")}</div>
      {files.length > 0 && <ul className="brief-files-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name} · {Math.ceil(file.size / 1024)} КБ</span><button type="button" onClick={() => { changed(); setFiles(files.filter((_, i) => i !== index)); }} aria-label={`Убрать файл ${file.name}`}>Убрать</button></li>)}</ul>}
      <h3>Кому направить уточнения</h3>
      <div className="field-row"><div className="field"><label htmlFor="brief-name">Имя</label><input id="brief-name" autoComplete={mode === "preview" ? "off" : "name"} value={name} maxLength={120} onChange={e => { changed(); setName(e.target.value); }} aria-invalid={Boolean(errors["contact.name"])} aria-describedby="brief-contact-name-error" />{error("contact.name")}</div><div className="field"><label htmlFor="brief-company">Компания</label><input id="brief-company" autoComplete={mode === "preview" ? "off" : "organization"} value={company} maxLength={200} onChange={e => { changed(); setCompany(e.target.value); }} aria-invalid={Boolean(errors["contact.company"])} aria-describedby="brief-contact-company-error" />{error("contact.company")}</div></div>
      <div className="field-row"><div className="field"><label htmlFor="brief-email">Рабочий email</label><input id="brief-email" type="email" autoComplete={mode === "preview" ? "off" : "email"} value={email} maxLength={254} onChange={e => { changed(); setEmail(e.target.value); }} aria-invalid={Boolean(errors["contact.email"])} aria-describedby="brief-contact-email-error" />{error("contact.email")}</div><div className="field"><label htmlFor="brief-phone">Телефон <span className="rfq-optional">(при наличии)</span></label><input id="brief-phone" type="tel" autoComplete={mode === "preview" ? "off" : "tel"} value={phone} maxLength={50} onChange={e => { changed(); setPhone(e.target.value); }} /></div></div>
      <div className="rfq-honeypot" aria-hidden="true"><label htmlFor="brief-website">Не заполняйте поле</label><input id="brief-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} /></div>
      <div className="rfq-consent"><label><input id="brief-consent" type="checkbox" checked={consent} onChange={e => { changed(); setConsent(e.target.checked); }} aria-invalid={Boolean(errors["consent.accepted"])} aria-describedby="brief-consent-accepted-error" /><span>Я даю <Link href="/legal/consent/" target="_blank" rel="noopener noreferrer">согласие на обработку персональных данных</Link> для ответа на запрос и ознакомлен(а) с <Link href="/legal/privacy/" target="_blank" rel="noopener noreferrer">политикой обработки персональных данных</Link>. Рассылки в это согласие не входят.</span></label>{error("consent.accepted")}</div>
      {Object.keys(errors).length > 0 && <p className="rfq-error" role="alert">Проверьте отмеченные поля. Для обращения достаточно описания задачи, модели установки или файла; точные давления и расход не обязательны.</p>}
      {failure && <div className="rfq-server-error" role="alert"><strong>Приём запроса не подтверждён</strong><p>{failure}</p><p>Данные остались в форме. Повторная отправка без изменений использует тот же ключ и не создаёт дубликат.</p></div>}
      <button className="button" type="submit" disabled={sending || mode === "disabled"}>{sending ? "Отправляем…" : mode === "preview" ? "Завершить демонстрацию" : mode === "staging" ? "Сохранить тестовую заявку" : "Отправить ТЗ или описание"}</button>
    </fieldset>
  </form>;
}
