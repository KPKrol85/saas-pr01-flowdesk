import { auth } from '../core/auth.js';
import { qs } from '../core/dom.js';
import { validators } from '../utils/validators.js';
import { button } from '../components/button.js';
import { inputField, setFieldError } from '../components/formControls.js';
import { showToast } from '../components/toast.js';

export const renderLoginView = (container) => {
  container.innerHTML = `
    <main class="login" id="main">
      <div class="login__card">
        <h1 class="login__title">Zaloguj się do FlowDesk</h1>
        <p class="login__desc">FlowDesk pokazuje panel pracy dla zespołu usługowego. Wpisz dowolny firmowy email i hasło demo, aby przejść do przykładowej przestrzeni.</p>
        <form id="loginForm" class="form-grid" novalidate>
          ${inputField({ id: 'email', label: 'Email', type: 'email', placeholder: 'anna@firma.pl', required: true, helper: 'Użyj formatu: imie@firma.pl', autocomplete: 'email' })}
          ${inputField({ id: 'password', label: 'Hasło', type: 'password', required: true, helper: 'Minimum 6 znaków.', autocomplete: 'current-password', minLength: 6 })}
          ${button({ label: 'Zaloguj', type: 'submit', variant: 'primary' })}
        </form>
      </div>
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
