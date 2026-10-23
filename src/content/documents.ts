import type { Document } from "./types";

export const documents: Document[] = [
  {
    id: "process-gas-questionnaire",
    slug: "process-gas-questionnaire",
    title: "Опросный лист на подбор газового компрессора",
    editorialState: "review",
    type: "Questionnaire",
    access: "public",
    href: "/documents/process-gas-questionnaire.txt",
    summary: "Заполните газ, давления, расход и режим работы. Добавьте требования к составу газа, температуре и размещению, скопируйте или скачайте заполненный лист и отправьте параметры для подбора.",
    gasIds: ["n2", "he", "h2", "o2", "co2", "mixtures"],
    equipmentIds: ["nitrogen-compressors", "nitrogen-boosters", "helium-compressors", "co2-compressors", "sf6-compressors", "process-gas-compressors"],
  },
];
