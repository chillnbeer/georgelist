export const CATEGORIES = [
  { slug: 'auto', label: 'Авто' },
  { slug: 'electronics', label: 'Электроника' },
  { slug: 'phones', label: 'Телефоны' },
  { slug: 'computers', label: 'Компьютеры' },
  { slug: 'appliances', label: 'Бытовая техника' },
  { slug: 'clothes', label: 'Одежда' },
  { slug: 'beauty', label: 'Красота и здоровье' },
  { slug: 'kids', label: 'Детские товары' },
  { slug: 'furniture', label: 'Мебель' },
  { slug: 'home', label: 'Для дома и дачи' },
  { slug: 'housing', label: 'Жильё' },
  { slug: 'rent', label: 'Аренда' },
  { slug: 'jobs', label: 'Работа' },
  { slug: 'services', label: 'Услуги' },
  { slug: 'education', label: 'Обучение' },
  { slug: 'events', label: 'Мероприятия' },
  { slug: 'travel', label: 'Путешествия' },
  { slug: 'sports', label: 'Спорт и отдых' },
  { slug: 'pets', label: 'Животные' },
  { slug: 'hobby', label: 'Хобби' },
  { slug: 'creative', label: 'Творчество' },
  { slug: 'books', label: 'Книги и журналы' },
  { slug: 'things', label: 'Вещи' },
  { slug: 'giveaway', label: 'Даром' },
  { slug: 'misc', label: 'Разное' },
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

export function buildCategoryRows(
  callbackPrefix: string,
  categories: typeof CATEGORIES = CATEGORIES
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

export function buildTypeRows(callbackPrefix: string): Array<Array<{ text: string; callback_data: string }>> {
  return AD_TYPES.map((type) => [
    {
      text: type.label,
      callback_data: `${callbackPrefix}${type.slug}`,
    },
  ]);
}
