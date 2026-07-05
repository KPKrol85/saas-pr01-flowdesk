export const createTestContainer = () => {
  document.body.innerHTML = '<div id="test-root"></div>';
  return document.getElementById('test-root');
};

export const getButton = (name) => {
  const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent.trim() === name);
  if (!button) throw new Error(`Button not found: ${name}`);
  return button;
};

export const getText = (text) => {
  const node = Array.from(document.querySelectorAll('body *')).find((item) => item.textContent.trim() === text);
  if (!node) throw new Error(`Text not found: ${text}`);
  return node;
};

export const getControlByLabel = (labelText) => {
  const label = Array.from(document.querySelectorAll('label')).find((item) => item.textContent.trim() === labelText);
  if (!label?.htmlFor) throw new Error(`Label not found: ${labelText}`);
  const control = document.getElementById(label.htmlFor);
  if (!control) throw new Error(`Control not found for label: ${labelText}`);
  return control;
};

export const setControlValue = (labelText, value) => {
  const control = getControlByLabel(labelText);
  control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
  return control;
};
