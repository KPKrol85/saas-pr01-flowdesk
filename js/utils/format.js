export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('pl-PL').format(value || 0);
};

export const capitalize = (text) => (text ? text[0].toUpperCase() + text.slice(1) : '');
