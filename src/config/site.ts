export const siteConfig = {
  name: "Lanfor Gas Systems",
  productionOrigin: "https://lanfor-gas.ru",
  phoneDisplay: "+7 (812) 309-05-12",
  phoneHref: "tel:+78123090512",
  addressDisplay: "195112, г. Санкт-Петербург, Уткин проспект, дом 15",
  address: {
    postalCode: "195112",
    addressLocality: "Санкт-Петербург",
    streetAddress: "Уткин проспект, дом 15",
    addressCountry: "RU",
  },
  openingHoursDisplay: "Пн–пт 09:00–17:00 МСК",
  openingHours: {
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
} as const;
