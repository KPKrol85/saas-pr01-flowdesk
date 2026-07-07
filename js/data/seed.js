const day = 24 * 60 * 60 * 1000;
const dateFromNow = (days) => new Date(Date.now() + days * day).toISOString();

export const seedData = {
  clients: [
    {
      id: 'c1',
      name: 'Nova Studio',
      email: 'hello@nova-studio.test',
      phone: '+48 000 000 101',
      status: 'Aktywny',
      notes: 'Stała obsługa biura kreatywnego: zgłoszenia sprzętowe, terminy wdrożeń i wsparcie dla zespołu projektowego.',
      contacts: [
        { id: 'ct1', name: 'Marta Demo', role: 'Operations Lead', email: 'operations@nova-studio.test', phone: '+48 000 000 102' },
        { id: 'ct1b', name: 'Kuba Demo', role: 'IT Coordinator', email: 'it@nova-studio.test', phone: '+48 000 000 103' }
      ],
      tags: ['retainer', 'office-support', 'priority'],
      segment: 'Agency',
      owner: 'Alicja Maj',
      activity: [
        { id: 'a1', text: 'Uzgodniono zakres wdrożenia panelu klienta dla zespołu operacyjnego.', date: dateFromNow(-9) },
        { id: 'a2', text: 'Zebrano uwagi do widoku statusów i eskalacji SLA.', date: dateFromNow(-4) },
        { id: 'a3', text: 'Zaplanowano odbiór makiet po spotkaniu statusowym.', date: dateFromNow(-1) }
      ]
    },
    {
      id: 'c2',
      name: 'Klinika Aurora',
      email: 'kontakt@klinika-aurora.test',
      phone: '+48 000 000 201',
      status: 'Aktywny',
      notes: 'Obsługa techniczna recepcji, gabinetów i sprzętu wspierającego rejestrację pacjentów.',
      contacts: [
        { id: 'ct2', name: 'Piotr Demo', role: 'Facility Manager', email: 'facility@klinika-aurora.test', phone: '+48 000 000 202' },
        { id: 'ct2b', name: 'Ewa Demo', role: 'Reception Lead', email: 'recepcja@klinika-aurora.test', phone: '+48 000 000 203' }
      ],
      tags: ['sla', 'healthcare', 'field-service'],
      segment: 'Healthcare',
      owner: 'Kamil Rutkowski',
      activity: [
        { id: 'a4', text: 'Zebrano dane do audytu SLA po serii zgłoszeń z recepcji.', date: dateFromNow(-6) },
        { id: 'a5', text: 'Potwierdzono okno serwisowe dla pilnej naprawy klimatyzacji.', date: dateFromNow(-2) }
      ]
    },
    {
      id: 'c3',
      name: 'EventLine',
      email: 'ops@eventline-demo.test',
      phone: '+48 000 000 301',
      status: 'Potencjalny',
      notes: 'Lead z polecenia. Zespół potrzebuje wsparcia technicznego przy cyklu wydarzeń Q3.',
      contacts: [{ id: 'ct3', name: 'Olga Demo', role: 'Project Coordinator', email: 'koordynacja@eventline-demo.test', phone: '+48 000 000 302' }],
      tags: ['lead', 'event-support', 'proposal'],
      segment: 'Lead',
      owner: 'Alicja Maj',
      activity: [
        { id: 'a6', text: 'Otrzymano brief wydarzeń Q3 i listę wymaganych terminów.', date: dateFromNow(-3) },
        { id: 'a7', text: 'Ustalono zakres wyceny: koordynacja, dyżur techniczny i dokumentacja po wydarzeniu.', date: dateFromNow(-1) }
      ]
    },
    {
      id: 'c4',
      name: 'Przystań Office',
      email: 'admin@przystan-office.test',
      phone: '+48 000 000 401',
      status: 'Zawieszony',
      notes: 'Historyczny klient z zakończonym kontraktem utrzymaniowym. Pozostaje w archiwum jako przykład restore flow.',
      contacts: [{ id: 'ct4', name: 'Tomasz Demo', role: 'Office Manager', email: 'office@przystan-office.test', phone: '+48 000 000 402' }],
      tags: ['archived', 'maintenance'],
      segment: 'SMB',
      owner: 'Kamil Rutkowski',
      activity: [
        { id: 'a8', text: 'Zamknięto ostatni przegląd miesięczny i przekazano podsumowanie.', date: dateFromNow(-24) },
        { id: 'a9', text: 'Zarchiwizowano klienta po zakończeniu kontraktu demo.', date: dateFromNow(-18) }
      ],
      archivedAt: dateFromNow(-18)
    }
  ],
  projects: [
    {
      id: 'p1',
      name: 'Wdrożenie panelu klienta',
      clientId: 'c1',
      status: 'In progress',
      priority: 'High',
      dueDate: dateFromNow(4),
      notes: 'Oczekuje na feedback do makiet.',
      tasks: [
        { id: 't1', title: 'Dostarczyć makiety dashboardu', done: true },
        { id: 't2', title: 'Zebrać feedback od klienta', done: false },
        { id: 't3', title: 'Przygotować plan wdrożenia', done: false },
        { id: 't4', title: 'Potwierdzić listę statusów SLA', done: true }
      ],
      sla: {
        serviceLevel: 'Priority',
        responseDueDate: dateFromNow(1)
      },
      estimate: { hours: 44, value: 17600, currency: 'PLN' },
      comments: [
        { id: 'cm1', author: 'Alicja Maj', body: 'Klient poprosił o prosty widok statusów dla zespołu i kontaktów serwisowych.', date: dateFromNow(-2) },
        { id: 'cm2', author: 'Kamil Rutkowski', body: 'Do odbioru trzeba pokazać zaległe działania, SLA i właściciela zlecenia.', date: dateFromNow(-1) }
      ],
      history: [
        { id: 'h1', text: 'Utworzono zlecenie po warsztacie discovery.', date: dateFromNow(-12) },
        { id: 'h2', text: 'Status zmieniony na In progress.', date: dateFromNow(-8) },
        { id: 'h3', text: 'Zamknięto etap makiet dashboardu.', date: dateFromNow(-3) }
      ]
    },
    {
      id: 'p2',
      name: 'Audyt SLA recepcji',
      clientId: 'c2',
      status: 'Review',
      priority: 'Medium',
      dueDate: dateFromNow(6),
      notes: 'Raport powinien podsumować czasy reakcji, ryzyka operacyjne i rekomendacje dla recepcji.',
      tasks: [
        { id: 't5', title: 'Zweryfikować czasy reakcji z ostatnich zgłoszeń', done: true },
        { id: 't6', title: 'Dopisać rekomendacje dla recepcji', done: false },
        { id: 't7', title: 'Wysłać raport do akceptacji', done: false }
      ],
      sla: {
        serviceLevel: 'Critical',
        responseDueDate: dateFromNow(2)
      },
      estimate: { hours: 18, value: 7200, currency: 'PLN' },
      comments: [{ id: 'cm3', author: 'Kamil Rutkowski', body: 'Raport wymaga krótkiej sekcji z ryzykiem przerw w rejestracji.', date: dateFromNow(-1) }],
      history: [
        { id: 'h4', text: 'Zebrano log zgłoszeń z ostatnich dwóch tygodni.', date: dateFromNow(-5) },
        { id: 'h5', text: 'Przeniesiono do Review po audycie danych.', date: dateFromNow(-2) }
      ]
    },
    {
      id: 'p3',
      name: 'Obsługa eventu Q3',
      clientId: 'c3',
      status: 'Draft',
      priority: 'Low',
      dueDate: dateFromNow(12),
      notes: 'Oferta obejmuje dyżur techniczny, przygotowanie checklisty i powykonawcze podsumowanie.',
      tasks: [
        { id: 't8', title: 'Doprecyzować zakres obsługi', done: false },
        { id: 't9', title: 'Wysłać wycenę', done: false },
        { id: 't10', title: 'Potwierdzić terminy wydarzeń', done: true }
      ],
      sla: {
        serviceLevel: 'Standard',
        responseDueDate: dateFromNow(4)
      },
      estimate: { hours: 28, value: 11200, currency: 'PLN' },
      comments: [{ id: 'cm4', author: 'Alicja Maj', body: 'Na razie lead. Nie planować zasobów przed akceptacją oferty.', date: dateFromNow(-1) }],
      history: [
        { id: 'h6', text: 'Utworzono szkic zlecenia po briefie.', date: dateFromNow(-3) },
        { id: 'h7', text: 'Dodano wstępny zakres dyżuru technicznego.', date: dateFromNow(-1) }
      ]
    },
    {
      id: 'p4',
      name: 'Migracja formularza kontaktowego',
      clientId: 'c1',
      status: 'Done',
      priority: 'Medium',
      dueDate: dateFromNow(-7),
      notes: 'Zakończone i przekazane do utrzymania. Formularz kieruje zgłoszenia do kolejki obsługi.',
      tasks: [
        { id: 't11', title: 'Wdrożyć formularz', done: true },
        { id: 't12', title: 'Przekazać dokumentację', done: true },
        { id: 't13', title: 'Potwierdzić routing zgłoszeń', done: true }
      ],
      sla: {
        serviceLevel: 'Standard',
        responseDueDate: dateFromNow(-9)
      },
      estimate: { hours: 12, value: 4800, currency: 'PLN' },
      comments: [{ id: 'cm5', author: 'Alicja Maj', body: 'Klient zaakceptował wdrożenie bez poprawek.', date: dateFromNow(-6) }],
      history: [
        { id: 'h8', text: 'Zlecenie oznaczone jako Done.', date: dateFromNow(-6) },
        { id: 'h9', text: 'Przekazano instrukcję obsługi formularza.', date: dateFromNow(-5) }
      ],
      completedAt: dateFromNow(-6)
    },
    {
      id: 'p5',
      name: 'Awaryjna naprawa klimatyzacji',
      clientId: 'c2',
      status: 'In progress',
      priority: 'High',
      dueDate: dateFromNow(-1),
      notes: 'Zlecenie po terminie. Serwis ma potwierdzić części i zamknąć temat przed kolejnym dniem przyjęć.',
      tasks: [
        { id: 't14', title: 'Potwierdzić dostępność części', done: true },
        { id: 't15', title: 'Wykonać wizytę serwisową', done: false },
        { id: 't16', title: 'Przekazać raport po naprawie', done: false }
      ],
      sla: {
        serviceLevel: 'Critical',
        responseDueDate: dateFromNow(-2)
      },
      estimate: { hours: 9, value: 3600, currency: 'PLN' },
      comments: [
        { id: 'cm6', author: 'Kamil Rutkowski', body: 'Klinika zgłosiła wzrost temperatury w dwóch gabinetach. Priorytet krytyczny.', date: dateFromNow(-3) },
        { id: 'cm7', author: 'Alicja Maj', body: 'Po naprawie dodać krótką notatkę do historii klienta.', date: dateFromNow(-1) }
      ],
      history: [
        { id: 'h10', text: 'Zlecenie utworzono jako zgłoszenie awaryjne.', date: dateFromNow(-4) },
        { id: 'h11', text: 'Status zmieniony na In progress po potwierdzeniu technika.', date: dateFromNow(-3) },
        { id: 'h12', text: 'Termin przekroczony, wymagana aktualizacja statusu.', date: dateFromNow(-1) }
      ]
    },
    {
      id: 'p6',
      name: 'Przegląd po zakończonym kontrakcie',
      clientId: 'c4',
      status: 'Done',
      priority: 'Low',
      dueDate: dateFromNow(-22),
      notes: 'Historyczne zlecenie utrzymaniowe pozostawione w archiwum do demonstracji filtrowania i restore flow.',
      tasks: [
        { id: 't17', title: 'Zamknąć listę przeglądów', done: true },
        { id: 't18', title: 'Przekazać podsumowanie klientowi', done: true }
      ],
      sla: {
        serviceLevel: 'Standard',
        responseDueDate: dateFromNow(-24)
      },
      estimate: { hours: 6, value: 2400, currency: 'PLN' },
      comments: [{ id: 'cm8', author: 'Kamil Rutkowski', body: 'Kontrakt zamknięty bez otwartych zgłoszeń.', date: dateFromNow(-20) }],
      history: [
        { id: 'h13', text: 'Zlecenie zamknięte po ostatnim przeglądzie.', date: dateFromNow(-20) },
        { id: 'h14', text: 'Zarchiwizowano zlecenie po zakończeniu kontraktu.', date: dateFromNow(-18) }
      ],
      completedAt: dateFromNow(-20),
      archivedAt: dateFromNow(-18)
    }
  ],
  events: [
    {
      id: 'e1',
      title: 'Status wdrożenia panelu - Nova Studio',
      date: dateFromNow(1),
      clientId: 'c1',
      projectId: 'p1'
    },
    {
      id: 'e2',
      title: 'Przegląd SLA recepcji',
      date: dateFromNow(2),
      clientId: 'c2',
      projectId: 'p2',
      type: 'Meeting'
    },
    {
      id: 'e3',
      title: 'Wizyta serwisowa: klimatyzacja',
      date: dateFromNow(1),
      clientId: 'c2',
      projectId: 'p5',
      type: 'Deadline'
    },
    {
      id: 'e4',
      title: 'Call kwalifikacyjny EventLine',
      date: dateFromNow(4),
      clientId: 'c3',
      projectId: 'p3',
      type: 'Meeting'
    }
  ],
  ui: {
    theme: 'light',
    reducedMotion: false
  }
};
