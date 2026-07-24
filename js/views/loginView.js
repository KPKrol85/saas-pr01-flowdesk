import { auth } from '../core/auth.js';
import { qs } from '../core/dom.js';
import { validators } from '../utils/validators.js';
import { button } from '../components/button.js';
import { inputField, setFieldError } from '../components/formControls.js';
import { showToast } from '../components/toast.js';

export const renderLoginView = (container) => {
  container.innerHTML = `
    <main class="login" id="main">
      <section class="login__product" aria-labelledby="loginProductTitle">
        <div class="login__product-grid" aria-hidden="true"></div>
        <div class="login__product-content">
          <div class="login__brand">
            <img class="login__logo" src="/assets/logo/logo.svg" alt="" width="48" height="48">
            <span class="login__brand-name">FlowDesk</span>
          </div>
          <div class="login__product-intro">
            <p class="login__eyebrow">Service Management Dashboard</p>
            <h1 class="login__product-title" id="loginProductTitle">Klienci, zlecenia i terminy pod kontrolą.</h1>
            <p class="login__product-desc">Jedna przestrzeń do prowadzenia codziennej pracy usługowej z czytelnym widokiem statusów i priorytetów.</p>
          </div>
          <ul class="login__capabilities" aria-label="Główne obszary FlowDesk">
            <li>Klienci i pełny kontekst współpracy</li>
            <li>Zlecenia ze statusami i terminami</li>
            <li>Dashboard oraz kalendarz działań</li>
          </ul>
          <p class="login__portfolio-note">Frontend-only portfolio demo. Dane działają lokalnie w tej przeglądarce.</p>
        </div>
        <p class="login__attribution">KP_Code Digital Studio</p>
      </section>

      <section class="login__auth" aria-labelledby="loginTitle">
        <div class="login__card">
          <div class="login__mobile-brand">
            <img class="login__logo" src="/assets/logo/logo.svg" alt="" width="36" height="36">
            <span class="login__brand-name">FlowDesk</span>
          </div>
          <p class="login__eyebrow">Przestrzeń demonstracyjna</p>
          <h2 class="login__title" id="loginTitle">Zaloguj się do FlowDesk</h2>
          <p class="login__desc">Użyj dowolnego poprawnego adresu email i hasła o długości co najmniej 6 znaków.</p>
          <p class="login__demo-note">To lokalna sesja demonstracyjna, a nie prawdziwe konto użytkownika.</p>
          <form id="loginForm" class="form-grid" novalidate>
            ${inputField({ id: 'email', label: 'Email', type: 'email', placeholder: 'anna@firma.pl', required: true, helper: 'Użyj formatu: imie@firma.pl', autocomplete: 'email' })}
            ${inputField({ id: 'password', label: 'Hasło', type: 'password', required: true, helper: 'Minimum 6 znaków.', autocomplete: 'current-password', minLength: 6 })}
            ${button({ label: 'Zaloguj', type: 'submit', variant: 'primary' })}
          </form>
        </div>
      </section>
    </main>
  `;
  const form = qs('#loginForm', container);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = data.get('email');
    const password = data.get('password');
    let valid = true;

    setFieldError('email', '', container);
    setFieldError('password', '', container);

    if (!validators.email(email)) {
      setFieldError('email', 'Podaj poprawny adres email.', container);
      valid = false;
    }
    if (!validators.minLength(password, 6)) {
      setFieldError('password', 'Hasło jest za krótkie.', container);
      valid = false;
    }

    if (!valid) return;

    auth.login({ email });
    showToast('Zalogowano pomyślnie.');
    window.location.hash = '#/dashboard';
  });
};
