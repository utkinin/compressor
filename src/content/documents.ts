import type { Document } from "./types";

export const documents: Document[] = [
  {
    id:"process-gas-questionnaire",slug:"process-gas-questionnaire",title:"Опросный лист на газовый компрессор",editorialState:"review",type:"Questionnaire",access:"public",href:"/documents/process-gas-questionnaire.txt",
    summary:"Собственный текстовый опросный лист: газ, P₁/P₂/Q, условия расхода, режим, специальные требования и границы поставки. Можно заполнить и использовать при инженерном обсуждении.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["oil-free-reciprocating","gas-boosters","compressor-modules","compressor-skids","recovery-systems"],
  },
  {
    id:"configuration-datasheet",slug:"configuration-datasheet",title:"Технический лист выбранной конфигурации",editorialState:"review",type:"Datasheet",access:"request",
    summary:"Запросить технические данные для выбранного газа, давлений, расхода и режима работы. Готовый паспорт конкретной модели в staging не опубликован; состав документа подтверждается после подбора.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["oil-free-reciprocating","gas-boosters","compressor-modules","compressor-skids"],
  },
  {
    id:"manufacturer-family-catalogue",slug:"manufacturer-family-catalogue",title:"Исходный каталог семейства",editorialState:"review",type:"Catalogue",access:"request",
    summary:"Запросить первоисточник для рассматриваемого семейства и его редакцию. Каталог изготовителя не предоставлен в репозиторий; неподтверждённые family envelope не публикуются.",gasIds:["n2","he","mixtures"],equipmentIds:["oil-free-reciprocating","gas-boosters"],
  },
  {
    id:"operating-manual",slug:"operating-manual",title:"Руководство по эксплуатации",editorialState:"review",type:"Manual",access:"request",
    summary:"Согласовать руководство именно для выбранного исполнения, его языка, комплектации и ограничений режима. Универсальный файл, подменяющий руководство изготовителя, не предлагается.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["compressor-modules","compressor-skids","recovery-systems"],
  },
  {
    id:"pid-interface-drawing",slug:"pid-interface-drawing",title:"P&ID и габаритный чертёж",editorialState:"review",type:"Drawing",access:"request",
    summary:"Запросить согласование газовых подключений, внешних систем, арматуры и сервисных зон. Чертёж готовится для определённой комплектации и границ поставки.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["compressor-modules","compressor-skids","recovery-systems"],
  },
  {
    id:"cad-layout",slug:"cad-layout",title:"CAD для интеграции",editorialState:"review",type:"CAD",access:"request",
    summary:"Запросить интерфейсную модель под согласованную компоновку. Доступность и формат подтверждаются после определения исполнения; кнопка запроса не означает наличие готового файла.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["compressor-modules","compressor-skids"],
  },
  {
    id:"step-model",slug:"step-model",title:"STEP-модель компрессора и комплектации",editorialState:"review",type:"STEP",access:"request",
    summary:"Согласовать нейтральную 3D-модель для проверки коллизий и подключений. Точность геометрии и возможность использования в проекте определяются при выдаче конкретной редакции.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["compressor-modules","compressor-skids"],
  },
  {
    id:"conformity-document-list",slug:"conformity-document-list",title:"Перечень документов соответствия",editorialState:"review",type:"Certificate",access:"request",
    summary:"Запросить перечень применимых документов на выбранное исполнение и площадку. Сертификаты, Ex-соответствие и иные подтверждения без первоисточника здесь не заявлены.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["oil-free-reciprocating","compressor-modules","compressor-skids"],
  },
  {
    id:"working-point-calculation",slug:"working-point-calculation",title:"Расчётный лист параметров компрессора",editorialState:"review",type:"Calculation sheet",access:"request",
    summary:"Запросить проверку исходных данных, допущений, температуры, производительности и диапазона работы. Предварительный результат RFQ не является таким расчётным листом.",gasIds:["n2","he","h2","o2","co2","mixtures"],equipmentIds:["oil-free-reciprocating","gas-boosters","compressor-modules","compressor-skids","recovery-systems"],
  },
];
