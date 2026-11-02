// PRUEBAS E2E — autenticación y control de acceso (navegador real contra el sistema encendido)
import { test, expect, Page } from '@playwright/test';

const ADMIN  = { email: 'admin@opticaconviccion.mx',  password: 'Admin2026!' };
const EDITOR = { email: 'editor@opticaconviccion.mx', password: 'Editor2026!' };

async function iniciarSesion(page: Page, u: { email: string; password: string }) {
  await page.goto('/login');
  await page.fill('input[type=email]', u.email);
  await page.fill('input[type=password]', u.password);
  await page.click('button[type=submit]');
}

// Navega dentro de la app SIN recargar la página (así se conserva la sesión en memoria).
async function irA(page: Page, ruta: string) {
  await page.evaluate((r) => {
    history.pushState({}, '', r);
    dispatchEvent(new PopStateEvent('popstate'));
  }, ruta);
}

test('E2E-01 el administrador inicia sesión y accede a Gestión de usuarios', async ({ page }) => {
  await iniciarSesion(page, ADMIN);
  await expect(page).toHaveURL(/\/perfil$/);

  await page.getByRole('navigation').getByRole('link', { name: 'Gestión de usuarios' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Gestión de usuarios' })).toBeVisible();
  // el listado viene de la API y la base de datos reales
  await expect(page.getByText(EDITOR.email)).toBeVisible();
});

test('E2E-02 un usuario con rol Editor no puede entrar a Gestión de usuarios', async ({ page }) => {
  await iniciarSesion(page, EDITOR);
  await expect(page).toHaveURL(/\/perfil$/);

  // Si intenta entrar a la ruta del administrador, el sistema lo bloquea.
  await irA(page, '/admin');
  await expect(page).toHaveURL(/\/acceso-denegado$/);
  await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible();
});

test('E2E-03 credenciales incorrectas muestran el error y no inician sesión', async ({ page }) => {
  await iniciarSesion(page, { email: ADMIN.email, password: 'contraseña-incorrecta' });
  await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('oc_auth_token'))).toBeNull();
});

// DEFECTO D1 (corregido): al recargar la página (F5) en una ruta protegida se perdía la sesión
// porque el guard se evaluaba antes de que terminara de restaurarse. Ahora el guard espera a AuthService.listo.
test('E2E-04 recargar la página en el panel conserva la sesión', async ({ page }) => {
  await iniciarSesion(page, ADMIN);
  await page.getByRole('navigation').getByRole('link', { name: 'Gestión de usuarios' }).click();
  await page.reload();
  await expect(page).toHaveURL(/\/admin$/);
});

// DEFECTO D2 (corregido): el menú lateral le mostraba "Gestión de usuarios" al Editor porque el
// estilo .nav-item (display:flex) anulaba el atributo [hidden]. El acceso estaba bloqueado (E2E-02).
test('E2E-05 el menú del Editor no muestra la opción Gestión de usuarios', async ({ page }) => {
  await iniciarSesion(page, EDITOR);
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Gestión de usuarios' })).toBeHidden();
});

// DEFECTO D7 (corregido): el selector de rol mostraba "Administrador" a los Editores porque el
// valor se asignaba antes de que existieran las opciones.
test('E2E-06 Gestión de usuarios muestra el rol real de cada usuario', async ({ page }) => {
  await iniciarSesion(page, ADMIN);
  await page.getByRole('navigation').getByRole('link', { name: 'Gestión de usuarios' }).click();
  const fila = page.getByRole('row', { name: new RegExp(EDITOR.email) });
  await expect(fila.getByRole('combobox')).toHaveValue('Editor');
  await page.screenshot({ path: 'evidencias/despues_D7_roles_correctos.png' });
});

// PROMOCIONES: el Editor crea una promoción vigente todo el año y el sitio público la muestra
// (viene de la base de datos). Al final la elimina para no dejar basura.
test('E2E-07 el Editor crea una promoción y aparece en el sitio; al eliminarla desaparece', async ({ page }) => {
  const nombre = `Promo E2E ${Date.now()}`;
  await iniciarSesion(page, EDITOR);
  await page.getByRole('navigation').getByRole('link', { name: 'Promociones' }).click();
  await expect(page).toHaveURL(/\/editor\/promociones$/);
  await expect(page.getByRole('heading', { name: 'Promociones' })).toBeVisible();

  await page.getByRole('button', { name: '+ Nueva promoción' }).click();
  await page.fill('input[name=nombre]', nombre);
  await page.fill('input[name=descuento]', '99% OFF');
  await page.selectOption('select[name=mf]', { label: 'diciembre' });
  await page.selectOption('select[name=df]', { label: '31' });
  await page.getByRole('button', { name: 'Guardar' }).click();
  const fila = page.getByRole('row', { name: new RegExp(nombre) });
  await expect(fila).toBeVisible();
  await expect(fila.getByText('Vigente hoy')).toBeVisible();
  await page.screenshot({ path: 'evidencias/promociones_panel.png' });

  // sitio público (sin sesión): el banner trae la promoción de la BD
  const publico = await page.context().browser()!.newPage({ baseURL: 'http://localhost:4200' });
  await publico.goto('/');
  await expect(publico.locator('.promo-banner-oc .promo-ribbon-label', { hasText: nombre })).toBeVisible();
  await publico.screenshot({ path: 'evidencias/promociones_sitio.png' });

  page.once('dialog', d => d.accept());
  await fila.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByRole('row', { name: new RegExp(nombre) })).toHaveCount(0);
  await publico.reload();
  await expect(publico.locator('.promo-banner-oc .promo-ribbon-label', { hasText: nombre })).toHaveCount(0);
  await publico.close();
});
