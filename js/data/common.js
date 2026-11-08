/* ===== Общие данные: фоны и герои =====
   Чтобы заменить картинку, положите новый файл с тем же именем в папку assets.
   Размер фонов: 16:9 (например 1672x941). Герои: PNG с прозрачным фоном,
   обрезанные примерно по колено. */

window.BACKGROUNDS = {
  yard_dirty:  'assets/bg/yard_dirty.webp',
  yard_clean:  'assets/bg/yard_clean.webp',
  dream_dirty: 'assets/bg/dream_dirty.webp',
  dream_clean: 'assets/bg/dream_clean.webp'
};

/* slot: где стоит герой — 'left' (слева), 'center' (по центру), 'right' (справа)
   tagBg / tagFg: цвет таблички с именем и цвет текста на ней */
window.CHARACTERS = {
  dima:   { name: 'Дима',   image: 'assets/chars/dima.png',   slot: 'right',  tagBg: '#ffd600', tagFg: '#111111' }, 
  liza:   { name: 'Лиза',   image: 'assets/chars/liza.png',   slot: 'center', tagBg: '#e5484d', tagFg: '#ffffff' },
  sergey: { name: 'Сергей', image: 'assets/chars/sergey.png', slot: 'left',   tagBg: '#6bd35a', tagFg: '#0b2a07' }
};
