export const validators = {
  required(value) {
    return value && value.trim().length > 0;
  },
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  minLength(value, min) {
    return value && value.trim().length >= min;
  }
};
