// Translations table: each key maps to [en, uk, es, ru, de, pl]
// Adding a new language = add one more column to every row.
const LANGS = ['en', 'uk', 'es', 'ru', 'de', 'pl'];

/* eslint-disable no-multi-spaces */
const T = {
  // Stat labels
  stat_completed: ['Completed',  'Прочитано',  'Completados', 'Прочитано',  'Gelesen',          'Przeczytane'],
  stat_reading:   ['Reading',    'Читаю',      'Leyendo',     'Читаю',      'Lese',             'Czytam'],
  stat_queued:    ['Queued',     'Черга',      'En cola',     'Очередь',    'Wartend',          'Kolejka'],
  stat_total:     ['Total',      'Всього',     'Total',       'Всего',      'Gesamt',           'Razem'],

  // Filter buttons
  filter_all:     ['ALL',        'УСІ',        'TODOS',       'ВСЕ',        'ALLE',             'WSZYSTKIE'],
  filter_reading: ['READING',    'ЧИТАЮ',      'LEYENDO',     'ЧИТАЮ',      'LESE',             'CZYTAM'],
  filter_done:    ['DONE',       'ПРОЧИТАНО',  'LEÍDOS',      'ПРОЧИТАНО',  'GELESEN',          'PRZECZYTANE'],
  filter_queued:  ['QUEUED',     'ЧЕРГА',      'EN COLA',     'ОЧЕРЕДЬ',    'WARTEND',          'KOLEJKA'],

  // Sort options
  sort_default:   ['SORT',       'СОРТУВАННЯ', 'ORDENAR',     'СОРТИРОВКА', 'SORTIEREN',        'SORTUJ'],
  sort_title_az:  ['TITLE A→Z',  'НАЗВА А→Я',  'TÍTULO A→Z',  'НАЗВАНИЕ А→Я','TITEL A→Z',       'TYTUŁ A→Z'],
  sort_title_za:  ['TITLE Z→A',  'НАЗВА Я→А',  'TÍTULO Z→A',  'НАЗВАНИЕ Я→А','TITEL Z→A',       'TYTUŁ Z→A'],
  sort_rating:    ['RATING ↓',   'РЕЙТИНГ ↓',  'PUNTUACIÓN ↓','РЕЙТИНГ ↓',  'BEWERTUNG ↓',     'OCENA ↓'],
  sort_pages:     ['PAGES ↓',    'СТОРІНКИ ↓', 'PÁGINAS ↓',   'СТРАНИЦЫ ↓', 'SEITEN ↓',        'STRONY ↓'],
  sort_added:     ['DATE ADDED', 'ДАТА ДОДАВАННЯ','FECHA AÑADIDO','ДАТА ДОБАВЛЕНИЯ','DATUM HINZUGEFÜGT','DATA DODANIA'],

  // Toolbar buttons
  btn_lists:      ['LISTS',      'СПИСКИ',     'LISTAS',      'СПИСКИ',     'LISTEN',           'LISTY'],
  btn_recommend:  ['⚡ RECOMMEND','⚡ РЕКОМЕНДАЦІЇ','⚡ RECOMENDAR','⚡ РЕКОМЕНДАЦИИ','⚡ EMPFEHLEN','⚡ POLECAJ'],
  btn_add_book:   ['> ADD BOOK', '> ДОДАТИ КНИГУ','> AÑADIR LIBRO','> ДОБАВИТЬ КНИГУ','> BUCH HINZUFÜGEN','> DODAJ KSIĄŻKĘ'],

  // Search
  search_placeholder: ['SEARCH ARCHIVE...','ПОШУК В АРХІВІ...','BUSCAR EN ARCHIVO...','ПОИСК В АРХИВЕ...','ARCHIV DURCHSUCHEN...','SZUKAJ W ARCHIWUM...'],

  // Empty state
  no_records:     ['> NO RECORDS FOUND',  '> ЗАПИСІВ НЕ ЗНАЙДЕНО','> SIN RESULTADOS',    '> ЗАПИСЕЙ НЕ НАЙДЕНО','> KEINE EINTRÄGE GEFUNDEN','> BRAK WYNIKÓW'],
  no_records_sub: ['Adjust filters or search query','Змініть фільтри або запит','Ajusta los filtros o la búsqueda','Измените фильтры или запрос','Filter oder Suchanfrage anpassen','Zmień filtry lub zapytanie'],

  // Status badges
  status_reading:   ['READING',    'ЧИТАЮ',     'LEYENDO',    'ЧИТАЮ',     'LESE',          'CZYTAM'],
  status_completed: ['COMPLETED',  'ПРОЧИТАНО', 'COMPLETADO', 'ПРОЧИТАНО', 'GELESEN',       'PRZECZYTANE'],
  status_to_read:   ['TO READ',    'ХОЧУ ПРОЧИТАТИ','POR LEER','ХОЧУ ПРОЧИТАТЬ','ZU LESEN', 'DO PRZECZYTANIA'],

  // Card meta labels
  meta_progress:  ['Progress',    'Прогрес',    'Progreso',    'Прогресс',   'Fortschritt',      'Postęp'],
  meta_started:   ['Started',     'Розпочато',  'Iniciado',    'Начато',     'Begonnen',         'Rozpoczęto'],
  meta_completed: ['Completed',   'Завершено',  'Completado',  'Завершено',  'Abgeschlossen',    'Ukończono'],
  meta_rating:    ['Rating',      'Рейтинг',    'Puntuación',  'Рейтинг',    'Bewertung',        'Ocena'],
  meta_status:    ['Status',      'Статус',     'Estado',      'Статус',     'Status',           'Status'],
  meta_pages:     ['Pages',       'Сторінки',   'Páginas',     'Страницы',   'Seiten',           'Strony'],
  meta_in_queue:  ['In Queue',    'У черзі',    'En cola',     'В очереди',  'In Warteschlange', 'W kolejce'],

  // Discover panel
  discover_header:    ['>_ WEB SEARCH',       '>_ ВЕБ-ПОШУК',       '>_ BÚSQUEDA WEB',     '>_ ВЕБ-ПОИСК',       '>_ WEB-SUCHE',             '>_ WYSZUKIWANIE W SIECI'],
  discover_querying:  ['QUERYING OPEN LIBRARY FOR','ЗАПИТ ДО OPEN LIBRARY ДЛЯ','CONSULTANDO OPEN LIBRARY PARA','ЗАПРОС К OPEN LIBRARY ДЛЯ','OPEN LIBRARY ABFRAGEN FÜR','ZAPYTANIE DO OPEN LIBRARY DLA'],
  discover_found:     ['FOUND',               'ЗНАЙДЕНО',           'ENCONTRADO',          'НАЙДЕНО',            'GEFUNDEN',                 'ZNALEZIONO'],
  discover_no_results:['NO RESULTS FOUND',    'РЕЗУЛЬТАТІВ НЕ ЗНАЙДЕНО','SIN RESULTADOS',  'РЕЗУЛЬТАТОВ НЕ НАЙДЕНО','KEINE ERGEBNISSE',       'BRAK WYNIKÓW'],
  discover_error:     ['NETWORK ERROR — CHECK CONNECTION','ПОМИЛКА МЕРЕЖІ — ПЕРЕВІРТЕ З\'ЄДНАННЯ','ERROR DE RED — COMPRUEBA LA CONEXIÓN','ОШИБКА СЕТИ — ПРОВЕРЬТЕ СОЕДИНЕНИЕ','NETZWERKFEHLER — VERBINDUNG PRÜFEN','BŁĄD SIECI — SPRAWDŹ POŁĄCZENIE'],
  discover_add:       ['+ ADD',               '+ ДОДАТИ',           '+ AÑADIR',            '+ ДОБАВИТЬ',         '+ HINZUFÜGEN',             '+ DODAJ'],

  // Recommendations panel
  recs_title:           ['>_ GENRE ANALYSIS',  '>_ АНАЛІЗ ЖАНРІВ',   '>_ ANÁLISIS DE GÉNEROS','>_ АНАЛИЗ ЖАНРОВ',  '>_ GENRE-ANALYSE',         '>_ ANALIZA GATUNKÓW'],
  recs_genre_profile:   ['>> GENRE PROFILE',   '>> ЖАНРОВИЙ ПРОФІЛЬ','>> PERFIL DE GÉNEROS', '>> ЖАНРОВЫЙ ПРОФИЛЬ','>> GENRE-PROFIL',          '>> PROFIL GATUNKOWY'],
  recs_recommended:     ['>> RECOMMENDED READS','>> РЕКОМЕНДОВАНІ КНИГИ','>> LECTURAS RECOMENDADAS','>> РЕКОМЕНДОВАННЫЕ КНИГИ','>> EMPFOHLENE BÜCHER','>> POLECANE LEKTURY'],
  recs_no_genre:        ['> No genre data — using popular genres.','> Немає даних — використовую популярні жанри.','> Sin datos — usando géneros populares.','> Нет данных — использую популярные жанры.','> Keine Daten — nutze beliebte Genres.','> Brak danych — używam popularnych gatunków.'],
  recs_loading:         ['> FETCHING FROM OPEN LIBRARY...','> ЗАВАНТАЖЕННЯ З OPEN LIBRARY...','> BUSCANDO EN OPEN LIBRARY...','> ЗАГРУЗКА ИЗ OPEN LIBRARY...','> LADE VON OPEN LIBRARY...','> POBIERANIE Z OPEN LIBRARY...'],
  recs_no_data:         ['> No recommendations available — check connection.','> Рекомендацій немає — перевірте з\'єднання.','> No hay recomendaciones — comprueba la conexión.','> Рекомендаций нет — проверьте соединение.','> Keine Empfehlungen — Verbindung prüfen.','> Brak rekomendacji — sprawdź połączenie.'],
  recs_analyzed:        ['> Analyzed',         '> Проаналізовано',   '> Analizados',        '> Проанализировано', '> Analysiert',             '> Przeanalizowano'],
  recs_completed_suffix_sg: ['completed book', 'прочитану книгу',   'libro leído',         'прочитанную книгу',  'gelesenes Buch',           'przeczytaną książkę'],
  recs_completed_suffix_pl: ['completed books','прочитаних книг',   'libros leídos',       'прочитанных книг',   'gelesene Bücher',          'przeczytanych książek'],
  recs_genre_loaded:    ['— genre profile loaded.','— жанровий профіль завантажено.','— perfil de géneros cargado.','— жанровый профиль загружен.','— Genre-Profil geladen.','— profil gatunkowy załadowany.'],
  recs_no_completed:    ['> No completed books yet — showing popular genres.','> Прочитаних книг ще немає — показую популярні жанри.','> Sin libros completados — mostrando géneros populares.','> Прочитанных книг нет — показываю популярные жанры.','> Noch keine gelesenen Bücher — zeige beliebte Genres.','> Brak przeczytanych książek — pokazuję popularne gatunki.'],
  recs_add:             ['+ ADD',              '+ ДОДАТИ',           '+ AÑADIR',            '+ ДОБАВИТЬ',         '+ HINZUFÜGEN',             '+ DODAJ'],

  // Lists panel
  lists_title:          ['>_ READING LISTS',   '>_ СПИСКИ ЧИТАННЯ',  '>_ LISTAS DE LECTURA','>_ СПИСКИ ЧТЕНИЯ',   '>_ LESELISTEN',            '>_ LISTY LEKTUR'],
  lists_create:         ['> CREATE',            '> СТВОРИТИ',         '> CREAR',             '> СОЗДАТЬ',          '> ERSTELLEN',              '> UTWÓRZ'],
  active_list_viewing:  ['VIEWING:',            'СПИСОК:',            'LISTA:',              'СПИСОК:',            'LISTE:',                   'LISTA:'],
  active_list_clear:    ['✕ CLEAR',             '✕ ОЧИСТИТИ',         '✕ LIMPIAR',           '✕ СБРОСИТЬ',         '✕ LEEREN',                 '✕ WYCZYŚĆ'],

  // Form modal — headings
  form_new_record:      ['INITIALIZE NEW BOOK RECORD',   'ІНІЦІАЛІЗАЦІЯ НОВОГО ЗАПИСУ',  'INICIALIZAR NUEVO REGISTRO',  'ИНИЦИАЛИЗАЦИЯ НОВОГО ЗАПИСИ', 'NEUEN BUCHEINTRAG ERSTELLEN',   'INICJALIZUJ NOWY REKORD'],
  form_modify_record:   ['MODIFY BOOK RECORD',           'РЕДАГУВАННЯ ЗАПИСУ',           'MODIFICAR REGISTRO',          'РЕДАКТИРОВАНИЕ ЗАПИСИ',        'BUCHEINTRAG BEARBEITEN',        'MODYFIKUJ REKORD'],
  form_search_label:    ['SEARCH OPEN LIBRARY TO AUTO-FILL','ПОШУК У OPEN LIBRARY ДЛЯ АВТОЗАПОВНЕННЯ','BUSCAR EN OPEN LIBRARY PARA AUTOCOMPLETAR','ПОИСК В OPEN LIBRARY ДЛЯ АВТОЗАПОЛНЕНИЯ','OPEN LIBRARY DURCHSUCHEN ZUM AUSFÜLLEN','SZUKAJ W OPEN LIBRARY DO AUTOUZUPEŁNIANIA'],
  form_search_ph:       ['Type a book title...',         'Введіть назву книги...',       'Escribe un título...',        'Введите название книги...',    'Buchtitel eingeben...',         'Wpisz tytuł książki...'],
  form_or_manual:       ['OR FILL IN MANUALLY',          'АБО ЗАПОВНІТЬ ВРУЧНУ',         'O COMPLETAR MANUALMENTE',     'ИЛИ ЗАПОЛНИТЬ ВРУЧНУЮ',        'ODER MANUELL AUSFÜLLEN',        'LUB WYPEŁNIJ RĘCZNIE'],

  // Form modal — field labels
  form_lbl_title:       ['TITLE *',                      'НАЗВА *',                      'TÍTULO *',                    'НАЗВАНИЕ *',                   'TITEL *',                       'TYTUŁ *'],
  form_ph_title:        ['Book title',                   'Назва книги',                  'Título del libro',            'Название книги',                'Buchtitel',                     'Tytuł książki'],
  form_lbl_subtitle:    ['SUBTITLE',                     'ПІДЗАГОЛОВОК',                 'SUBTÍTULO',                   'ПОДЗАГОЛОВОК',                 'UNTERTITEL',                    'PODTYTUŁ'],
  form_ph_subtitle:     ['Optional subtitle',            'Необов\'язковий підзаголовок', 'Subtítulo opcional',          'Необязательный подзаголовок',  'Optionaler Untertitel',         'Opcjonalny podtytuł'],
  form_lbl_author:      ['AUTHOR *',                     'АВТОР *',                      'AUTOR *',                     'АВТОР *',                      'AUTOR *',                       'AUTOR *'],
  form_ph_author:       ['Author name',                  'Ім\'я автора',                 'Nombre del autor',            'Имя автора',                   'Autorenname',                   'Imię autora'],
  form_lbl_category:    ['CATEGORY',                     'КАТЕГОРІЯ',                    'CATEGORÍA',                   'КАТЕГОРИЯ',                    'KATEGORIE',                     'KATEGORIA'],
  form_lbl_pages:       ['TOTAL PAGES',                  'КІЛЬКІСТЬ СТОРІНОК',           'PÁGINAS TOTALES',             'ВСЕГО СТРАНИЦ',                'SEITEN GESAMT',                 'ŁĄCZNA LICZBA STRON'],
  form_ph_pages:        ['e.g. 464',                     'напр. 464',                    'p.ej. 464',                   'напр. 464',                    'z.B. 464',                      'np. 464'],
  form_lbl_status:      ['STATUS',                       'СТАТУС',                       'ESTADO',                      'СТАТУС',                       'STATUS',                        'STATUS'],
  form_opt_reading:     ['CURRENTLY READING',            'ЧИТАЮ ЗАРАЗ',                  'LEYENDO ACTUALMENTE',         'ЧИТАЮ СЕЙЧАС',                 'LESE GERADE',                   'CZYTAM TERAZ'],
  form_opt_completed:   ['COMPLETED',                    'ПРОЧИТАНО',                    'COMPLETADO',                  'ПРОЧИТАНО',                    'ABGESCHLOSSEN',                 'PRZECZYTANE'],
  form_opt_queued:      ['IN QUEUE',                     'У ЧЕРЗІ',                      'EN COLA',                     'В ОЧЕРЕДИ',                    'IN DER WARTESCHLANGE',          'W KOLEJCE'],
  form_lbl_cur_page:    ['CURRENT PAGE',                 'ПОТОЧНА СТОРІНКА',             'PÁGINA ACTUAL',               'ТЕКУЩАЯ СТРАНИЦА',             'AKTUELLE SEITE',                'BIEŻĄCA STRONA'],
  form_ph_cur_page:     ["Page you're on",               'На якій сторінці',             'Página actual',               'На какой странице',            'Aktuelle Seite',                'Aktualna strona'],
  form_lbl_started:     ['STARTED',                      'РОЗПОЧАТО',                    'INICIADO',                    'НАЧАТО',                       'BEGONNEN',                      'ROZPOCZĘTO'],
  form_ph_started:      ['e.g. January 2026',            'напр. Січень 2026',            'p.ej. Enero 2026',            'напр. Январь 2026',            'z.B. Januar 2026',              'np. Styczeń 2026'],
  form_lbl_completed:   ['COMPLETED DATE',               'ДАТА ЗАВЕРШЕННЯ',              'FECHA DE FINALIZACIÓN',       'ДАТА ЗАВЕРШЕНИЯ',              'ABSCHLUSSDATUM',                'DATA ZAKOŃCZENIA'],
  form_ph_completed:    ['e.g. December 2025',           'напр. Грудень 2025',           'p.ej. Diciembre 2025',        'напр. Декабрь 2025',           'z.B. Dezember 2025',            'np. Grudzień 2025'],
  form_lbl_rating:      ['RATING',                       'РЕЙТИНГ',                      'PUNTUACIÓN',                  'РЕЙТИНГ',                      'BEWERTUNG',                     'OCENA'],
  form_lbl_synopsis:    ['SYNOPSIS',                     'СИНОПСИС',                     'SINOPSIS',                    'СИНОПСИС',                     'INHALTSANGABE',                 'STRESZCZENIE'],
  form_ph_synopsis:     ['Brief description...',         'Короткий опис...',             'Breve descripción...',        'Краткое описание...',          'Kurze Beschreibung...',         'Krótki opis...'],
  form_lbl_notes:       ['NOTES (one per line)',         'НОТАТКИ (по одній на рядок)',  'NOTAS (una por línea)',       'ЗАМЕТКИ (по одной в строке)', 'NOTIZEN (je eine pro Zeile)',   'NOTATKI (jedna na linię)'],
  form_ph_notes:        ['Your thoughts...',             'Ваші думки...',                'Tus pensamientos...',         'Ваши мысли...',                'Deine Gedanken...',             'Twoje myśli...'],

  // Form modal — buttons
  form_btn_create:      ['CREATE RECORD',                'СТВОРИТИ ЗАПИС',               'CREAR REGISTRO',              'СОЗДАТЬ ЗАПИСЬ',               'EINTRAG ERSTELLEN',             'UTWÓRZ REKORD'],
  form_btn_update:      ['UPDATE RECORD',                'ОНОВИТИ ЗАПИС',                'ACTUALIZAR REGISTRO',         'ОБНОВИТЬ ЗАПИСЬ',              'EINTRAG AKTUALISIEREN',         'AKTUALIZUJ REKORD'],
  form_btn_cancel:      ['CANCEL',                       'СКАСУВАТИ',                    'CANCELAR',                    'ОТМЕНА',                       'ABBRECHEN',                     'ANULUJ'],

  // Discover preview modal
  preview_heading:    ['>_ BOOK PREVIEW',      '>_ ПЕРЕГЛЯД КНИГИ',     '>_ VISTA PREVIA',        '>_ ПРЕДПРОСМОТР',       '>_ BUCHVORSCHAU',           '>_ PODGLĄD KSIĄŻKI'],
  preview_year:       ['Year',                 'Рік',                   'Año',                    'Год',                   'Jahr',                      'Rok'],
  preview_pages:      ['Pages',                'Сторінок',              'Páginas',                'Страниц',               'Seiten',                    'Stron'],
  preview_synopsis:   ['SYNOPSIS',             'СИНОПСИС',              'SINOPSIS',               'СИНОПСИС',              'INHALTSANGABE',             'STRESZCZENIE'],
  preview_no_synopsis:['No synopsis available.','Опис відсутній.',      'Sin sinopsis disponible.','Описание отсутствует.', 'Keine Inhaltsangabe.',      'Brak streszczenia.'],
  preview_add_btn:    ['+ ADD TO ARCHIVE',     '+ ДОДАТИ ДО АРХІВУ',   '+ AÑADIR AL ARCHIVO',   '+ ДОБАВИТЬ В АРХИВ',    '+ ZUM ARCHIV HINZUFÜGEN',  '+ DODAJ DO ARCHIWUM'],

  // Quotes & highlights
  quotes_title:      ['QUOTES & HIGHLIGHTS',   'ЦИТАТИ ТА ВИДІЛЕННЯ',   'CITAS Y DESTACADOS',   'ЦИТАТЫ И ВЫДЕЛЕНИЯ',   'ZITATE & MARKIERUNGEN',   'CYTATY I WYRÓŻNIENIA'],
  quotes_empty:      ['No quotes saved yet.',  'Цитат ще немає.',       'Sin citas guardadas.', 'Цитат ещё нет.',       'Noch keine Zitate.',      'Brak zapisanych cytatów.'],
  quotes_page_label: ['Page',                  'Ст.',                   'Pág.',                 'Стр.',                 'S.',                      'Str.'],
  quotes_ph_text:    ['Memorable passage...',  'Запам\'ятний уривок...','Pasaje memorable...', 'Запоминающийся отрывок...','Einprägsame Passage...','Pamiętny fragment...'],
  quotes_ph_page:    ['Page #',               'Стор. №',               'Pág. №',               'Стр. №',               'Seite Nr.',               'Str. nr'],
  quotes_btn_add:    ['+ ADD QUOTE',           '+ ДОДАТИ ЦИТАТУ',       '+ AÑADIR CITA',       '+ ДОБАВИТЬ ЦИТАТУ',    '+ ZITAT HINZUFÜGEN',      '+ DODAJ CYTAT'],

  // Backup buttons
  btn_export:         ['↓ EXPORT',            '↓ ЕКСПОРТ',            '↓ EXPORTAR',           '↓ ЭКСПОРТ',            '↓ EXPORTIEREN',             '↓ EKSPORT'],
  btn_import:         ['↑ IMPORT',            '↑ ІМПОРТ',             '↑ IMPORTAR',           '↑ ИМПОРТ',             '↑ IMPORTIEREN',             '↑ IMPORT'],
  export_success:     ['ARCHIVE EXPORTED',    'АРХІВ ЕКСПОРТОВАНО',   'ARCHIVO EXPORTADO',    'АРХИВ ЭКСПОРТИРОВАН',  'ARCHIV EXPORTIERT',         'ARCHIWUM WYEKSPORTOWANE'],
  import_success:     ['{n} RECORDS IMPORTED','{n} ЗАПИСІВ ІМПОРТОВАНО','{n} REGISTROS IMPORTADOS','{n} ЗАПИСЕЙ ИМПОРТИРОВАНО','{n} EINTRÄGE IMPORTIERT','{n} REKORDÓW ZAIMPORTOWANYCH'],
  import_invalid:     ['INVALID FILE FORMAT', 'НЕВІРНИЙ ФОРМАТ ФАЙЛУ','FORMATO INVÁLIDO',     'НЕВЕРНЫЙ ФОРМАТ ФАЙЛА','UNGÜLTIGES DATEIFORMAT',    'NIEPRAWIDŁOWY FORMAT'],
  import_error:       ['IMPORT FAILED',       'ПОМИЛКА ІМПОРТУ',      'ERROR DE IMPORTACIÓN', 'ОШИБКА ИМПОРТА',       'IMPORT FEHLGESCHLAGEN',     'BŁĄD IMPORTU'],

  // Toast notifications
  toast_saved:          ['RECORD SAVED',                 'ЗАПИС ЗБЕРЕЖЕНО',              'REGISTRO GUARDADO',           'ЗАПИСЬ СОХРАНЕНА',             'EINTRAG GESPEICHERT',           'REKORD ZAPISANY'],
  toast_updated:        ['RECORD UPDATED',               'ЗАПИС ОНОВЛЕНО',               'REGISTRO ACTUALIZADO',        'ЗАПИСЬ ОБНОВЛЕНА',             'EINTRAG AKTUALISIERT',          'REKORD ZAKTUALIZOWANY'],
  toast_deleted:        ['RECORD DELETED',               'ЗАПИС ВИДАЛЕНО',               'REGISTRO ELIMINADO',          'ЗАПИСЬ УДАЛЕНА',               'EINTRAG GELÖSCHT',              'REKORD USUNIĘTY'],
};
/* eslint-enable no-multi-spaces */

const SUPPORTED = LANGS;
let currentLang = 'en';

export function initI18n() {
  const stored = localStorage.getItem('cyberpunk-lang');
  if (stored && SUPPORTED.includes(stored)) currentLang = stored;
}

export function setLanguage(lang) {
  if (!SUPPORTED.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('cyberpunk-lang', lang);
}

export function getLang() { return currentLang; }

export function t(key) {
  const idx = LANGS.indexOf(currentLang);
  const row = T[key];
  return row?.[idx] ?? row?.[0] ?? key;
}

export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });

  const sortMap = { default: 'sort_default', 'title-az': 'sort_title_az', 'title-za': 'sort_title_za', rating: 'sort_rating', pages: 'sort_pages', added: 'sort_added' };
  document.querySelectorAll('#sort-select option').forEach(opt => {
    const key = sortMap[opt.value];
    if (key) opt.textContent = t(key);
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}
