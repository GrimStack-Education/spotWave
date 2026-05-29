const RU_LABELS: Record<string, string> = {
  art: 'Искусство',
  books: 'Книги',
  business: 'Бизнес',
  coffee: 'Кофе',
  design: 'Дизайн',
  dinner: 'Ужины',
  education: 'Обучение',
  food: 'Еда',
  games: 'Игры',
  general: 'Общее',
  hiking: 'Походы',
  language: 'Языки',
  movies: 'Кино',
  music: 'Музыка',
  outdoors: 'На улице',
  photography: 'Фотография',
  running: 'Бег',
  sport: 'Спорт',
  sports: 'Спорт',
  startups: 'Стартапы',
  tech: 'Технологии',
  technology: 'Технологии',
  travel: 'Путешествия',
  wellness: 'Здоровье',
  yoga: 'Йога',
  'board-games': 'Настольные игры',
  'english-speaking': 'Английский разговорный',
};

function normalizeKey(value: string) {
  return value
    .trim()
    .replace(/\s+\d{10,}$/, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-|-$/g, '');
}

export function toRussianInterestLabel(name: string, slug?: string) {
  const slugKey = slug ? normalizeKey(slug) : '';
  const nameKey = normalizeKey(name);

  return RU_LABELS[slugKey] ?? RU_LABELS[nameKey] ?? name.replace(/\s+\d{10,}$/, '');
}
