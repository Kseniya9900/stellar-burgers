import { expect, test, Page } from '@playwright/test';
import { ingredients, ingredientsResponse } from './fixtures/ingredients';

const API = '**/api';
const ORDER_NUMBER = 12345;

const bun = ingredients[0];
const main = ingredients[1];
const sauce = ingredients[2];

async function mockIngredients(page: Page) {
  await page.routeFromHAR('tests/hars/ingredients.har', {
    url: '**/api/ingredients',
    update: false
  });

  await page.route('**/api/ingredients', async (route) => {
    await route.fulfill({ json: ingredientsResponse });
  });
}

async function openConstructor(page: Page) {
  await mockIngredients(page);
  await page.goto('/');
  await expect(page.getByText('Соберите бургер')).toBeVisible();
  await expect(page.getByText(bun.name).first()).toBeVisible();
}

async function addIngredient(page: Page, ingredientName: string) {
  await page
    .locator('li', { hasText: ingredientName })
    .getByRole('button', { name: 'Добавить' })
    .click();
}

test.describe('страница конструктора бургера', () => {
  test('добавляет булку и начинку в конструктор', async ({ page }) => {
    await openConstructor(page);

    await addIngredient(page, bun.name);
    await addIngredient(page, main.name);

    await expect(page.getByText(`${bun.name} (верх)`)).toBeVisible();
    await expect(page.getByText(`${bun.name} (низ)`)).toBeVisible();
    await expect(page.getByText(main.name).last()).toBeVisible();
  });

  test('открывает модальное окно с данными выбранного ингредиента и закрывает его по крестику', async ({
    page
  }) => {
    await openConstructor(page);

    await page.getByText(bun.name).first().click();

    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await expect(page.getByText(bun.name).last()).toBeVisible();
    await expect(page.getByText('Калории, ккал')).toBeVisible();

    await page.getByTestId('modal-close').click();
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('закрывает модальное окно ингредиента по оверлею', async ({ page }) => {
    await openConstructor(page);

    await page.getByText(sauce.name).first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await expect(page.getByText(sauce.name).last()).toBeVisible();

    await page
      .getByTestId('modal-overlay')
      .click({ position: { x: 10, y: 10 } });

    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('создаёт заказ, показывает номер, очищает конструктор и закрывает модалку', async ({
    page,
    context
  }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        url: 'http://localhost:4000'
      }
    ]);

    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await mockIngredients(page);

    await page.route(`${API}/auth/user`, async (route) => {
      await route.fulfill({
        json: {
          success: true,
          user: { email: 'test@example.com', name: 'Test User' }
        }
      });
    });

    await page.route(`${API}/orders`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({
        json: {
          success: true,
          name: 'Краторный био-бургер',
          order: {
            _id: 'order-id',
            status: 'done',
            name: 'Краторный био-бургер',
            owner: {
              name: 'Test User',
              email: 'test@example.com',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z'
            },
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            number: ORDER_NUMBER,
            price: 2934
          }
        }
      });
    });

    await page.goto('/');
    await expect(page.getByText(bun.name).first()).toBeVisible();

    await addIngredient(page, bun.name);
    await addIngredient(page, main.name);

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page.getByText(String(ORDER_NUMBER))).toBeVisible();
    await expect(page.getByText('идентификатор заказа')).toBeVisible();
    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await page.getByTestId('modal-close').click();
    await expect(page.getByText(String(ORDER_NUMBER))).not.toBeVisible();
  });
});
