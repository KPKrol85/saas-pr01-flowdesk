import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

export const expectNoA11yViolations = async (page) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
};
