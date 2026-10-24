import { knowledgeFigures } from "@/content/knowledge-visuals";

function DetailObject({ title }: { title: string }) {
  const compressor = /компрессор|бустер|ступень/i.test(title);
  const cooling = /охлаждение|температура/i.test(title);
  const service = /обслуживание|клапаны|уплотнения|привод/i.test(title);
  return <svg viewBox="0 0 180 130" aria-hidden="true" focusable="false">
    {compressor ? <><ellipse cx="90" cy="113" rx="74" ry="9" fill="#d7e3d4" /><rect x="17" y="99" width="146" height="12" rx="3" fill="#79927a" /><rect x="35" y="58" width="64" height="42" rx="6" fill="#426c54" /><rect x="47" y="25" width="42" height="38" rx="4" fill="#e9c4a3" stroke="#a86d48" strokeWidth="2" /><path d="M52 34h32M52 43h32M52 52h32" stroke="#b68660" strokeWidth="3" /><rect x="102" y="68" width="45" height="31" rx="6" fill="#a3b8a8" /><path d="M67 25V13h53v24" stroke="#345341" strokeWidth="6" fill="none" /><rect x="112" y="33" width="18" height="20" rx="3" fill="#b8ccba" /></> : cooling ? <><rect x="25" y="27" width="130" height="78" rx="9" fill="#dcebef" stroke="#71979d" strokeWidth="3" /><path d="M42 38v56m19-56v56m19-56v56m19-56v56m19-56v56m19-56v56" stroke="#8bb0b6" strokeWidth="5" /><path d="M25 50H9m146 31h16" stroke="#6b939b" strokeWidth="7" /></> : service ? <><circle cx="90" cy="65" r="43" fill="#edd1b4" stroke="#ab7954" strokeWidth="3" /><circle cx="90" cy="65" r="21" fill="#fafbf7" stroke="#ab7954" strokeWidth="3" /><path d="M90 13v16m0 73v16M38 65h16m73 0h16M53 28l13 13m50 50 13 13M53 102l13-13m50-50 13-13" stroke="#ab7954" strokeWidth="12" /></> : <><rect x="37" y="24" width="106" height="84" rx="17" fill="#e2ecdf" stroke="#8ca58d" strokeWidth="3" /><circle cx="69" cy="54" r="14" fill="#b8ccbc" /><circle cx="110" cy="56" r="14" fill="#e4bd9c" /><circle cx="89" cy="85" r="14" fill="#bad6dc" /><path d="M17 66h17m112 0h17" stroke="#8ca58d" strokeWidth="6" /></>}
  </svg>;
}

/** Detailed explanations sit below the article opening, separate from its cover. */
export function KnowledgeVisual({ articleId, figureIds }: { articleId: string; figureIds?: string[] }) {
  const figure = knowledgeFigures[articleId];
  if (!figure || !figureIds?.includes(figure.id)) return null;
  const List = figure.layout === "factors" || figure.layout === "components" || figure.layout === "comparison" ? "ul" : "ol";
  return <figure className={`knowledge-detail-figure knowledge-detail-${figure.layout}`} data-visual-role="engineering-detail" data-visual-id={figure.id}>
    <figcaption>{figure.title}</figcaption>
    {figure.layout === "factors" && <div className="knowledge-detail-center"><DetailObject title="Компрессор" /><strong>Компрессор SF₆</strong></div>}
    <List className="knowledge-detail-steps">{figure.steps.map((step) => <li key={step.title} className={figure.layout === "components" && step.optional ? "knowledge-detail-option" : undefined}>
      <DetailObject title={step.title} />
      <div><h3>{step.title}</h3><p>{step.note}</p>{figure.layout === "components" && step.optional && <span className="knowledge-detail-optional">По условиям задачи</span>}</div>
    </li>)}</List>
    {figure.layout === "loop" && <p className="knowledge-detail-footnote">Газ возвращается в процесс после проверки качества и условий повторной подачи.</p>}
    {figure.layout === "components" && <p className="knowledge-detail-footnote">Элементы с пунктирной границей — варианты комплектации. Они включаются только в согласованном составе поставки.</p>}
    {figure.layout === "steps" && articleId === "how-working-point-is-calculated" && <p className="knowledge-detail-footnote">Показан принцип многоступенчатого сжатия. Число ступеней и схема охлаждения определяются расчётом конкретного исполнения.</p>}
  </figure>;
}
