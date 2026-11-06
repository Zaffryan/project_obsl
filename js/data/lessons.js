/* ===== Список карточек в главном меню =====
   steps: имя сценария из файла урока (см. js/data/lesson1.js)
   soon: true — серая карточка «скоро», на неё нельзя нажать */
window.LESSONS = [
  { id: 'sorting', title: 'Урок 1: Сортировка мусора',  card: 'assets/ui/card_lesson1.png', steps: 'sorting' },
  { id: 'soon',    title: 'Следующий урок — скоро',     card: 'assets/ui/card_soon.png',    soon: true }
];
