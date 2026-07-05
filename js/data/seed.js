export const seedData = {
  clients: [
    {
      id: 'c1',
      name: 'Nova Studio',
      email: 'hello@novastudio.pl',
      phone: '+48 605 010 120',
      status: 'Aktywny',
      notes: 'Stały klient od 2022. Preferuje kontakt mailowy.',
      contacts: [{ id: 'ct1', name: 'Marta Nowak', role: 'Operations Lead', email: 'marta@novastudio.pl', phone: '+48 605 010 121' }],
      tags: ['retainer', 'web'],
      segment: 'Agency',
      owner: 'Alicja Maj',
      activity: [
        { id: 'a1', text: 'Uzgodniono zakres wdrożenia panelu klienta.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'a2', text: 'Wysłano podsumowanie statusu i następne kroki.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    },
    {
      id: 'c2',
      name: 'Klinika Aurora',
      email: 'kontakt@aurora.pl',
      phone: '+48 512 333 442',
      status: 'Aktywny',
      notes: 'Umowa na obsługę serwisową.',
      contacts: [{ id: 'ct2', name: 'Piotr Wójcik', role: 'Facility Manager', email: 'piotr@aurora.pl', phone: '+48 512 333 443' }],
      tags: ['sla', 'healthcare'],
      segment: 'Healthcare',
      owner: 'Kamil Rutkowski',
      activity: [{ id: 'a3', text: 'Zebrano dane do audytu SLA.', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }]
    },
    {
      id: 'c3',
      name: 'EventLine',
      email: 'ops@eventline.pl',
      phone: '+48 698 220 110',
      status: 'Potencjalny',
      notes: 'Lead z polecenia, czeka na ofertę.',
      contacts: [{ id: 'ct3', name: 'Olga Zielińska', role: 'Project Coordinator', email: 'olga@eventline.pl', phone: '+48 698 220 111' }],
      tags: ['lead', 'event'],
      segment: 'Lead',
      owner: 'Alicja Maj',
      activity: [{ id: 'a4', text: 'Otrzymano brief eventu Q3.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }]
    }
  ],
  projects: [
    {
      id: 'p1',
      name: 'Wdrożenie panelu klienta',
      clientId: 'c1',
      status: 'In progress',
      priority: 'High',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Oczekuje na feedback do makiet.',
      tasks: [
        { id: 't1', title: 'Dostarczyć makiety dashboardu', done: true },
        { id: 't2', title: 'Zebrać feedback od klienta', done: false },
        { id: 't3', title: 'Przygotować plan wdrożenia', done: false }
      ],
      sla: {
        serviceLevel: 'Priority',
        responseDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      estimate: { hours: 42, value: 16800, currency: 'PLN' },
      comments: [{ id: 'cm1', author: 'Alicja Maj', body: 'Klient poprosił o widok statusów dla zespołu.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }],
      history: [{ id: 'h1', text: 'Status zmieniony na In progress.', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }]
    },
    {
      id: 'p2',
      name: 'Audyt SLA',
      clientId: 'c2',
      status: 'Review',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Przygotować raport PDF.',
      tasks: [
        { id: 't4', title: 'Zweryfikować czasy reakcji', done: true },
        { id: 't5', title: 'Dopisać rekomendacje', done: false }
      ],
      sla: {
        serviceLevel: 'Critical',
        responseDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      estimate: { hours: 18, value: 7200, currency: 'PLN' },
      comments: [{ id: 'cm2', author: 'Kamil Rutkowski', body: 'Raport wymaga sekcji z ryzykami operacyjnymi.', date: new Date().toISOString() }],
      history: [{ id: 'h2', text: 'Przeniesiono do Review po audycie danych.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }]
    },
    {
      id: 'p3',
      name: 'Obsługa eventu Q3',
      clientId: 'c3',
      status: 'Draft',
      priority: 'Low',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Wycenę wysłać do piątku.',
      tasks: [
        { id: 't6', title: 'Doprecyzować zakres obsługi', done: false },
        { id: 't7', title: 'Wysłać wycenę', done: false }
      ],
      sla: {
        serviceLevel: 'Standard',
        responseDueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      estimate: { hours: 24, value: 9600, currency: 'PLN' },
      comments: [],
      history: [{ id: 'h3', text: 'Utworzono szkic zlecenia po briefie.', date: new Date().toISOString() }]
    },
    {
      id: 'p4',
      name: 'Migracja formularza kontaktowego',
      clientId: 'c1',
      status: 'Done',
      priority: 'Medium',
      dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Zakończone i przekazane do utrzymania.',
      tasks: [
        { id: 't8', title: 'Wdrożyć formularz', done: true },
        { id: 't9', title: 'Przekazać dokumentację', done: true }
      ],
      sla: {
        serviceLevel: 'Standard',
        responseDueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      estimate: { hours: 12, value: 4800, currency: 'PLN' },
      comments: [{ id: 'cm3', author: 'Alicja Maj', body: 'Klient zaakceptował wdrożenie bez poprawek.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }],
      history: [{ id: 'h4', text: 'Zlecenie oznaczone jako Done.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }],
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  events: [
    {
      id: 'e1',
      title: 'Weekly status call',
      date: new Date().toISOString(),
      clientId: 'c1',
      projectId: 'p1'
    },
    {
      id: 'e2',
      title: 'Przegląd SLA',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      clientId: 'c2',
      projectId: 'p2'
    }
  ],
  ui: {
    theme: 'light',
    reducedMotion: false
  }
};
