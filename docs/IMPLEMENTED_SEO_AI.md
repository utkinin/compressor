# Поиск и AI discoverability

Основной контент SSR; canonical абсолютный и единый через SITE_URL, уникальные title/description. Есть sitemap.xml, BreadcrumbList, Organization и Article; FAQPage только при видимом FAQ. Нет fake Offer, рейтингов, отзывов, цены 0 и вымышленных Product.

По умолчанию staging noindex, nofollow; robots запрещает обход всем, HTTP X-Robots-Tag дополняет metadata. SEO_INDEXABLE=true применяется только после редакционного согласования и настройки реального SITE_URL. Robots не является механизмом защиты приватных данных; RFQ storage вообще не доступен по HTTP.

Политика crawler проверена в коде 2026-10-22: стандартные robots allow/disallow. Search (Googlebot/Bingbot/Yandex/OAI-SearchBot) наследует правило '*'; training GPTBot/Google-Extended/CCBot запрещён отдельным правилом. Нет выдуманных директив и обещаний принудительного соблюдения. Перед изменением политики сверяться с официальными OpenAI bot docs, Google crawler docs и Common Crawl CCBot docs.

Все newly-authored материалы review. Пока нет опубликованного, утверждённого технического источника; staging не должен индексироваться как подтверждённый каталог.
