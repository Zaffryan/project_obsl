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
  dima:   { 
    name: 'Дима',
    slot: 'right',
    tagBg: '#ffd600', 
    tagFg: '#111111',
    images: {
      neutral: 'assets/chars/dima.png',
      scared: 'assets/chars/dima_scared.png',
      upset: 'assets/chars/dima_upset.png',
      dreamy: 'assets/chars/dima_dreamy.png' } 
  }, 
  liza:   {
    name: 'Лиза',
    slot: 'center',
    tagBg: '#e5484d',
    tagFg: '#ffffff',
    images: {
      neutral: 'assets/chars/liza.png',
      smile: 'assets/chars/liza_smile.png',
      strict: 'assets/chars/liza_strict.png' }  
  },
  sergey: {
    name: 'Сергей',
    slot: 'left',
    tagBg: '#6bd35a',
    tagFg: '#0b2a07',
    images: {
      neutral: 'assets/chars/sergey.png',
      smile: 'assets/chars/sergey_smile.png',
      eyeroll: 'assets/chars/sergey_eyeroll.png',
      scaring: 'assets/chars/sergey_scaring.png'
    } }
};
