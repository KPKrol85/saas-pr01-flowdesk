import { emptyState } from '../components/emptyState.js';
import { pageHeader } from '../components/pageHeader.js';

export const renderNotFoundView = (container) => {
  container.innerHTML = `
    <main id="main" class="container">
      ${pageHeader({
        title: 'Nie znaleziono widoku',
        description: 'Ten adres nie odpowiada żadnej trasie FlowDesk.',
        actions: '<a class="btn btn--primary" href="#/dashboard">Wróć do dashboardu</a>'
      })}
      <section class="card data-panel">
        ${emptyState({
          title: 'Sprawdź adres albo wróć do dashboardu',
          description: 'Dostępne widoki demo to dashboard, klienci, zlecenia, kalendarz i ustawienia.',
          iconName: 'dashboard'
        })}
      </section>
    </main>
  `;
};
