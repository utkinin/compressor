import { getProcessSpec } from "@/content/visuals";
import "./visual-system.css";

type ProcessSpec = NonNullable<ReturnType<typeof getProcessSpec>>;
type ProcessStep = NonNullable<ProcessSpec["steps"]>[number];

/** Large object pictograms carry the process; all meaningful labels remain HTML. */
function ProcessObject({ kind = "compressor" }: { kind?: string }) {
  let object;
  switch (kind) {
    case "generator":
    case "source":
      object = <>
        <ellipse cx="89" cy="116" rx="66" ry="8" fill="#e5e9e1" />
        <path d="M35 35 56 25h66l20 10v75H35Z" fill="#edf0e8" stroke="#71816b" strokeWidth="2" />
        <path d="m122 25 20 10v75h-20Z" fill="#c8d2bf" stroke="#71816b" strokeWidth="2" />
        <rect x="48" y="38" width="23" height="63" rx="10" fill="#d5e0cc" stroke="#71816b" strokeWidth="2" />
        <rect x="78" y="38" width="23" height="63" rx="10" fill="#d5e0cc" stroke="#71816b" strokeWidth="2" />
        <path d="M59 38v-9m31 9v-9m-32 75v8m32-8v8m12-47h20m20 0h11" stroke="#5b7251" strokeWidth="4" fill="none" />
        <rect x="128" y="45" width="7" height="17" rx="1" fill="#b74726" />
      </>;
      break;
    case "receiver":
    case "buffer":
    case "storage":
      object = <>
        <ellipse cx="90" cy="120" rx="46" ry="6" fill="#e5e9e1" />
        <rect x="55" y="23" width="70" height="88" rx="31" fill="#e3e9db" stroke="#71816b" strokeWidth="2" />
        <path d="M105 26c12 8 16 20 16 39v16c0 13-6 23-16 28" stroke="#c4d1b8" strokeWidth="9" fill="none" />
        <path d="M76 109v12m28-12v12M54 62H35m89-18h22M90 23V12" stroke="#5b7251" strokeWidth="4" fill="none" />
        <path d="M35 57v11m111-30v11M83 12h14" stroke="#b74726" strokeWidth="4" />
      </>;
      break;
    case "cooling":
    case "dryer":
      object = <>
        <ellipse cx="89" cy="117" rx="57" ry="7" fill="#e5e9e1" />
        <path d="m40 35 16-10h70l14 10v76H40Z" fill="#e8eee2" stroke="#71816b" strokeWidth="2" />
        <path d="m126 25 14 10v76h-14Z" fill="#c9d6c0" stroke="#71816b" strokeWidth="2" />
        <rect x="51" y="45" width="64" height="55" rx="2" fill="#f9fbf6" stroke="#71816b" strokeWidth="2" />
        <circle cx="83" cy="72" r="21" fill="#e0e9d8" stroke="#71816b" strokeWidth="2" />
        <path d="M83 55c13 3 11 12 2 15m14 3c-3 13-12 11-15 2m-5 14c-13-3-11-12-2-15M67 70c3-13 12-11 15-2" stroke="#71816b" strokeWidth="6" fill="none" />
        <circle cx="83" cy="72" r="5" fill="#b74726" />
        <path d="M40 50H26m114 39h14" stroke="#5b7251" strokeWidth="4" />
      </>;
      break;
    case "filter":
    case "valve":
      object = <>
        <ellipse cx="90" cy="117" rx="57" ry="6" fill="#e5e9e1" />
        <path d="M29 42h122" stroke="#5b7251" strokeWidth="6" />
        {[55, 101].map((x) => <g key={x}><path d={"M" + x + " 39h25v53c0 18-25 18-25 0Z"} fill="#e1e8d9" stroke="#71816b" strokeWidth="2" /><path d={"M" + (x + 7) + " 54v34"} stroke="#f8faf4" strokeWidth="5" /><path d={"M" + (x + 12) + " 106v10"} stroke="#71816b" strokeWidth="3" /></g>)}
        <path d="M42 28h22m-11-8v17m68-9h22m-11-8v17" stroke="#b74726" strokeWidth="3" />
      </>;
      break;
    case "laser":
      object = <>
        <ellipse cx="89" cy="118" rx="70" ry="7" fill="#e5e9e1" />
        <path d="m21 55 22-14h99l17 14v57H21Z" fill="#e6ebe0" stroke="#71816b" strokeWidth="2" />
        <path d="m142 41 17 14v57h-17Z" fill="#c9d3c0" stroke="#71816b" strokeWidth="2" />
        <path d="M34 64h89v32H34Z" fill="#f8faf5" stroke="#71816b" strokeWidth="2" />
        <path d="M52 82h53m-50-11v23m13-23v23m13-23v23m13-23v23" stroke="#cad3c0" strokeWidth="2" />
        <path d="M47 42V24h69v18m-28-16v32" stroke="#71816b" strokeWidth="6" fill="none" />
        <path d="m84 56 4 10 4-10m-4 14v9" stroke="#b74726" strokeWidth="3" fill="none" />
        <rect x="128" y="63" width="10" height="17" rx="1" fill="#b74726" />
      </>;
      break;
    case "machine":
    case "consumer":
    case "process":
      object = <>
        <ellipse cx="90" cy="119" rx="69" ry="6" fill="#e5e9e1" />
        <path d="m29 40 18-12h90l17 12v73H29Z" fill="#e9eee3" stroke="#71816b" strokeWidth="2" />
        <path d="m137 28 17 12v73h-17Z" fill="#cad5c1" stroke="#71816b" strokeWidth="2" />
        <path d="M42 50h70v48H42Z" fill="#f9fbf7" stroke="#71816b" strokeWidth="2" />
        <rect x="54" y="64" width="18" height="22" rx="3" fill="#c9d7be" />
        <path d="M72 75h26m-11-8v17" stroke="#71816b" strokeWidth="4" />
        <rect x="119" y="50" width="10" height="17" rx="1" fill="#b74726" />
        <path d="M29 82H16" stroke="#5b7251" strokeWidth="5" />
      </>;
      break;
    case "recovery":
    case "collection":
      object = <>
        <ellipse cx="90" cy="118" rx="68" ry="7" fill="#e5e9e1" />
        <path d="M32 49h43v62H32Z" fill="#e6ece0" stroke="#71816b" strokeWidth="2" />
        <path d="M89 61h61v50H89Z" fill="#e0e8d7" stroke="#71816b" strokeWidth="2" />
        <path d="M40 38h26m-13 0v11m67 12V39H75" stroke="#5b7251" strokeWidth="4" fill="none" />
        <path d="m85 27-12 12 12 12" stroke="#b74726" strokeWidth="4" fill="none" />
        <path d="M105 75h28v23h-28Z" fill="#f7faf3" stroke="#71816b" strokeWidth="2" />
        <path d="M75 91h14m61 0h12" stroke="#5b7251" strokeWidth="4" />
      </>;
      break;
    case "gas":
      object = <>
        <ellipse cx="90" cy="117" rx="55" ry="6" fill="#e5e9e1" />
        {[[67, 58, 26], [112, 81, 25], [76, 96, 16]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill="#dbe6d1" stroke="#71816b" strokeWidth="2" />)}
        <path d="m84 69 10 6m-17 7-1 4" stroke="#71816b" strokeWidth="4" />
        <circle cx="111" cy="81" r="10" fill="#e6b38e" />
      </>;
      break;
    case "power":
      object = <>
        <ellipse cx="90" cy="118" rx="51" ry="6" fill="#e5e9e1" />
        <rect x="48" y="27" width="83" height="82" rx="4" fill="#e1e9d8" stroke="#71816b" strokeWidth="2" />
        <path d="m96 39-24 35h19l-9 26 28-39H91Z" fill="#b74726" />
        <path d="M70 109v12m39-12v12" stroke="#71816b" strokeWidth="4" />
      </>;
      break;
    case "control":
    case "conditions":
    case "instrumentation":
      object = <>
        <ellipse cx="91" cy="119" rx="51" ry="6" fill="#e5e9e1" />
        <path d="m47 27 15-9h58l14 9v83H47Z" fill="#e5ecdd" stroke="#71816b" strokeWidth="2" />
        <path d="m120 18 14 9v83h-14Z" fill="#cad6bf" stroke="#71816b" strokeWidth="2" />
        <rect x="60" y="38" width="46" height="29" rx="2" fill="#f9fbf6" stroke="#71816b" strokeWidth="2" />
        <path d="M68 50h28m-28 8h15" stroke="#a0b38d" strokeWidth="4" />
        <circle cx="69" cy="85" r="5" fill="#b74726" /><circle cx="91" cy="85" r="5" fill="#71816b" />
        <path d="M62 110v11m56-11v11" stroke="#71816b" strokeWidth="4" />
      </>;
      break;
    case "pressure":
    case "inlet":
    case "outlet":
      object = <>
        <ellipse cx="90" cy="117" rx="57" ry="6" fill="#e5e9e1" />
        <path d="M27 49h124v48H27Z" fill="#dce6d2" stroke="#71816b" strokeWidth="2" />
        <path d="M41 39v68m97-68v68" stroke="#71816b" strokeWidth="5" />
        <path d="M56 73h63m-18-17 18 17-18 17" stroke="#b74726" strokeWidth="6" fill="none" />
      </>;
      break;
    case "flow":
      object = <>
        <ellipse cx="90" cy="118" rx="62" ry="6" fill="#e5e9e1" />
        <path d="M28 47h124v52H28Z" fill="#e4ecdc" stroke="#71816b" strokeWidth="2" />
        {[57, 88, 119].map(x => <path key={x} d={"m" + (x - 10) + " 61 13 12-13 12"} fill="none" stroke="#b74726" strokeWidth="4" />)}
        <path d="M36 37v72m108-72v72" stroke="#71816b" strokeWidth="5" />
      </>;
      break;
    case "duty":
      object = <>
        <rect x="30" y="27" width="121" height="85" rx="4" fill="#f3f6ed" stroke="#71816b" strokeWidth="2" />
        <path d="M44 94h14V57h30v37h22V57h27" fill="none" stroke="#b74726" strokeWidth="5" />
        <path d="M44 42v58h93" fill="none" stroke="#a0b38d" strokeWidth="2" />
      </>;
      break;
    case "frame":
      object = <>
        <path d="m24 76 28-19h89l19 19-28 20H43Z" fill="#e1e8d8" stroke="#71816b" strokeWidth="3" />
        <path d="M24 76v27l19 11h89l28-18V76M43 96v18m89-18v18" fill="none" stroke="#71816b" strokeWidth="4" />
        <path d="m50 69 15 9m47-9 15 9" stroke="#b74726" strokeWidth="3" />
      </>;
      break;
    case "drive":
      object = <>
        <ellipse cx="90" cy="117" rx="61" ry="6" fill="#e5e9e1" />
        <path d="M56 40h58v57H56Z" fill="#dce6d1" stroke="#71816b" strokeWidth="2" />
        <ellipse cx="56" cy="69" rx="20" ry="29" fill="#e9efe2" stroke="#71816b" strokeWidth="2" />
        <ellipse cx="114" cy="69" rx="17" ry="29" fill="#c7d5bb" stroke="#71816b" strokeWidth="2" />
        <path d="M69 46v46m12-46v46m12-46v46m37-23h23M62 98v14m45-14v14" stroke="#71816b" strokeWidth="4" />
      </>;
      break;
    case "options":
    case "compressor-options":
    case "system":
      object = <>
        <path d="m14 103 19-12h123l17 12-19 13H29Z" fill="#d6dfcc" stroke="#71816b" strokeWidth="2" strokeDasharray={kind === "system" ? "5 3" : undefined} />
        <rect x="35" y="66" width="46" height="31" rx="6" fill="#c6d6b7" stroke="#71816b" strokeWidth="2" />
        <path d="M43 66V47h25v19m-22-16h19" fill="#e6b38e" stroke="#71816b" strokeWidth="2" />
        <path d="M82 75h19v20H82Z" fill="#e9eee2" stroke="#71816b" strokeWidth="2" />
        <rect x="106" y="56" width="28" height="42" rx="2" fill="#e3ebda" stroke="#71816b" strokeWidth="2" />
        <circle cx="120" cy="77" r="8" fill="#f8faf4" stroke="#71816b" strokeWidth="2" />
        <path d="M81 57h17V43" stroke="#71816b" strokeWidth="3" fill="none" />
        <rect x="93" y="35" width="10" height="13" rx="2" fill="#e6b38e" stroke="#71816b" strokeWidth="2" />
        {kind === "system" && <><rect x="136" y="26" width="17" height="64" rx="8" fill="#e4eadc" stroke="#71816b" strokeWidth="2" strokeDasharray="4 3" /><path d="M98 43h39" stroke="#71816b" strokeWidth="3" fill="none" /><rect x="152" y="59" width="19" height="42" rx="2" fill="#eef2e8" stroke="#71816b" strokeWidth="2" strokeDasharray="4 3" /><path d="M158 69h7m-7 8h7" stroke="#b74726" strokeWidth="3" /></>}
      </>;
      break;
    case "stage":
    case "booster":
    case "compressor":
    default:
      object = <>
        <ellipse cx="89" cy="116" rx="68" ry="8" fill="#e5e9e1" />
        <path d="m23 98 17-11h107l15 11-18 15H39Z" fill="#d7e0cd" stroke="#71816b" strokeWidth="2" />
        <rect x="38" y="66" width="63" height="32" rx="9" fill="#c9d8bb" stroke="#71816b" strokeWidth="2" />
        <path d="M52 65V43h30v22" fill="#e6b38e" stroke="#71816b" strokeWidth="2" />
        <path d="M48 43h38m-34 8h30m-30 7h30m10 17h15" stroke="#71816b" strokeWidth="3" />
        <path d="M109 62h25v35h-25Z" fill="#e3eadd" stroke="#71816b" strokeWidth="2" />
        <ellipse cx="134" cy="80" rx="12" ry="18" fill="#c4d2b8" stroke="#71816b" strokeWidth="2" />
        <path d="M113 69v22m7-22v22M67 43V27h23" stroke="#71816b" strokeWidth="3" fill="none" />
        <path d="M86 23v9" stroke="#b74726" strokeWidth="4" />
      </>;
  }
  return <svg className="process-object" viewBox="0 0 180 132" aria-hidden="true" focusable="false">{object}</svg>;
}

function Step({ step, index, last, compact, defaultIcon }: { step: ProcessStep; index: number; last: boolean; compact: boolean; defaultIcon?: string }) {
  return <li className={"process-step" + (step.optional ? " process-step--optional" : "")} data-process-step={step.id}>
    <div className="process-step-body">
      <div className="process-step-object"><ProcessObject kind={step.icon ?? defaultIcon} /></div>
      <div className="process-step-copy">
        {!compact && <span className="process-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
        <strong>{step.label}</strong>
        {step.optional && <span className="process-optional">При необходимости</span>}
        {step.detail && <p>{step.detail}</p>}
      </div>
    </div>
    {!last && <span className="process-arrow" aria-hidden="true">→</span>}
  </li>;
}

function StepList({ steps, compact, progression = false }: { steps: ProcessStep[]; compact: boolean; progression?: boolean }) {
  return <ol className={"process-step-list" + (steps.length > 4 ? " process-step-list--long" : "")} style={{ gridTemplateColumns: "repeat(" + Math.max(steps.length, 1) + ", minmax(0, 1fr))" }}>
    {steps.map((step, index) => <Step key={step.id} step={step} index={index} last={index === steps.length - 1} compact={compact} defaultIcon={progression ? ["compressor", "options", "system"][index] : undefined} />)}
  </ol>;
}

function ParameterCallouts({ steps }: { steps: ProcessStep[] }) {
  return <div className="process-parameter-map">
    <div className="process-parameter-stack">{steps.slice(0, 2).map(step => <div className="process-parameter" key={step.id}><strong>{step.label}</strong>{step.detail && <p>{step.detail}</p>}</div>)}</div>
    <div className="process-center-object"><ProcessObject kind="compressor" /><strong>Компрессор</strong></div>
    <div className="process-parameter-stack">{steps.slice(2).map(step => <div className="process-parameter" key={step.id}><strong>{step.label}</strong>{step.detail && <p>{step.detail}</p>}</div>)}</div>
  </div>;
}

function InterfaceCallouts({ callouts }: { callouts: ProcessStep[] }) {
  return <div className="process-interface-layout">
    <div className="process-machine-boundary"><span className="process-boundary-label">Оборудование заказчика</span><div className="process-module-boundary"><ProcessObject kind="compressor" /><strong>Компрессорный модуль</strong></div></div>
    <ul className="process-interface-list">{callouts.map(item => <li key={item.id}><ProcessObject kind={item.icon} /><div><strong>{item.label}</strong>{item.detail && <p>{item.detail}</p>}</div></li>)}</ul>
  </div>;
}

export function ProcessVisual({ id, compact = false, className }: { id: string; compact?: boolean; className?: string }) {
  const spec = getProcessSpec(id);
  if (!spec) return null;
  const layout = spec.layout ?? "flow";
  const steps = spec.steps ?? [];
  const callouts = spec.callouts ?? steps;
  return <figure className={["process-visual", "process-visual--" + layout, compact ? "process-visual--compact" : undefined, className].filter(Boolean).join(" ")} data-process-id={spec.id} data-process-layout={layout}>
    <div className="process-visual-heading"><strong>{spec.title}</strong></div>
    {layout === "comparison" ? <div className="process-branches">{spec.branches?.map(branch => <section className="process-branch" key={branch.id}><h3>{branch.title}</h3><StepList steps={branch.steps} compact={compact} /></section>)}</div>
      : layout === "parameters" ? <ParameterCallouts steps={callouts} />
        : layout === "interfaces" ? <InterfaceCallouts callouts={callouts} />
          : <><StepList steps={steps} compact={compact} progression={layout === "progression"} />{layout === "loop" && <div className="process-return"><span aria-hidden="true">↶</span><p>Возврат в технологический процесс</p></div>}</>}
    {spec.caption && <figcaption>{spec.caption}</figcaption>}
  </figure>;
}
