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
  search_placeholder: ['Search archive...','Пошук в архіві...','Buscar en archivo...','Поиск в архиве...','Archiv durchsuchen...','Szukaj w archiwum...'],

  // Empty state
  no_records:     ['> NO RECORDS FOUND',  '> ЗАПИСІВ НЕ ЗНАЙДЕНО','> SIN RESULTADOS',    '> ЗАПИСЕЙ НЕ НАЙДЕНО','> KEINE EINTRÄGE GEFUNDEN','> BRAK WYNIKÓW'],
  no_records_sub: ['Adjust filters or search query','Змініть фільтри або запит','Ajusta los filtros o la búsqueda','Измените фильтры или запрос','Filter oder Suchanfrage anpassen','Zmień filtry lub zapytanie'],
  search_web:     ['SEARCH THE WEB',      'ШУКАТИ В МЕРЕЖІ',    'BUSCAR EN LA WEB',    'ИСКАТЬ В СЕТИ',      'IM WEB SUCHEN',            'SZUKAJ W SIECI'],

  // Accessibility labels
  open_details:   ['open details', 'відкрити деталі', 'abrir detalles', 'открыть детали', 'Details öffnen', 'otwórz szczegóły'],

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

  // Reading reminders
  reminders_title:      ['>> PICK UP WHERE YOU LEFT OFF', '>> ПОВЕРНІТЬСЯ ДО ЧИТАННЯ', '>> CONTINÚA TU LECTURA', '>> ВЕРНИТЕСЬ К ЧТЕНИЮ', '>> WEITERLESEN', '>> WRÓĆ DO CZYTANIA'],
  reminders_last_read:  ['> Last read',        '> Останній раз читали', '> Última lectura', '> Последнее чтение', '> Zuletzt gelesen',        '> Ostatnio czytane'],
  reminders_not_started:['> Not started yet',  '> Ще не почато',     '> Aún sin empezar',   '> Ещё не начато',    '> Noch nicht begonnen',    '> Jeszcze nie zaczęto'],
  reminders_days_ago_sg:['day ago',            'день тому',          'día',                 'день назад',         'Tag her',                  'dzień temu'],
  reminders_days_ago_pl:['days ago',           'днів тому',          'días',                'дней назад',         'Tagen her',                'dni temu'],

  // Bulk actions
  btn_select:           ['☑ SELECT',           '☑ ВИБІР',            '☑ SELECCIONAR',       '☑ ВЫБОР',            '☑ AUSWÄHLEN',              '☑ WYBIERZ'],
  btn_select_done:      ['✕ DONE',             '✕ ГОТОВО',           '✕ LISTO',             '✕ ГОТОВО',           '✕ FERTIG',                 '✕ GOTOWE'],
  bulk_selected_count:  ['selected',           'вибрано',            'seleccionados',       'выбрано',            'ausgewählt',               'wybranych'],
  bulk_select_all:      ['[ ALL ]',            '[ УСІ ]',            '[ TODOS ]',           '[ ВСЕ ]',            '[ ALLE ]',                 '[ WSZYSTKIE ]'],
  bulk_tag_placeholder: ['add tag…',           'тег…',               'etiqueta…',           'тег…',               'Tag…',                     'tag…'],
  bulk_tag_apply:       ['[ TAG ]',            '[ ТЕГ ]',            '[ ETIQUETA ]',        '[ ТЕГ ]',            '[ TAG ]',                  '[ TAG ]'],
  bulk_move_placeholder:['move to list…',      'до списку…',         'mover a lista…',      'в список…',          'zu Liste…',                'do listy…'],
  bulk_delete:          ['[ DELETE ]',         '[ ВИДАЛИТИ ]',       '[ ELIMINAR ]',        '[ УДАЛИТЬ ]',        '[ LÖSCHEN ]',              '[ USUŃ ]'],
  bulk_delete_confirm:  ['Delete {n} books? This cannot be undone.', 'Видалити {n} книг? Це незворотно.', '¿Eliminar {n} libros? No se puede deshacer.', 'Удалить {n} книг? Это нельзя отменить.', '{n} Bücher löschen? Das kann nicht rückgängig gemacht werden.', 'Usunąć {n} książek? Tej operacji nie można odwrócić.'],
  bulk_yes_delete:      ['[ YES, DELETE ]',    '[ ТАК, ВИДАЛИТИ ]',  '[ SÍ, ELIMINAR ]',    '[ ДА, УДАЛИТЬ ]',    '[ JA, LÖSCHEN ]',          '[ TAK, USUŃ ]'],
  bulk_cancel:          ['[ CANCEL ]',         '[ ВІДМІНА ]',        '[ CANCELAR ]',        '[ ОТМЕНА ]',         '[ ABBRECHEN ]',            '[ ANULUJ ]'],
  bulk_tagged_toast:    ['{n} books tagged "{tag}"', '{n} книг позначено "{tag}"', '{n} libros etiquetados "{tag}"', '{n} книг помечено "{tag}"', '{n} Bücher mit "{tag}" markiert', '{n} książek oznaczono "{tag}"'],
  bulk_moved_toast:     ['{n} books added to "{list}"', '{n} книг додано до "{list}"', '{n} libros añadidos a "{list}"', '{n} книг добавлено в "{list}"', '{n} Bücher zu "{list}" hinzugefügt', '{n} książek dodano do "{list}"'],
  bulk_deleted_toast:   ['{n} books deleted',  '{n} книг видалено',  '{n} libros eliminados', '{n} книг удалено',  '{n} Bücher gelöscht',      '{n} książek usunięto'],

  // Lists panel

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
  form_err_title_required:  ['Title is required',  'Назва обов\'язкова',  'El título es obligatorio',  'Название обязательно',  'Titel ist erforderlich',  'Tytuł jest wymagany'],
  form_err_author_required: ['Author is required', 'Автор обов\'язковий', 'El autor es obligatorio',   'Автор обязателен',      'Autor ist erforderlich',  'Autor jest wymagany'],
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
  notes_title:       ['NOTES & JOURNAL',       'НОТАТКИ ТА ЩОДЕННИК',   'NOTAS Y DIARIO',       'ЗАМЕТКИ И ДНЕВНИК',    'NOTIZEN & TAGEBUCH',      'NOTATKI I DZIENNIK'],
  notes_empty:       ['No notes yet.',         'Заметок ще немає.',    'Sin notas todavía.',  'Заметок ещё нет.',     'Noch keine Notizen.',     'Brak notatek.'],
  notes_ph_text:     ['Add a thought, reflection, or journal entry...', 'Додайте думку чи запис у щоденник...', 'Añade un pensamiento o entrada de diario...', 'Добавьте мысль или запись в дневник...', 'Gedanken oder Tagebucheintrag hinzufügen...', 'Dodaj myśl lub wpis do dziennika...'],
  notes_btn_add:     ['+ ADD NOTE',            '+ ДОДАТИ НОТАТКУ',      '+ AÑADIR NOTA',       '+ ДОБАВИТЬ ЗАМЕТКУ',   '+ NOTIZ HINZUFÜGEN',      '+ DODAJ NOTATKĘ'],

  quotes_title:      ['QUOTES & HIGHLIGHTS',   'ЦИТАТИ ТА ВИДІЛЕННЯ',   'CITAS Y DESTACADOS',   'ЦИТАТЫ И ВЫДЕЛЕНИЯ',   'ZITATE & MARKIERUNGEN',   'CYTATY I WYRÓŻNIENIA'],
  quotes_empty:      ['No quotes saved yet.',  'Цитат ще немає.',       'Sin citas guardadas.', 'Цитат ещё нет.',       'Noch keine Zitate.',      'Brak zapisanych cytatów.'],
  quotes_page_label: ['Page',                  'Ст.',                   'Pág.',                 'Стр.',                 'S.',                      'Str.'],
  quotes_ph_text:    ['Memorable passage...',  'Запам\'ятний уривок...','Pasaje memorable...', 'Запоминающийся отрывок...','Einprägsame Passage...','Pamiętny fragment...'],
  quotes_ph_page:    ['Page #',               'Стор. №',               'Pág. №',               'Стр. №',               'Seite Nr.',               'Str. nr'],
  quotes_btn_add:    ['+ ADD QUOTE',           '+ ДОДАТИ ЦИТАТУ',       '+ AÑADIR CITA',       '+ ДОБАВИТЬ ЦИТАТУ',    '+ ZITAT HINZUFÜGEN',      '+ DODAJ CYTAT'],

  // Reading session log
  sessions_title:     ['SESSION LOG',            'ЖУРНАЛ СЕСІЙ',              'REGISTRO DE SESIONES',     'ЖУРНАЛ СЕССИЙ',            'SITZUNGSPROTOKOLL',          'DZIENNIK SESJI'],
  sessions_empty:     ['No sessions logged yet.','Сесій ще немає.',           'Sin sesiones registradas.','Сессий ещё нет.',          'Noch keine Sitzungen.',      'Brak zapisanych sesji.'],
  sessions_total:     ['TOTAL PAGES LOGGED',     'ВСЬОГО СТОРІНОК',           'PÁGINAS REGISTRADAS',      'ВСЕГО СТРАНИЦ',            'SEITEN GESAMT',              'ŁĄCZNIE STRON'],
  sessions_ph_pages:  ['Pages read',             'Сторінок прочитано',        'Páginas leídas',           'Страниц прочитано',        'Gelesene Seiten',            'Przeczytane strony'],
  sessions_btn_add:   ['+ LOG SESSION',          '+ ЗАПИСАТИ СЕСІЮ',          '+ REGISTRAR SESIÓN',       '+ ЗАПИСАТЬ СЕССИЮ',        '+ SITZUNG EINTRAGEN',        '+ DODAJ SESJĘ'],
  sessions_pages_unit:['pp.',                    'стор.',                     'pp.',                      'стр.',                     'S.',                         'str.'],

  // Where to find
  avail_title: ['WHERE TO FIND',                    'ДЕ ЗНАЙТИ',                         'DÓNDE ENCONTRAR',                  'ГДЕ НАЙТИ',                        'WO ZU FINDEN',                      'GDZIE ZNALEŹĆ'],
  avail_note:  ['External links — prices and availability vary.','Зовнішні посилання — ціни та наявність можуть відрізнятись.','Enlaces externos — los precios y la disponibilidad varían.','Внешние ссылки — цены и наличие могут отличаться.','Externe Links — Preise und Verfügbarkeit variieren.','Linki zewnętrzne — ceny i dostępność mogą się różnić.'],

  // Backup buttons
  btn_export:         ['↓ EXPORT',            '↓ ЕКСПОРТ',            '↓ EXPORTAR',           '↓ ЭКСПОРТ',            '↓ EXPORTIEREN',             '↓ EKSPORT'],
  btn_export_json:    ['JSON',                'JSON',                 'JSON',                 'JSON',                 'JSON',                      'JSON'],
  btn_export_csv:     ['CSV',                 'CSV',                  'CSV',                  'CSV',                  'CSV',                       'CSV'],
  btn_import:         ['↑ IMPORT',            '↑ ІМПОРТ',             '↑ IMPORTAR',           '↑ ИМПОРТ',             '↑ IMPORTIEREN',             '↑ IMPORT'],
  export_success:     ['ARCHIVE EXPORTED',    'АРХІВ ЕКСПОРТОВАНО',   'ARCHIVO EXPORTADO',    'АРХИВ ЭКСПОРТИРОВАН',  'ARCHIV EXPORTIERT',         'ARCHIWUM WYEKSPORTOWANE'],
  import_success:     ['{n} RECORDS IMPORTED','{n} ЗАПИСІВ ІМПОРТОВАНО','{n} REGISTROS IMPORTADOS','{n} ЗАПИСЕЙ ИМПОРТИРОВАНО','{n} EINTRÄGE IMPORTIERT','{n} REKORDÓW ZAIMPORTOWANYCH'],
  import_invalid:     ['INVALID FILE FORMAT', 'НЕВІРНИЙ ФОРМАТ ФАЙЛУ','FORMATO INVÁLIDO',     'НЕВЕРНЫЙ ФОРМАТ ФАЙЛА','UNGÜLTIGES DATEIFORMAT',    'NIEPRAWIDŁOWY FORMAT'],
  import_error:       ['IMPORT FAILED',       'ПОМИЛКА ІМПОРТУ',      'ERROR DE IMPORTACIÓN', 'ОШИБКА ИМПОРТА',       'IMPORT FEHLGESCHLAGEN',     'BŁĄD IMPORTU'],

  // Toast notifications
  toast_saved:          ['RECORD SAVED',                 'ЗАПИС ЗБЕРЕЖЕНО',              'REGISTRO GUARDADO',           'ЗАПИСЬ СОХРАНЕНА',             'EINTRAG GESPEICHERT',           'REKORD ZAPISANY'],
  toast_updated:        ['RECORD UPDATED',               'ЗАПИС ОНОВЛЕНО',               'REGISTRO ACTUALIZADO',        'ЗАПИСЬ ОБНОВЛЕНА',             'EINTRAG AKTUALISIERT',          'REKORD ZAKTUALIZOWANY'],
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

  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = currentLang;
}
