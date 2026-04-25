-- Demo seed for local UI stress-check: extra users + many ads.
-- Usage:
--   npx wrangler d1 execute DB --local --file=./schema.sql
--   npx wrangler d1 execute DB --local --file=./dev_seed.sql

INSERT OR IGNORE INTO users (id, login, display_name, role, city, created_at, updated_at) VALUES
  (1001, 'mari_k', 'Мария К.', 'user', 'tbilisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1002, 'nika86', 'Ника Беридзе', 'user', 'batumi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1003, 'gio_parts', 'Gio Parts', 'user', 'tbilisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1004, 'sofya_home', 'Софья Дом', 'user', 'kutaisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1005, 'luka_fit', 'Лука', 'user', 'batumi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1006, 'ani_books', 'Ани', 'user', 'tbilisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1007, 'temo_rent', 'Темо', 'user', 'rustavi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1008, 'sandro_dev', 'Сандро', 'user', 'tbilisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1009, 'eco_mama', 'Eco Mama', 'user', 'gori', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1010, 'pet_house', 'Pet House', 'user', 'kutaisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1011, 'tamta_event', 'Тамта', 'user', 'tbilisi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1012, 'vano_tools', 'Вано', 'user', 'batumi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO ads (
  title, body, contact, city, category, type, status, owner_user_id, created_at, updated_at
) VALUES
  ('iPhone 13, 128GB', 'Хорошее состояние, без ремонтов.', '@mari_k', 'tbilisi', 'phones', 'sell', 'published', 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Куплю MacBook Air M1', 'Желательно с коробкой и зарядкой.', '@sandro_dev', 'tbilisi', 'computers', 'buy', 'published', 1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Детская коляска 2в1', 'После одного ребенка, чистая и аккуратная.', '@eco_mama', 'gori', 'kids', 'sell', 'published', 1009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Отдам пакеты детской одежды', 'Размеры 74-86, самовывоз.', '@eco_mama', 'gori', 'giveaway', 'free', 'published', 1009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Сдаю 1-к квартиру у моря', 'Долгосрочно, без комиссии.', '@temo_rent', 'batumi', 'rent', 'sell', 'published', 1007, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам письменный стол', 'Дуб, 120x60, есть следы использования.', '@sofya_home', 'kutaisi', 'furniture', 'sell', 'published', 1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Услуги электрика', 'Срочный выезд по городу.', '@vano_tools', 'batumi', 'services', 'sell', 'published', 1012, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Ищу работу frontend', 'React/TypeScript, удаленно или офис.', '@sandro_dev', 'tbilisi', 'jobs', 'buy', 'published', 1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Курс разговорного английского', 'Группы A2-B2, онлайн.', '@ani_books', 'tbilisi', 'education', 'sell', 'published', 1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам беговую дорожку', 'Почти новая, максимальный вес 120 кг.', '@luka_fit', 'batumi', 'sports', 'sell', 'published', 1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Щенки в добрые руки', '2 месяца, привиты.', '@pet_house', 'kutaisi', 'pets', 'free', 'published', 1010, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам набор инструментов', 'Чемодан, 108 предметов.', '@vano_tools', 'batumi', 'things', 'sell', 'published', 1012, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Куплю велосипед горный', 'Рама M/L, бюджет до 800 GEL.', '@luka_fit', 'batumi', 'sports', 'buy', 'published', 1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Организация дней рождений', 'Аниматоры, декор, фотозона.', '@tamta_event', 'tbilisi', 'events', 'sell', 'published', 1011, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам стиральную машину', 'LG, 6 кг, полностью рабочая.', '@mari_k', 'tbilisi', 'appliances', 'sell', 'published', 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Стеллаж для книг', 'Белый, IKEA, 5 секций.', '@ani_books', 'tbilisi', 'home', 'sell', 'published', 1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Пакет книг по маркетингу', '15 книг, продаю комплектом.', '@ani_books', 'tbilisi', 'books', 'sell', 'published', 1006, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Аренда авто на выходные', 'Hyundai Elantra, автомат.', '@nika86', 'batumi', 'auto', 'sell', 'published', 1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам запчасти BMW E90', 'Фары, зеркало, бампер.', '@gio_parts', 'tbilisi', 'auto', 'sell', 'published', 1003, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Фотосессия на природе', 'Портрет/семья, 1.5 часа.', '@tamta_event', 'tbilisi', 'creative', 'sell', 'published', 1011, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Ищу напарника в мини-футбол', 'Играем по вторникам и четвергам.', '@luka_fit', 'batumi', 'hobby', 'buy', 'published', 1005, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Куплю робот-пылесос', 'Рассмотрю Xiaomi/Roborock.', '@sofya_home', 'kutaisi', 'appliances', 'buy', 'published', 1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Тур в Казбеги на выходные', 'Трансфер + гид, 2 дня.', '@tamta_event', 'tbilisi', 'travel', 'sell', 'published', 1011, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам офисное кресло', 'Сетка, регулируемая спинка.', '@sandro_dev', 'tbilisi', 'furniture', 'sell', 'published', 1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Мужская куртка Zara L', 'Надета 2 раза.', '@mari_k', 'tbilisi', 'clothes', 'sell', 'published', 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Набор косметики', 'Новый, не подошел оттенок.', '@mari_k', 'tbilisi', 'beauty', 'sell', 'published', 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Сниму жильё в Тбилиси', '1-2 комнаты, район Сабуртало.', '@temo_rent', 'tbilisi', 'housing', 'buy', 'published', 1007, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Планшет Samsung Tab S8', 'Идеал, полный комплект.', '@nika86', 'batumi', 'electronics', 'sell', 'published', 1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Продам микрофон Blue Yeti', 'Для стримов и подкастов.', '@sandro_dev', 'tbilisi', 'electronics', 'sell', 'published', 1008, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Отдам старый диван', 'Самовывоз, 3 этаж без лифта.', '@sofya_home', 'kutaisi', 'giveaway', 'free', 'published', 1004, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
