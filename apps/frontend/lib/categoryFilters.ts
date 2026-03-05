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

export const dedupeCategoriesByNormalizedName = <T extends { name: string; id?: number }>(
  categories: T[],
) => {
  const byKey = new Map<string, T>();
  for (const category of categories) {
    const key = normalizeCategoryName(category.name);
    if (!key) continue;
    if (!byKey.has(key)) {
      byKey.set(key, category);
      continue;
    }
    const existing = byKey.get(key);
    const existingId = typeof existing?.id === "number" ? existing.id : Number.POSITIVE_INFINITY;
    const currentId = typeof category.id === "number" ? category.id : Number.POSITIVE_INFINITY;
    if (currentId < existingId) {
      byKey.set(key, category);
    }
  }
  return [...byKey.values()];
};
