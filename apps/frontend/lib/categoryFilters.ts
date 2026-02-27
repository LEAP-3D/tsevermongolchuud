export const RESTRICTED_CATEGORY_KEYWORDS = [
  'adult',
  'porn',
  'gambling',
  'casino',
  'betting',
  'drugs',
  'crime',
  'violence',
];

export const normalizeCategoryName = (value: string | null | undefined) =>
  String(value ?? '').trim().toLowerCase();

export const isRestrictedCategory = (name: string | null | undefined) => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return false;
  return RESTRICTED_CATEGORY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const filterRestrictedCategories = <T extends { name: string }>(categories: T[]) =>
  categories.filter((category) => !isRestrictedCategory(category.name));
