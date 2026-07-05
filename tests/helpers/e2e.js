export const resetBrowserState = async (page) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto('/');
};

export const loginDemoUser = async (page) => {
  await page.getByLabel('Email').fill('demo@flowdesk.pl');
  await page.getByLabel('Hasło').fill('secret123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
};
