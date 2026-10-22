"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import {
  CONSENT_VERSION,
  GAS_FIELDS,
  GAS_OPTIONS,
  rfqSchema,
  validateRfqStep,
} from "@/lib/rfq/schema";
import "./rfq-form.css";

type Gas = (typeof GAS_OPTIONS)[number]["value"];
type PressureUnit = "bar(g)" | "bar(a)" | "MPa";
type FlowUnit = "Nm3/h" | "m3/h" | "l/min" | "kg/h";
type Duty = "continuous" | "intermittent" | "cycle" | "peak" | "unknown";
type FormMode = "staging" | "live" | "disabled" | "preview";
type RequestContext = { solution?: string; equipment?: string; document?: string };
type Attribution = {
  sourcePage: string;
  landingPage: string;
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
};
type Errors = Record<string, string>;
type Delivery = "webhook" | "local-staging" | "outbox" | "preview";

const steps = ["Газ", "Давление P₁", "Давление P₂", "Расход Q", "Режим"];
const dutyOptions: { value: Duty; title: string; description: string }[] = [
  { value: "continuous", title: "Непрерывный 24/7", description: "Работа в течение всей смены или суток" },
  { value: "intermittent", title: "Периодический", description: "Пуски по потребности процесса" },
  { value: "cycle", title: "По циклу", description: "Известны время работы и паузы" },
  { value: "peak", title: "Пиковая нагрузка", description: "Короткие периоды повышенного расхода" },
  { value: "unknown", title: "Нужно уточнить", description: "Инженер поможет описать режим" },
];

function cleanPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value.split(/[?#]/, 1)[0].slice(0, 300);
}

function captureAttribution(): Attribution {
  const query = new URLSearchParams(window.location.search);
  const utm: NonNullable<Attribution["utm"]> = {};
  for (const key of ["source", "medium", "campaign", "term", "content"] as const) {
    const value = query.get(`utm_${key}`);
    if (value) utm[key] = value.slice(0, 200);
  }
  const current: Attribution = {
    sourcePage: cleanPath(query.get("source"), window.location.pathname),
    landingPage: window.location.pathname,
    ...(Object.keys(utm).length ? { utm } : {}),
  };
  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      current.referrer = `${referrer.origin}${referrer.pathname}`.slice(0, 500);
      if (!query.get("source") && referrer.origin === window.location.origin) current.sourcePage = cleanPath(referrer.pathname, current.sourcePage);
    } catch {
      // Invalid referrer is not needed to qualify a working point.
    }
  }
  try {
    const stored = sessionStorage.getItem("lanfor-attribution");
    if (stored) {
      const value: unknown = JSON.parse(stored);
      if (typeof value === "object" && value !== null && "landingPage" in value && typeof value.landingPage === "string") {
        const storedUtm: NonNullable<Attribution["utm"]> = {};
        if ("utm" in value && typeof value.utm === "object" && value.utm !== null) {
          for (const key of ["source", "medium", "campaign", "term", "content"] as const) {
            if (key in value.utm) {
              const item = (value.utm as Record<string, unknown>)[key];
              if (typeof item === "string") storedUtm[key] = item.slice(0, 200);
            }
          }
        }
        return {
          ...current,
          landingPage: cleanPath(value.landingPage, current.landingPage),
          ...("referrer" in value && typeof value.referrer === "string" ? { referrer: value.referrer.slice(0, 500) } : {}),
          ...(Object.keys(storedUtm).length ? { utm: storedUtm } : {}),
        };
      }
    }
    sessionStorage.setItem("lanfor-attribution", JSON.stringify(current));
  } catch {
    // Storage can be unavailable in private browsing; attribution is optional.
  }
  return current;
}

function solutionClass(gas: Gas, details: Record<string, string>): string {
  if (gas === "he" && /recovery|возврат|рекуп|восстанов/i.test(details.mode ?? "")) return "Система возврата и повторного сжатия гелия";
  if (gas === "h2") return "Безмасляный компрессорный модуль для водорода";
  if (gas === "o2") return "Компрессорный узел в кислородно-совместимом исполнении";
  if (gas === "co2") return "Компрессорный модуль CO₂ с проверкой фазового состояния";
  if (gas === "mixtures") return "Компрессорный модуль для заданного состава газа";
  return "Безмасляный компрессор / booster с необходимой обвязкой";
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  return message ? <span className="rfq-error" id={id}>{message}</span> : null;
}

export function RfqForm({ mode, initialGas = "n2", initialRequest = {} }: { mode: FormMode; initialGas?: Gas; initialRequest?: RequestContext }) {
  const [step, setStep] = useState(0);
  const [review, setReview] = useState(false);
  const [gas, setGas] = useState<Gas>(initialGas);
  const [inlet, setInlet] = useState("");
  const [inletUnit, setInletUnit] = useState<PressureUnit>("bar(g)");
  const [inletReference, setInletReference] = useState<"gauge" | "absolute">("gauge");
  const [outlet, setOutlet] = useState("");
  const [outletUnit, setOutletUnit] = useState<PressureUnit>("bar(g)");
  const [outletReference, setOutletReference] = useState<"gauge" | "absolute">("gauge");
  const [flow, setFlow] = useState("");
  const [flowUnit, setFlowUnit] = useState<FlowUnit>("Nm3/h");
  const [flowReference, setFlowReference] = useState("0 °C; 1,01325 bar(a); сухой газ");
  const [duty, setDuty] = useState<Duty>("unknown");
  const [dutyDetails, setDutyDetails] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const attribution = useRef<Attribution>({ sourcePage: "/rfq", landingPage: "/rfq" });
  const context = [["Решение", initialRequest.solution], ["Оборудование", initialRequest.equipment], ["Документ", initialRequest.document]].filter((item) => item[1]).map(([label, value]) => `${label}: ${value}`).join(" · ");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState<{ id: string; delivery: Delivery } | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (mode !== "preview") attribution.current = captureAttribution();
  }, [mode]);

  function recordEvent(event: string, properties: Parameters<typeof track>[1] = {}) {
    if (mode !== "preview") track(event, properties);
  }

  function changed() {
    idempotencyKey.current = null;
    setServerError("");
    if (!hasStarted.current) {
      hasStarted.current = true;
      recordEvent("rfq_start", { gas, mode });
    }
  }

  function candidate() {
    return {
      gas,
      inlet: { value: inlet.trim() ? Number(inlet.replace(",", ".")) : Number.NaN, unit: inletUnit, ...(inletUnit === "MPa" ? { reference: inletReference } : {}) },
      outlet: { value: outlet.trim() ? Number(outlet.replace(",", ".")) : Number.NaN, unit: outletUnit, ...(outletUnit === "MPa" ? { reference: outletReference } : {}) },
      flow: { value: flow.trim() ? Number(flow.replace(",", ".")) : Number.NaN, unit: flowUnit, ...(flowUnit !== "kg/h" ? { reference: flowReference.trim() } : {}) },
      duty,
      dutyDetails: dutyDetails.trim(),
      ...(Object.keys(initialRequest).length ? { requestContext: initialRequest } : {}),
      details,
      contact: { name: name.trim(), company: company.trim(), email: email.trim(), ...(phone.trim() ? { phone: phone.trim() } : {}) },
      consent: { accepted: consent, version: CONSENT_VERSION },
      attribution: attribution.current,
      honeypot,
    };
  }

  function validate(currentStep?: number): boolean {
    const result = currentStep === undefined ? rfqSchema.safeParse(candidate()) : undefined;
    const issues = currentStep === undefined ? result && !result.success ? result.error.issues.map((issue) => ({ path: issue.path.map(String).join("."), message: issue.message })) : [] : validateRfqStep(currentStep, candidate());
    const nextErrors: Errors = {};
    for (const issue of issues) nextErrors[issue.path] ??= issue.message;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      recordEvent("rfq_validation_error", { step: step + 1, gas, mode });
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return false;
    }
    return true;
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate(step)) return;
    recordEvent("rfq_step_complete", { step: step + 1, gas, mode });
    if (step < 4) setStep(step + 1);
    else setReview(true);
    requestAnimationFrame(() => heading.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || mode === "disabled" || !validate()) return;
    const result = rfqSchema.safeParse(candidate());
    if (!result.success) return;
    if (mode === "preview") {
      setSuccess({ id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, delivery: "preview" });
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setConsent(false);
      requestAnimationFrame(() => heading.current?.focus());
      return;
    }
    setSending(true);
    setServerError("");
    idempotencyKey.current ??= crypto.randomUUID();
    recordEvent("rfq_submit", { gas, mode });
    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current },
        body: JSON.stringify(result.data),
      });
      const data: unknown = await response.json();
      if (!response.ok || typeof data !== "object" || data === null || !("ok" in data) || data.ok !== true) {
        if (typeof data === "object" && data !== null && "issues" in data && Array.isArray(data.issues)) {
          const nextErrors: Errors = {};
          for (const issue of data.issues) {
            if (typeof issue === "object" && issue !== null && "path" in issue && "message" in issue && typeof issue.path === "string" && typeof issue.message === "string") nextErrors[issue.path] = issue.message;
          }
          setErrors(nextErrors);
        }
        const detail = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : "Не удалось сохранить заявку";
        throw new Error(response.status === 429 ? "Слишком много запросов. Подождите немного и повторите отправку." : detail);
      }
      if (!("id" in data) || typeof data.id !== "string" || !("delivery" in data) || !["webhook", "local-staging", "outbox"].includes(String(data.delivery))) throw new Error("Ответ сервера не подтверждает сохранение. Повторите отправку с тем же ключом.");
      setSuccess({ id: data.id, delivery: data.delivery as Delivery });
      recordEvent("rfq_success", { gas, delivery: String(data.delivery), mode });
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Соединение прервано. Повторите отправку: повторная заявка не будет создана.");
      recordEvent("rfq_fail", { gas, mode });
    } finally {
      setSending(false);
    }
  }

  function pressureText(value: string, unit: PressureUnit, reference: "gauge" | "absolute") {
    return `${value} ${unit}${unit === "MPa" ? reference === "gauge" ? " (изб.)" : " (абс.)" : ""}`;
  }

  const gasLabel = GAS_OPTIONS.find((option) => option.value === gas)?.label ?? gas;

  if (success) return (
    <div className="rfq-success" role="status">
      <span className="rfq-success-mark" aria-hidden="true">✓</span>
      <p className="eyebrow">{success.delivery === "preview" ? "Демонстрация формы RFQ" : "Рабочая точка сохранена"}</p>
      <h2 ref={heading} tabIndex={-1}>{success.delivery === "preview" ? "Демонстрация пройдена" : success.delivery === "webhook" ? "Заявка передана в инженерный контур" : success.delivery === "local-staging" ? "Тестовая заявка сохранена локально" : "Заявка сохранена в очереди доставки"}</h2>
      <p>{success.delivery === "preview" ? "Заявка не отправлена и не сохранена. Это демонстрация интерфейса на GitHub Pages: сервер приёма заявок и CRM не подключены. Не вводите реальные контакты." : success.delivery === "webhook" ? "Следующий шаг — проверка исходных данных и согласование состава решения. Это ещё не подтверждение характеристик или подбор конкретной модели." : success.delivery === "local-staging" ? "Это проверка staging-сайта. CRM не подключена, инженер не получил уведомление. Используйте только тестовые контактные данные." : "Внешний сервис временно недоступен. Заявка принята в защищённое локальное хранилище; оператору требуется повторить доставку. Подтверждения получения инженером пока нет."}</p>
      <p className="rfq-request-id">{success.delivery === "preview" ? "Маркер демонстрации в этой вкладке" : "Номер заявки"}: <strong>{success.id}</strong></p>
      <Link className="button button-secondary" href="/solutions">Вернуться к решениям <span aria-hidden="true">→</span></Link>
    </div>
  );

  return (
    <div className="rfq-shell">
      <aside className="rfq-sidebar" aria-label="Этапы запроса">
        <p className="eyebrow">Пять исходных параметров</p>
        <ol className="rfq-steps">
          {steps.map((title, index) => (
            <li key={title} className={review || index < step ? "is-complete" : index === step ? "is-current" : ""}>
              <span className="rfq-step-number" aria-hidden="true">{review || index < step ? "✓" : `0${index + 1}`}</span>
              <span aria-current={!review && index === step ? "step" : undefined}>{title}</span>
            </li>
          ))}
        </ol>
        <div className="rfq-sidebar-note"><strong>Рабочая точка, а не артикул</strong><p>Укажем предварительный класс решения. Характеристики и состав поставки подтвердит инженер после проверки исходных данных.</p></div>
        {context && <p className="rfq-context">{context}</p>}
      </aside>
      <div className="rfq-main">
        {mode !== "live" && <div className="notice rfq-mode-notice"><strong>{mode === "preview" ? "GitHub Pages · демонстрационный режим" : mode === "staging" ? "Staging · локальная проверка" : "Приём заявок пока закрыт"}</strong><p>{mode === "preview" ? "Все шаги формы доступны для проверки. Заявка не отправляется и не сохраняется; CRM не подключена. Не вводите реальные контакты — используйте вымышленные данные." : mode === "staging" ? "Заявка сохраняется только в этой тестовой среде и не отправляется в CRM. Введите вымышленные контактные данные." : "Для отправки нужны настроенная доставка и утверждённые реквизиты оператора персональных данных. Рабочую точку можно заполнить и проверить."}</p></div>}
        <p className="rfq-step-label">{review ? "Проверка рабочей точки" : `Шаг ${step + 1} из 5`}</p>
        {!review ? <form onSubmit={next} noValidate>
          <h2 className="rfq-title" ref={heading} tabIndex={-1}>{["С каким газом работаем?", "Какое давление на входе?", "Какое давление нужно на выходе?", "Какой расход требуется?", "Как работает процесс?"][step]}</h2>
          {step === 0 && <>
            <fieldset className="rfq-fieldset"><legend className="sr-only">Выберите газ</legend><div className="rfq-gas-options">
              {GAS_OPTIONS.map((option) => <label key={option.value} className={`rfq-choice ${gas === option.value ? "is-selected" : ""}`}><input type="radio" name="gas" value={option.value} checked={gas === option.value} onChange={() => { changed(); setGas(option.value); setDetails({}); setErrors({}); }} /><span>{option.label}</span></label>)}
            </div></fieldset>
            <p className="rfq-help">Состав газа влияет на материалы, герметичность, охлаждение и требования безопасности. Если параметр неизвестен, укажите это явно.</p>
            <div className="rfq-dynamic-fields">
              {GAS_FIELDS[gas].map((field) => <div className="field" key={`${gas}-${field.key}`}><label htmlFor={`gas-${field.key}`}>{field.label}</label><input id={`gas-${field.key}`} value={details[field.key] ?? ""} maxLength={1000} aria-invalid={Boolean(errors[`details.${field.key}`])} aria-describedby={`help-${field.key} error-${field.key}`} onChange={(event) => { changed(); setDetails({ ...details, [field.key]: event.target.value }); }} /><span id={`help-${field.key}`} className="rfq-help">{field.help ?? "Укажите известные данные или напишите «нужно уточнить»."}</span><ErrorText id={`error-${field.key}`} message={errors[`details.${field.key}`]} /></div>)}
            </div>
          </>}
          {(step === 1 || step === 2) && <>
            <p className="rfq-intro">{step === 1 ? "P₁ — давление газа непосредственно перед компрессорным узлом, с учётом потерь в подводящей линии." : "P₂ — требуемое давление на выходе компрессорного узла. Потери в линии к потребителю могут потребовать P₂ выше рабочего давления оборудования. Длину линии, арматуру и требования потребителя укажите в дополнительных требованиях: инженер учтёт их при расчёте."}</p>
            <div className="rfq-pressure-row">
              <div className="field"><label htmlFor="pressure-value">{step === 1 ? "Давление на входе P₁" : "Давление на выходе P₂"}</label><input id="pressure-value" inputMode="decimal" autoComplete="off" value={step === 1 ? inlet : outlet} aria-invalid={Boolean(errors[`${step === 1 ? "inlet" : "outlet"}.value`])} aria-describedby="pressure-error pressure-note" onChange={(event) => { changed(); (step === 1 ? setInlet : setOutlet)(event.target.value); }} /><ErrorText id="pressure-error" message={errors[`${step === 1 ? "inlet" : "outlet"}.value`]} /></div>
              <div className="field"><label htmlFor="pressure-unit">Единица давления</label><select id="pressure-unit" value={step === 1 ? inletUnit : outletUnit} onChange={(event) => { changed(); (step === 1 ? setInletUnit : setOutletUnit)(event.target.value as PressureUnit); }}><option value="bar(g)">bar(g) — избыточное</option><option value="bar(a)">bar(a) — абсолютное</option><option value="MPa">MPa</option></select></div>
            </div>
            {(step === 1 ? inletUnit : outletUnit) === "MPa" && <div className="field"><label htmlFor="pressure-reference">Отсчёт для MPa</label><select id="pressure-reference" value={step === 1 ? inletReference : outletReference} onChange={(event) => { changed(); (step === 1 ? setInletReference : setOutletReference)(event.target.value as "gauge" | "absolute"); }}><option value="gauge">Избыточное давление</option><option value="absolute">Абсолютное давление</option></select></div>}
            <div className="rfq-engineering-note" id="pressure-note"><span aria-hidden="true">P</span><p><strong>Отсчёт имеет значение.</strong> bar(g) отсчитывается от атмосферного давления, bar(a) — от вакуума. Для предварительной проверки используем атмосферное давление 1,01325 bar; высоту площадки инженер уточнит отдельно.</p></div>
            {step === 2 && <p className="rfq-help">Указанное P₁: <strong>{pressureText(inlet, inletUnit, inletReference)}</strong></p>}
            <ErrorText id="pressure-group-error" message={errors[step === 1 ? "inlet" : "outlet"]} />
          </>}
          {step === 3 && <>
            <p className="rfq-intro">Объёмный расход без условий приведения неоднозначен. Укажите, относится он к нормальным условиям или к фактическому состоянию газа.</p>
            <div className="rfq-pressure-row"><div className="field"><label htmlFor="flow-value">Производительность Q</label><input id="flow-value" inputMode="decimal" value={flow} aria-invalid={Boolean(errors["flow.value"])} aria-describedby="flow-error" onChange={(event) => { changed(); setFlow(event.target.value); }} /><ErrorText id="flow-error" message={errors["flow.value"]} /></div><div className="field"><label htmlFor="flow-unit">Единица расхода</label><select id="flow-unit" value={flowUnit} onChange={(event) => { changed(); const unit = event.target.value as FlowUnit; setFlowUnit(unit); setFlowReference(unit === "Nm3/h" ? "0 °C; 1,01325 bar(a); сухой газ" : ""); }}><option value="Nm3/h">Nm³/h — нормальный объём</option><option value="m3/h">m³/h — фактический объём</option><option value="l/min">l/min — фактический объём</option><option value="kg/h">kg/h — массовый расход</option></select></div></div>
            {flowUnit !== "kg/h" && <div className="field"><label htmlFor="flow-reference">Условия расхода: температура и абсолютное давление</label><input id="flow-reference" value={flowReference} maxLength={300} aria-invalid={Boolean(errors["flow.reference"])} aria-describedby="flow-reference-help flow-reference-error" onChange={(event) => { changed(); setFlowReference(event.target.value); }} /><span className="rfq-help" id="flow-reference-help">{flowUnit === "Nm3/h" ? "Принятое определение Nm³/h указано явно. Измените, если ваши исходные данные приведены к другим условиям." : "Например: 20 °C; 8 bar(a), на входе компрессора. Если условия неизвестны, укажите это."}</span><ErrorText id="flow-reference-error" message={errors["flow.reference"]} /></div>}
            {flowUnit === "kg/h" && <div className="notice"><p>Для массового расхода инженер проверит состав, плотность и фазовое состояние газа. Автоматический пересчёт в объём не выполняется.</p></div>}
          </>}
          {step === 4 && <>
            <fieldset className="rfq-fieldset"><legend className="sr-only">Режим работы</legend><div className="rfq-duty-options">{dutyOptions.map((option) => <label className={`rfq-choice rfq-duty-choice ${duty === option.value ? "is-selected" : ""}`} key={option.value}><input type="radio" name="duty" value={option.value} checked={duty === option.value} onChange={() => { changed(); setDuty(option.value); }} /><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</div></fieldset>
            <div className="field"><label htmlFor="duty-details">Цикл, пиковая нагрузка и дополнительные требования <span className="rfq-optional">(при наличии)</span></label><textarea id="duty-details" rows={4} maxLength={1000} value={dutyDetails} onChange={(event) => { changed(); setDutyDetails(event.target.value); }} aria-invalid={Boolean(errors.dutyDetails)} aria-describedby="duty-error" /><ErrorText id="duty-error" message={errors.dutyDetails} /></div>
          </>}
          {Object.entries(errors).filter(([path]) => !path.includes(".") && path !== "dutyDetails").map(([path, message]) => <p className="rfq-error" key={path}>{message}</p>)}
          <div className="rfq-actions">{step > 0 && <button type="button" className="button button-secondary" onClick={() => { setErrors({}); setStep(step - 1); requestAnimationFrame(() => heading.current?.focus()); }}>← Назад</button>}<button type="submit" className="button">{step === 4 ? "Проверить рабочую точку" : "Продолжить"} <span aria-hidden="true">→</span></button></div>
        </form> : <form onSubmit={submit} noValidate aria-busy={sending}>
          <fieldset className="rfq-submit-fields" disabled={sending}>
          <h2 className="rfq-title" ref={heading} tabIndex={-1}>Рабочая точка для инженерного подбора</h2>
          <div className="rfq-summary"><dl><div><dt>Газ</dt><dd>{gasLabel}</dd></div><div><dt>P₁</dt><dd>{pressureText(inlet, inletUnit, inletReference)}</dd></div><div><dt>P₂</dt><dd>{pressureText(outlet, outletUnit, outletReference)}</dd></div><div><dt>Q</dt><dd>{flow} {flowUnit === "Nm3/h" ? "Nm³/h" : flowUnit === "m3/h" ? "m³/h" : flowUnit}</dd></div><div><dt>Режим</dt><dd>{dutyOptions.find((option) => option.value === duty)?.title}</dd></div></dl>{flowUnit !== "kg/h" && <p className="rfq-help">Условия Q: {flowReference}</p>}<details><summary>Уточняющие параметры газа</summary><dl className="rfq-details-summary">{GAS_FIELDS[gas].map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{details[field.key]}</dd></div>)}</dl>{dutyDetails && <p>{dutyDetails}</p>}</details></div>
          <div className="rfq-preliminary"><p className="eyebrow">Предварительный класс решения</p><h3>{solutionClass(gas, details)}</h3><p>Это направление инженерной проработки, без расчёта и выбора модели. Инженер проверит степень сжатия, температурный режим, материалы, герметичность, регулирование и комплектность.</p></div>
          <button type="button" className="rfq-edit" onClick={() => { setReview(false); setStep(0); setErrors({}); requestAnimationFrame(() => heading.current?.focus()); }}>← Изменить рабочую точку</button>
          <h3 className="rfq-contact-title">{mode === "preview" ? "Тестовые контактные данные" : "Кому направить уточнения?"}</h3>
          {mode === "preview" && <p className="rfq-help">Например: Тестовый инженер, Демо-компания, engineer@example.com. Эти поля показывают будущий сценарий приёма заявки; передача и хранение данных отключены.</p>}
          <div className="field-row"><div className="field"><label htmlFor="contact-name">Имя</label><input id="contact-name" autoComplete={mode === "preview" ? "off" : "name"} value={name} maxLength={120} aria-invalid={Boolean(errors["contact.name"])} aria-describedby="name-error" onChange={(event) => { changed(); setName(event.target.value); }} /><ErrorText id="name-error" message={errors["contact.name"]} /></div><div className="field"><label htmlFor="contact-company">Компания</label><input id="contact-company" autoComplete={mode === "preview" ? "off" : "organization"} value={company} maxLength={200} aria-invalid={Boolean(errors["contact.company"])} aria-describedby="company-error" onChange={(event) => { changed(); setCompany(event.target.value); }} /><ErrorText id="company-error" message={errors["contact.company"]} /></div></div>
          <div className="field-row"><div className="field"><label htmlFor="contact-email">Рабочий email</label><input id="contact-email" type="email" autoComplete={mode === "preview" ? "off" : "email"} value={email} maxLength={254} aria-invalid={Boolean(errors["contact.email"])} aria-describedby="email-error" onChange={(event) => { changed(); setEmail(event.target.value); }} /><ErrorText id="email-error" message={errors["contact.email"]} /></div><div className="field"><label htmlFor="contact-phone">Телефон <span className="rfq-optional">(необязательно)</span></label><input id="contact-phone" type="tel" autoComplete={mode === "preview" ? "off" : "tel"} value={phone} maxLength={40} aria-invalid={Boolean(errors["contact.phone"])} aria-describedby="phone-error" onChange={(event) => { changed(); setPhone(event.target.value); }} /><ErrorText id="phone-error" message={errors["contact.phone"]} /></div></div>
          <div className="rfq-honeypot" aria-hidden="true"><label htmlFor="company-website">Не заполняйте это поле</label><input id="company-website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></div>
          <div className="rfq-consent"><label><input type="checkbox" checked={consent} aria-invalid={Boolean(errors["consent.accepted"])} aria-describedby="consent-error" onChange={(event) => { changed(); setConsent(event.target.checked); }} /><span>Я даю <Link href="/legal/consent/" target="_blank" rel="noopener noreferrer">согласие на обработку персональных данных</Link> для ответа на мой запрос и ознакомлен(а) с <Link href="/legal/privacy/" target="_blank" rel="noopener noreferrer">политикой обработки персональных данных</Link>. Рассылки в это согласие не входят.</span></label><ErrorText id="consent-error" message={errors["consent.accepted"] ?? errors.consent} /><p className="rfq-help">Версия согласия: {CONSENT_VERSION}. {mode === "preview" ? "В этой демонстрации согласие не передаётся серверу и не сохраняется." : "Дата и время фиксируются сервером при получении заявки."}</p></div>
          {serverError && <div className="rfq-server-error" role="alert"><strong>Отправка не подтверждена</strong><p>{serverError}</p><p>Данные остались в форме. Повторная отправка без изменений использует тот же ключ и не создаст дубликат.</p></div>}
          {Object.keys(errors).length > 0 && <p className="rfq-error" role="alert">Проверьте отмеченные поля. Если ошибка относится к рабочей точке, вернитесь к её редактированию.</p>}
          <div className="rfq-actions"><button type="submit" className="button" disabled={sending || mode === "disabled"}>{sending ? "Сохраняем запрос…" : mode === "preview" ? "Завершить демонстрацию" : mode === "staging" ? "Сохранить тестовую заявку" : "Передать рабочую точку инженеру"}<span aria-hidden="true">→</span></button></div>
          <p className="rfq-help">{mode === "preview" ? "Демонстрация завершится в браузере без сетевой отправки и сохранения контактов." : mode === "staging" ? "Проверка полного пути RFQ без внешней отправки." : "Подтверждение приёма заявки не является коммерческим предложением или гарантией рабочей точки."}</p>
          </fieldset>
        </form>}
      </div>
    </div>
  );
}
