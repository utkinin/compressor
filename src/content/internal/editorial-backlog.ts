/** Internal editorial research only; never a route or publication collection. */
export type EditorialDecision = "CREATE" | "UPDATE" | "MERGE" | "REJECT";

export interface EditorialBacklogItem {
  id: string;
  title: string;
  searchIntent: string;
  action: EditorialDecision;
  overlapArticleIds: string[];
  targetArticleId: string;
  decisionReason: string;
  factsToExplain: string[];
  claimsRequiringEvidence: string[];
  sourceStatus: "primary-article-not-provided";
  sourceMaterialIds: string[];
  readiness: "research-and-engineering-review-required";
}

export const editorialSourceInventory = [
  {
    "id": "project-article-library",
    "kind": "local-project-content",
    "availability": "available",
    "sourcePath": "src/content/articles.ts",
    "sourceTitle": null,
    "sourceUrl": null,
    "sourcePublishedAt": null,
    "technicalEvidence": false,
    "usage": "Проверка пересечений и самостоятельная редакционная переработка; существующая формулировка не подтверждает характеристики оборудования."
  },
  {
    "id": "project-scaffold-notes",
    "kind": "uploaded-project-scaffold",
    "availability": "inspected",
    "sourcePath": "lanfor-gas-systems-codex.zip:src/app/knowledge/[slug]/page.tsx",
    "sourceTitle": null,
    "sourceUrl": null,
    "sourcePublishedAt": null,
    "technicalEvidence": false,
    "usage": "Просмотрены три короткие заметки исходного проекта: параметры подбора, бустер и источник, безмасляное сжатие. Это проектные заметки, не внешние технические публикации."
  },
  {
    "id": "final-editorial-brief",
    "kind": "user-instruction",
    "availability": "available",
    "sourcePath": null,
    "sourceTitle": null,
    "sourceUrl": null,
    "sourcePublishedAt": null,
    "technicalEvidence": false,
    "usage": "Определяет темы и редакционные границы; не является доказательством технических характеристик."
  },
  {
    "id": "private-engineering-seed",
    "kind": "unverified-numeric-project-data",
    "availability": "available",
    "sourcePath": "src/content/internal/manufacturer-seed.ts",
    "sourceTitle": null,
    "sourceUrl": null,
    "sourcePublishedAt": null,
    "technicalEvidence": false,
    "usage": "Числовые исходные данные оставлены для проверки. Из них не получены опубликованные пределы, ресурс или одобрение газовой совместимости."
  },
  {
    "id": "external-technical-articles",
    "kind": "external-primary-materials",
    "availability": "not-provided",
    "sourcePath": null,
    "sourceTitle": null,
    "sourceUrl": null,
    "sourcePublishedAt": null,
    "technicalEvidence": false,
    "usage": "В предоставленных файлах и просмотренном архиве не найдены полные внешние статьи, их URL, первичные паспорта или страницы каталога. Технический разбор таких материалов не имитируется."
  }
];

export const reworkedProjectMaterials = [
  {
    "sourceMaterialId": "project-scaffold-notes",
    "locator": "data[\"how-to-select\"]",
    "extractedPrinciples": [
      "Для начала нужны газ, P₁, P₂, Q и режим.",
      "Давления требуют точки отсчёта, расход — условий приведения."
    ],
    "claimsWithheld": [
      "Пределы моделей и подтверждённая применимость не следуют из списка параметров."
    ],
    "action": "UPDATE",
    "resultArticleIds": [
      "what-to-specify-for-gas-compressor"
    ]
  },
  {
    "sourceMaterialId": "project-scaffold-notes",
    "locator": "data[\"booster-vs-source\"]",
    "extractedPrinciples": [
      "Бустер повышает давление доступного газа.",
      "Средний баланс и краткий пик рассматривают отдельно."
    ],
    "claimsWithheld": [
      "Запас, производительность и время цикла требуют фактических исходных данных."
    ],
    "action": "MERGE",
    "resultArticleIds": [
      "booster-vs-source",
      "how-to-select-nitrogen-booster"
    ]
  },
  {
    "sourceMaterialId": "project-scaffold-notes",
    "locator": "data[\"oil-free\"]",
    "extractedPrinciples": [
      "Безмасляное сжатие не определяет влажность газа.",
      "Масло, частицы и влага контролируются раздельно."
    ],
    "claimsWithheld": [
      "Класс чистоты и специальная совместимость требуют подтверждения выбранного исполнения."
    ],
    "action": "UPDATE",
    "resultArticleIds": [
      "oil-free-compression"
    ]
  }
];

export const firstEditorialCluster = [
  {
    "articleId": "what-to-specify-for-gas-compressor",
    "action": "UPDATE"
  },
  {
    "articleId": "why-process-gas-compressors-need-task-specific-selection",
    "action": "CREATE"
  },
  {
    "articleId": "what-is-in-compressor-skid",
    "action": "UPDATE"
  },
  {
    "articleId": "sf6-compressor-service-life",
    "action": "CREATE"
  },
  {
    "articleId": "how-to-select-nitrogen-booster",
    "action": "UPDATE"
  },
  {
    "articleId": "compressors-for-gas-mixtures",
    "action": "CREATE"
  }
];

export const editorialBacklog: EditorialBacklogItem[] = [
  {
    "id": "high-pressure-protection",
    "title": "Защита компрессорной системы высокого давления",
    "searchIntent": "Как согласовать измерение, ограничения и защитные функции системы",
    "action": "CREATE",
    "overlapArticleIds": [
      "what-is-in-compressor-skid"
    ],
    "targetArticleId": "high-pressure-compressor-protection",
    "decisionReason": "В статье о комплектации защита упоминается как функция; отдельного объяснения сценариев и ответственности пока нет.",
    "factsToExplain": [
      "Регулирование рабочего давления и защита от недопустимого давления выполняют разные функции.",
      "Сценарии отказа рассматривают для компрессора, накопительных объёмов, арматуры и внешних подключений.",
      "Разделение ответственности за безопасный останов и отвод газа фиксируют до поставки."
    ],
    "claimsRequiringEvidence": [
      "Применимые нормативные документы и их актуальные редакции.",
      "Уставки, требуемая надёжность, пропускная способность и конкретная схема защит."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "air-or-nitrogen-for-laser",
    "title": "Воздух или азот для лазерной резки",
    "searchIntent": "Как выбрать газоснабжение по требованиям лазерного станка и технологии резки",
    "action": "CREATE",
    "overlapArticleIds": [],
    "targetArticleId": "air-or-nitrogen-for-laser-cutting",
    "decisionReason": "Существующая отраслевая страница показывает схемы подачи; отдельная статья должна сравнить условия выбора, а не повторить страницу решения.",
    "factsToExplain": [
      "Выбор газа зависит от станка, материала, толщины и требований к результату резки.",
      "Сжатый воздух и азот требуют разных схем подготовки и подачи.",
      "Азот не является универсально лучшим вариантом для всех материалов и операций."
    ],
    "claimsRequiringEvidence": [
      "Параметры газа по документации конкретного станка.",
      "Стоимость реза, скорость, качество кромки, допустимая чистота и расход в сравниваемых условиях."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "oil-free-nitrogen",
    "title": "Безмасляное сжатие азота",
    "searchIntent": "Какие требования к чистоте задавать при подборе компрессора азота",
    "action": "UPDATE",
    "overlapArticleIds": [
      "oil-free-compression"
    ],
    "targetArticleId": "oil-free-compression",
    "decisionReason": "Дополнить существующий материал примером азота; новая почти одинаковая статья размоет полезный ответ о чистоте.",
    "factsToExplain": [
      "Безмасляное сжатие и осушка решают разные задачи.",
      "Качество азота оценивают в определённой точке всей системы.",
      "Примеси могут поступать из источника, арматуры и соединений."
    ],
    "claimsRequiringEvidence": [
      "Доказательства отсутствия масла для конкретного исполнения и методики контроля.",
      "Класс чистоты, точка росы и применимость к специальному процессу."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "booster-after-generator",
    "title": "Дожатие азота после генератора",
    "searchIntent": "Как согласовать генератор, бустер и потребление",
    "action": "MERGE",
    "overlapArticleIds": [
      "how-to-select-nitrogen-booster",
      "pressure-after-nitrogen-generator",
      "booster-vs-source"
    ],
    "targetArticleId": "how-to-select-nitrogen-booster",
    "decisionReason": "Поиск уже покрыт материалами о подборе бустера и давлении источника; добавить разбор цикла и согласованные перекрёстные ссылки без новой страницы.",
    "factsToExplain": [
      "Бустер повышает давление доступного газа, не устраняя недостаток средней подачи.",
      "Входное давление проверяют во время реальной нагрузки.",
      "После пика запас ресивера должен успевать восстановиться."
    ],
    "claimsRequiringEvidence": [
      "Подача конкретного генератора при требуемой чистоте.",
      "Совместная работа регуляторов, настройка и подтверждённые параметры выбранного бустера."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "multistage-compression",
    "title": "Многоступенчатое сжатие газа",
    "searchIntent": "Зачем разделять сжатие на ступени и как это влияет на подбор",
    "action": "CREATE",
    "overlapArticleIds": [
      "how-working-point-is-calculated"
    ],
    "targetArticleId": "multistage-gas-compression",
    "decisionReason": "Расчётная статья только называет ступенчатость; нужен самостоятельный разбор физических причин и ограничений.",
    "factsToExplain": [
      "Распределение сжатия связано с температурой, конструкцией и охлаждением.",
      "Реальные потери и свойства газа учитывают при выборе промежуточных давлений.",
      "Количество ступеней само по себе не подтверждает расход или пригодность к газу."
    ],
    "claimsRequiringEvidence": [
      "Допустимые температуры и отношения давлений конкретных конструкций.",
      "Расход энергии, сравнение вариантов и расчёт числа ступеней для заданной среды."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "interstage-cooling",
    "title": "Зачем охлаждать газ между ступенями компрессора",
    "searchIntent": "Как межступенчатое охлаждение влияет на газ и последующие ступени",
    "action": "CREATE",
    "overlapArticleIds": [
      "air-vs-water-cooling",
      "co2-phase-and-compression"
    ],
    "targetArticleId": "why-interstage-gas-cooling",
    "decisionReason": "Существующая статья сравнивает охлаждающие среды; новая тема объяснит функцию межступенчатого охлаждения, конденсацию и температурные границы.",
    "factsToExplain": [
      "Охлаждение меняет состояние газа перед следующей ступенью.",
      "Возможность конденсации зависит от состава и условий.",
      "Отделение жидкости и охлаждение требуют согласованной схемы."
    ],
    "claimsRequiringEvidence": [
      "Тепловые балансы и расчётный эффект для выбранного газа.",
      "Температурные ограничения материалов, сепарации и фазовых переходов."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "reciprocating-compressor-types",
    "title": "Типы поршневых компрессоров для технологических газов",
    "searchIntent": "Как сравнивать конструкции по задаче, газовому тракту и режиму",
    "action": "CREATE",
    "overlapArticleIds": [
      "compressor-vs-booster",
      "different-gases-different-performance"
    ],
    "targetArticleId": "reciprocating-process-gas-compressor-types",
    "decisionReason": "Существующие материалы различают назначение и свойства газа; обзор конструкций должен иметь собственную сравнительную структуру.",
    "factsToExplain": [
      "Назначение бустера и конструктивный тип компрессора — разные признаки.",
      "Смазка, уплотнение, привод и компоновка влияют на применение.",
      "Пригодность конструкции устанавливают для конкретного газа и режима."
    ],
    "claimsRequiringEvidence": [
      "Описание конструкций по проверяемым техническим источникам.",
      "Числовые границы, шум, утечки, ресурс и сравнительные преимущества конкретных исполнений."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "co2-compressors",
    "title": "Компрессоры для CO₂",
    "searchIntent": "Как учитывать состояние CO₂ при выборе газового компрессора",
    "action": "UPDATE",
    "overlapArticleIds": [
      "co2-phase-and-compression"
    ],
    "targetArticleId": "co2-phase-and-compression",
    "decisionReason": "Расширить уже полезную статью о фазе данными для запроса и границами подготовки газа; не дублировать страницу оборудования.",
    "factsToExplain": [
      "Давление и температуру CO₂ рассматривают совместно.",
      "Входная жидкость требует другого рассмотрения, чем гарантированная газовая фаза.",
      "Пуск, охлаждение и сброс могут отличаться от установившегося режима."
    ],
    "claimsRequiringEvidence": [
      "Фазовые данные по применимому справочнику или модели свойств.",
      "Диапазоны конкретного исполнения и расчёт переходных режимов."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "helium-compressors",
    "title": "Компрессоры для гелия",
    "searchIntent": "Как подобрать компрессор гелия по источнику, давлению и потерям",
    "action": "CREATE",
    "overlapArticleIds": [
      "helium-recovery-principles",
      "different-gases-different-performance"
    ],
    "targetArticleId": "how-to-select-helium-compressor",
    "decisionReason": "Сжатие свежего гелия и цикл возврата имеют разные запросы; новая статья должна объяснить подбор компрессора без повторения цикла сбора.",
    "factsToExplain": [
      "Утечки и газовый тракт проверяют для гелия отдельно.",
      "Минимальное P₁ и цикл источника влияют на выбор.",
      "Чистота и герметичность — самостоятельные требования."
    ],
    "claimsRequiringEvidence": [
      "Показатели утечки и методика испытаний конкретного исполнения.",
      "Рабочие параметры, материалы и допустимый режим по первичной документации."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "helium-recovery",
    "title": "Возврат гелия",
    "searchIntent": "Как проверить баланс сбора, сжатия и повторного использования",
    "action": "UPDATE",
    "overlapArticleIds": [
      "helium-recovery-principles"
    ],
    "targetArticleId": "helium-recovery-principles",
    "decisionReason": "Сохранить канонический материал и расширить его проверяемым примером баланса после получения реальных исходных данных.",
    "factsToExplain": [
      "Сборный буфер принимает пик, компрессор обеспечивает последующую перекачку.",
      "Возвратный газ может требовать анализа и подготовки.",
      "Эффективность оценивают по согласованным границам полного цикла."
    ],
    "claimsRequiringEvidence": [
      "Доля возврата, потери и экономия по измеренному балансу.",
      "Производительность и время цикла при меняющемся входном давлении."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "sf6-compression",
    "title": "Особенности сжатия SF₆",
    "searchIntent": "Какие исходные данные нужны для сжатия или перекачки SF₆",
    "action": "CREATE",
    "overlapArticleIds": [
      "sf6-compressor-service-life",
      "compressors-for-gas-mixtures"
    ],
    "targetArticleId": "sf6-compression-considerations",
    "decisionReason": "Материал о сроке службы посвящён эксплуатации; новая статья допустима с фокусом на состоянии газа, подготовке и проверке применимости.",
    "factsToExplain": [
      "Предыстория газа и загрязнения важны для выбора материалов и подготовки.",
      "Фазовое состояние проверяют вместе с температурой и давлением.",
      "Герметичность и обращение с остаточным газом задаются отдельно."
    ],
    "claimsRequiringEvidence": [
      "Свойства среды и применимые требования безопасности из первичных источников.",
      "Совместимость, фазовые границы и возможности конкретного компрессора."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "noise-and-vibration",
    "title": "Шум и вибрация компрессорного оборудования",
    "searchIntent": "Что учесть в размещении и техническом задании",
    "action": "CREATE",
    "overlapArticleIds": [
      "what-is-in-compressor-skid"
    ],
    "targetArticleId": "compressor-noise-and-vibration",
    "decisionReason": "В статье о комплектации доступ и опоры затронуты кратко; самостоятельная тема полезна для размещения на площадке.",
    "factsToExplain": [
      "Условия измерения и точка оценки нужны для сравнения шума.",
      "Вибрацию рассматривают вместе с опорами, трубопроводами и компоновкой.",
      "Меры снижения не должны ухудшать охлаждение и обслуживание."
    ],
    "claimsRequiringEvidence": [
      "Уровни шума и вибрации, методики измерения и применимые нормативы.",
      "Эффект кожуха, опор и иных мер на конкретном оборудовании."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "gas-preparation",
    "title": "Подготовка газа перед компрессором",
    "searchIntent": "Как определить необходимость фильтрации, осушки и отделения жидкости",
    "action": "CREATE",
    "overlapArticleIds": [
      "oil-free-compression",
      "compressors-for-gas-mixtures"
    ],
    "targetArticleId": "gas-preparation-before-compression",
    "decisionReason": "В имеющихся статьях подготовка дана как ограничение; нужен отдельный порядок постановки требований по анализу газа.",
    "factsToExplain": [
      "Фильтрация частиц, осушка и сепарация жидкости выполняют разные функции.",
      "При охлаждении может появляться конденсат.",
      "Требования задают по фактической среде и ограничениям оборудования."
    ],
    "claimsRequiringEvidence": [
      "Эффективность фильтрации, точка росы и допустимая загрязнённость.",
      "Расчёт сепарации и совместимость материалов с отделяемыми веществами."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  },
  {
    "id": "duty-and-selection",
    "title": "Как режим работы влияет на выбор компрессора",
    "searchIntent": "Как описать циклы, пики, паузы и непрерывную работу",
    "action": "UPDATE",
    "overlapArticleIds": [
      "continuous-vs-intermittent",
      "why-a-receiver"
    ],
    "targetArticleId": "continuous-vs-intermittent",
    "decisionReason": "Сохранить существующий материал и добавить заполненный пример профиля нагрузки без новой страницы с тем же ответом.",
    "factsToExplain": [
      "Доля включения без длительности цикла неоднозначна.",
      "Средний расход не описывает пиковый отбор и частоту пусков.",
      "Восстановление запаса и теплоотвод проверяют по времени."
    ],
    "claimsRequiringEvidence": [
      "Допустимое число пусков, длительность работы и температурные ограничения исполнения.",
      "Наработка, интервалы обслуживания и влияние режима на ресурс."
    ],
    "sourceStatus": "primary-article-not-provided",
    "sourceMaterialIds": [
      "project-article-library",
      "final-editorial-brief"
    ],
    "readiness": "research-and-engineering-review-required"
  }
];

export const rejectedEditorialClaims = [
  {
    "action": "REJECT",
    "claim": "Универсальный срок службы или наработка на отказ компрессора SF₆",
    "reason": "Нет применимого первичного документа, определений отказа, условий и данных обслуживания."
  },
  {
    "action": "REJECT",
    "claim": "Перенос числового диапазона исходной базы на публичное направление",
    "reason": "Нет подтверждения совместно достижимых параметров для газа, исполнения и режима."
  },
  {
    "action": "REJECT",
    "claim": "Автоматическое обещание класса чистоты, специальной газовой совместимости или взрывозащиты",
    "reason": "Требуются документация, область применения и подтверждение конкретного исполнения."
  },
  {
    "action": "REJECT",
    "claim": "Публикация перевода внешней рекламы или чужого события как собственного материала",
    "reason": "Нет предоставленного материала для проверки; перевод и удаление имени не создают самостоятельную техническую статью или новость."
  }
];

