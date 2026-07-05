import { escapeHTML } from '../utils/sanitize.js';

export const renderTable = ({ headers, rows }) => {
  return `
    <table class="table">
      <thead>
        <tr>
          ${headers.map((header) => `<th>${escapeHTML(header)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
};
