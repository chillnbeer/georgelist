export const SECTIONS = [
  {
    slug: 'community',
    emoji: '🧑‍🤝‍🧑',
    label: 'Сообщество',
    categories: [
      { slug: 'activities', label: 'Активности' },
      { slug: 'lost-found', label: 'Бюро находок' },
      { slug: 'dating', label: 'Знакомства' },
      { slug: 'musicians', label: 'Музыканты' },
      { slug: 'artists', label: 'Художники' },
      { slug: 'pets', label: 'Животные' },
      { slug: 'events', label: 'Мероприятия' },
      { slug: 'groups', label: 'Группы' },
      { slug: 'news', label: 'Новости района' },
      { slug: 'discussions', label: 'Обсуждения' },
      { slug: 'carpool', label: 'Попутчики' },
      { slug: 'volunteering', label: 'Волонтёрство' },
      { slug: 'politics', label: 'Политика' },
      { slug: 'complaints', label: 'Жалобы и крики души' },
    ],
  },
  {
    slug: 'services',
    emoji: '🛠',
    label: 'Услуги',
    categories: [
      { slug: 'auto-services', label: 'Авто услуги' },
      { slug: 'beauty', label: 'Красота' },
      { slug: 'telecom', label: 'Телефоны и связь' },
      { slug: 'computers', label: 'Компьютеры' },
      { slug: 'design', label: 'Дизайн и креатив' },
      { slug: 'repair-construction', label: 'Ремонт и стройка' },
      { slug: 'education', label: 'Обучение и репетиторы' },
      { slug: 'lawyers', label: 'Юристы' },
      { slug: 'moving', label: 'Переезды' },
      { slug: 'photo-video', label: 'Фото и видео' },
      { slug: 'health', label: 'Здоровье' },
      { slug: 'home-services', label: 'Дом и быт' },
      { slug: 'finance', label: 'Финансы и бухгалтерия' },
      { slug: 'events-org', label: 'Организация мероприятий' },
      { slug: 'travel', label: 'Путешествия и туризм' },
      { slug: 'translations', label: 'Тексты и переводы' },
    ],
  },
  {
    slug: 'housing',
    emoji: '🏠',
    label: 'Жильё',
    categories: [
      { slug: 'apartment-rent', label: 'Аренда квартир' },
      { slug: 'rooms', label: 'Комнаты' },
      { slug: 'housing-wanted', label: 'Ищу жильё' },
      { slug: 'housing-exchange', label: 'Обмен жильём' },
      { slug: 'commercial-property', label: 'Коммерческая недвижимость' },
      { slug: 'parking', label: 'Парковки и гаражи' },
      { slug: 'daily-rent', label: 'Посуточно' },
      { slug: 'country', label: 'Загород' },
      { slug: 'new-buildings', label: 'Новостройки' },
      { slug: 'property-sale', label: 'Продажа жилья' },
      { slug: 'office-rent', label: 'Аренда офисов' },
    ],
  },
  {
    slug: 'forsale',
    emoji: '🛒',
    label: 'Продам',
    categories: [
      { slug: 'electronics', label: 'Электроника' },
      { slug: 'computers', label: 'Компьютеры' },
      { slug: 'phones', label: 'Телефоны' },
      { slug: 'furniture', label: 'Мебель' },
      { slug: 'clothes', label: 'Одежда' },
      { slug: 'shoes', label: 'Обувь' },
      { slug: 'accessories', label: 'Аксессуары' },
      { slug: 'auto-parts', label: 'Авто запчасти' },
      { slug: 'tools', label: 'Инструменты' },
      { slug: 'appliances', label: 'Бытовая техника' },
      { slug: 'home', label: 'Всё для дома' },
      { slug: 'materials', label: 'Стройматериалы' },
      { slug: 'kids', label: 'Детское' },
      { slug: 'toys', label: 'Игрушки' },
      { slug: 'hobby', label: 'Хобби и творчество' },
      { slug: 'sports', label: 'Спорт' },
      { slug: 'bicycles', label: 'Велосипеды' },
      { slug: 'motorcycles', label: 'Мотоциклы' },
      { slug: 'auto', label: 'Авто' },
      { slug: 'antique', label: 'Антиквариат' },
      { slug: 'collections', label: 'Коллекции' },
      { slug: 'books', label: 'Книги и диски' },
      { slug: 'photo-equipment', label: 'Фото и видео техника' },
      { slug: 'musical-instruments', label: 'Музыкальные инструменты' },
      { slug: 'giveaway', label: 'Бесплатно' },
      { slug: 'misc', label: 'Разное' },
    ],
  },
  {
    slug: 'jobs',
    emoji: '💼',
    label: 'Работа',
    categories: [
      { slug: 'office-jobs', label: 'Офис' },
      { slug: 'accounting', label: 'Бухгалтерия и финансы' },
      { slug: 'marketing', label: 'Маркетинг и реклама' },
      { slug: 'design-jobs', label: 'Дизайн' },
      { slug: 'it-jobs', label: 'IT и разработка' },
      { slug: 'production', label: 'Производство' },
      { slug: 'construction', label: 'Строительство' },
      { slug: 'logistics', label: 'Логистика' },
      { slug: 'delivery', label: 'Доставка' },
      { slug: 'sales', label: 'Продажи' },
      { slug: 'medical', label: 'Медицина' },
      { slug: 'teaching', label: 'Образование' },
      { slug: 'service', label: 'Обслуживание' },
      { slug: 'restaurant', label: 'Ресторанный бизнес' },
      { slug: 'security', label: 'Охрана' },
      { slug: 'government', label: 'Госслужба' },
      { slug: 'entry-level', label: 'Без опыта' },
    ],
  },
  {
    slug: 'gigs',
    emoji: '⚡',
    label: 'Подработка',
    categories: [
      { slug: 'tasks', label: 'Разовые задания' },
      { slug: 'couriers', label: 'Курьеры' },
      { slug: 'movers', label: 'Грузчики' },
      { slug: 'event-gigs', label: 'Мероприятия' },
      { slug: 'filming', label: 'Съёмки' },
      { slug: 'creative-gigs', label: 'Креатив' },
      { slug: 'remote', label: 'Удалёнка' },
      { slug: 'housework', label: 'Помощь по дому' },
      { slug: 'laborers', label: 'Разнорабочие' },
    ],
  },
  {
    slug: 'topic-discussions',
    emoji: '💬',
    label: 'Обсуждения',
    categories: [
      { slug: 'discuss-auto', label: 'Авто' },
      { slug: 'discuss-tech', label: 'Техника' },
      { slug: 'discuss-jobs', label: 'Работа' },
      { slug: 'discuss-housing', label: 'Жильё' },
      { slug: 'discuss-relations', label: 'Отношения' },
      { slug: 'discuss-health', label: 'Здоровье' },
      { slug: 'discuss-food', label: 'Еда' },
      { slug: 'discuss-travel', label: 'Путешествия' },
      { slug: 'discuss-sports', label: 'Спорт' },
      { slug: 'discuss-games', label: 'Игры' },
      { slug: 'discuss-philosophy', label: 'Философия' },
      { slug: 'discuss-casual', label: 'Просто поговорить' },
    ],
  },
  {
    slug: 'tasks-gigs',
    emoji: '🎤',
    label: 'Задания',
    categories: [
      { slug: 'task-computer', label: 'Компьютер' },
      { slug: 'task-creative', label: 'Креатив' },
      { slug: 'task-filming', label: 'Съёмки' },
      { slug: 'task-events', label: 'Мероприятия' },
      { slug: 'task-manual', label: 'Ручной труд' },
      { slug: 'task-writing', label: 'Тексты' },
      { slug: 'task-music', label: 'Музыка' },
    ],
  },
  {
    slug: 'resumes',
    emoji: '📄',
    label: 'Резюме',
    categories: [
      { slug: 'resume-post', label: 'Размещение резюме' },
      { slug: 'job-seeking', label: 'Ищу работу' },
      { slug: 'portfolio', label: 'Портфолио' },
    ],
  },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]['slug'];
export type Section = (typeof SECTIONS)[number];

export const CATEGORIES = [
  ...SECTIONS[0].categories,
  ...SECTIONS[1].categories,
  ...SECTIONS[2].categories,
  ...SECTIONS[3].categories,
  ...SECTIONS[4].categories,
  ...SECTIONS[5].categories,
  ...SECTIONS[6].categories,
  ...SECTIONS[7].categories,
  ...SECTIONS[8].categories,
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const AD_TYPES = [
  { slug: 'sell', label: 'Продаю' },
  { slug: 'buy', label: 'Куплю' },
  { slug: 'free', label: 'Отдаю' },
] as const;

export type AdTypeSlug = (typeof AD_TYPES)[number]['slug'];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.label])
) as Record<CategorySlug, string>;

const AD_TYPE_LABELS = Object.fromEntries(AD_TYPES.map((type) => [type.slug, type.label])) as Record<AdTypeSlug, string>;

export function categoryLabel(slug: string | null): string {
  if (!slug) {
    return 'Разное';
  }

  return CATEGORY_LABELS[slug as CategorySlug] || 'Разное';
}

export function normalizeCategory(slug: string | null | undefined): CategorySlug {
  const value = (slug || '').trim() as CategorySlug;
  return CATEGORIES.some((category) => category.slug === value) ? value : 'misc';
}

export function typeLabel(slug: string | null): string {
  if (!slug) {
    return 'Продаю';
  }

  return AD_TYPE_LABELS[slug as AdTypeSlug] || 'Продаю';
}

export function normalizeAdType(slug: string | null | undefined): AdTypeSlug {
  const value = (slug || '').trim() as AdTypeSlug;
  return AD_TYPES.some((type) => type.slug === value) ? value : 'sell';
}

export function getCategoriesForSection(sectionSlug: string): Array<{ readonly slug: string; readonly label: string }> {
  const section = SECTIONS.find((s) => s.slug === sectionSlug);
  return (section?.categories || []) as Array<{ readonly slug: string; readonly label: string }>;
}

export function getSectionLabel(sectionSlug: string): string {
  const section = SECTIONS.find((s) => s.slug === sectionSlug);
  return section ? `${section.emoji} ${section.label}` : '';
}

export function buildCategoryRows(
  callbackPrefix: string,
  categories: typeof CATEGORIES | Array<{ readonly slug: string; readonly label: string }> = CATEGORIES
): Array<Array<{ text: string; callback_data: string }>> {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let index = 0; index < categories.length; index += 2) {
    rows.push(
      categories.slice(index, index + 2).map((category) => ({
        text: category.label,
        callback_data: `${callbackPrefix}${category.slug}`,
      }))
    );
  }
  return rows;
}

export function buildSectionRows(callbackPrefix: string): Array<Array<{ text: string; callback_data: string }>> {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let index = 0; index < SECTIONS.length; index += 2) {
    rows.push(
      SECTIONS.slice(index, index + 2).map((section) => ({
        text: `${section.emoji} ${section.label}`,
        callback_data: `${callbackPrefix}${section.slug}`,
      }))
    );
  }
  return rows;
}

export function buildTypeRows(callbackPrefix: string): Array<Array<{ text: string; callback_data: string }>> {
  return AD_TYPES.map((type) => [
    {
      text: type.label,
      callback_data: `${callbackPrefix}${type.slug}`,
    },
  ]);
}
