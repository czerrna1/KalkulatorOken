// tests/windowCalculator.spec.js
const { test, expect } = require('@playwright/test');

// helper funkce pro zavření elementu, pokud je viditelný
async function closeIfVisible(locator) {
  if (await locator.isVisible()) {
    await locator.click();
    await locator.waitFor({ state: 'hidden' });
  }

}
/**
 * Kliknutí na tlačítko přes CSS selektor
 * @param {import('@playwright/test').Page} page - Playwright page objekt
 * @param {string} selector - CSS selektor tlačítka
 */
async function clickBySelector(page, selector) {
  const button = page.locator(selector);
  await button.waitFor({ state: 'visible' });
  await button.scrollIntoViewIfNeeded();
  await button.click();
}

/**
 * Kliknutí na tlačítko přes XPath
 * @param {import('@playwright/test').Page} page - Playwright page objekt
 * @param {string} xpath - XPath tlačítka
 */
async function clickByXPath(page, xpath) {
  const button = page.locator(xpath);
  await button.waitFor({ state: 'visible' });
  await button.scrollIntoViewIfNeeded();
  await button.click();
}

/**
 * Klikne na tlačítko a počká, až zmizí loader
 * @param {import('@playwright/test').Page} page
 * @param {string} buttonSelector
 * @param {string} loaderSelector
 */
async function clickAndWaitForLoader(page, buttonSelector, loaderSelector = '.loading-spinner') {
  const button = page.locator(buttonSelector);
  const loader = page.locator(loaderSelector);

  await button.waitFor({ state: 'visible' });
  await button.scrollIntoViewIfNeeded();
  await button.click();

  // Počkej, až loader zmizí (pokud existuje)
  if (await loader.count() > 0) {
    await loader.waitFor({ state: 'hidden', timeout: 20000 });
  }
}

/**
 * Odeslání formuláře a ověření úspěchu.
 * @param {import('@playwright/test').Page} page - Playwright page objekt
 * @param {string} buttonSelector - CSS nebo XPath tlačítka pro odeslání
 * @param {string} successText - Text, který se má objevit při úspěchu
 * @param {string} loaderSelector - Selektor loaderu (pokud stránka používá AJAX)
 */
async function submitAndVerify(page, buttonSelector, successText, loaderSelector = '.loading-spinner') {
  const submitBtn = page.locator(buttonSelector);
  const successMessage = page.locator(`text=${successText}`);
  const loader = page.locator(loaderSelector);

  // počkej, až je tlačítko viditelné
  await submitBtn.waitFor({ state: 'visible' });
  
  // scrolluj k tlačítku
  await submitBtn.scrollIntoViewIfNeeded();

  // klikni na tlačítko
  await submitBtn.click();

  // počkej, až loader zmizí (timeout 20 s)
  await loader.waitFor({ state: 'hidden', timeout: 20000 });

  // ověř, že se zobrazil úspěšný text
  await expect(successMessage).toBeVisible();
}

test('kalkulačka oken - základní výpočet', async ({ page }) => {
  // 1️⃣ Otevřít stránku kalkulačky
  await page.goto('https://kalkulace.oknapresinternet.cz/');

  // zavřít cookie banner
  const consentButton = page.locator('a[data-role="b_agree"]');
  await closeIfVisible(consentButton);

  // zavřít welcome modal
  const welcomeDialog = page.locator('#welcome-dialog');
  await page.waitForSelector('#welcome-dialog', { state: 'visible', timeout: 5000 });
  const closeModalButton = page.locator('.close-modal');
  await closeIfVisible(closeModalButton);

  // ověření, že modal zmizel
  await expect(welcomeDialog).toBeHidden();

    // 3️⃣ Kliknout na IGLO EDGE
  await page.waitForSelector('#system52', { state: 'visible' });
  await page.click('#system52 span[onclick*="changeSystem(52"]');
  // 4️⃣ Počkat, až se objeví typy okna
  await page.waitForSelector('.type-image-preview', { state: 'visible' });

  // 5️⃣ Kliknout na konkrétní typ okna podle obrázku
  await page.click('.type-image-preview[style*="/dist/img/type/1.png"]');

// 6️⃣ Počkat, až se objeví pole pro šířku a výšku
await page.waitForSelector('input[name="1_width"]', { state: 'visible' });
await page.waitForSelector('input[name="1_height"]', { state: 'visible' });

// 7️⃣ Vyplnit rozměry
await page.fill('input[name="1_width"]', '120');   // šířka 120 cm
await page.fill('input[name="1_height"]', '150');  // výška 150 cm

  // 8️⃣ Kliknout na button "postup na krok → 3. Barva"
// Locator pomocí XPath
await clickByXPath(page, '//*[@id="snippet--prevAndNextStep"]/div[3]/a/button');

//volba barvy okna ořech
await page.waitForSelector('.color-circle.hover-image[data-image="/dist/img/color/medium/orzech.jpg"]', { state: 'visible' });
await page.click('.color-circle.hover-image[data-image="/dist/img/color/medium/orzech.jpg"]');


// 12️⃣ Kliknout na button "postup na krok → 4. Sklo"
await clickBySelector(page, '#snippet--prevAndNextStep div:nth-child(3) > a > button');

// Locator pro tlačítko "Trojskla" pomocí XPath
const tripleGlassButton = page.locator('//*[@id="snippet--glassCategories-a"]/div/div/span[2]/a/span/img');

// Počkej, až bude tlačítko viditelné
await tripleGlassButton.waitFor({ state: 'visible' });

// Klikni na tlačítko
await tripleGlassButton.click();

// 12️⃣ Kliknout na button "postup na krok → 5. Parapety"
await clickBySelector(page, '#snippet--prevAndNextStep div:nth-child(3) > a > button');


// 🧱 KROK: Volba šířky/hloubky vnitřního parapetu
const depthSelect = page.locator('//*[@id="window_inner-parapet-depth"]');
await depthSelect.selectOption('200');

// 🧱 KROK: Zadání délky parapetu
const lengthInput = page.locator('//*[@id="window_inner-parapet-length"]');
await lengthInput.fill('1050');

// 🧱 KROK: Výběr materiálu PVC PLAST COMFORT
const materialPVC = page.locator('//*[@id="parapet-window_inner"]/div[2]/div/div[2]/div/div/div[2]/span[1]/a/img');
await materialPVC.scrollIntoViewIfNeeded();
await materialPVC.click();
await materialPVC.click();

// 🧱 KROK: Výběr barvy BÍLÁ

// Lepší je kliknout na rodičovský <a>, ne na <img>
const colorWhiteLink = page.locator('//*[@id="snippet--tabs-colors-zakladni"]/span[1]/a');

// Kliknutí s force: true pro případ overlaye
await colorWhiteLink.click({ force: true });
await colorWhiteLink.click({ force: true });

// 🧱 KROK: Volba HLUBKY vnějšího parapetu
const outerDepthSelect = page.locator('//*[@id="window_outer-parapet-depth"]');
await outerDepthSelect.selectOption('300'); // vybere hodnotu 300

// 🧱 KROK: Volba DÉLKY vnějšího parapetu
const outerLengthInput = page.locator('//*[@id="window_outer-parapet-length"]');
await outerLengthInput.fill('1100'); // vyplní hodnotu 1100

// 🧱 KROK: Výběr MATERIÁLU – pozink
const materialPozink = page.locator('//*[@id="parapet-window_outer"]/div[2]/div/div[2]/div/div/div[2]/span[1]/a/img');
await materialPozink.scrollIntoViewIfNeeded();
await materialPozink.click();
await materialPozink.click();

// 🧱 KROK: Výběr BARVY – bílá (vnější parapet)
const colorWhiteOuterLink = page.locator('//*[@id="snippet--tabs-colors-all"]/span[1]/a');

// Kliknutí s force: true (pro případ overlay/animace)
await colorWhiteOuterLink.click({ force: true });
await colorWhiteOuterLink.click({ force: true });


// 12️⃣ Kliknout na button "postup na krok → 6. stínící"
await clickBySelector(page, '#snippet--prevAndNextStep div:nth-child(3) > a > button');

//zvol bvenkovní žaluzie
await page.click('img[src="/dist/img/shielding/venkovni-zaluzie.png"]');

//typ montaže zvolím nadokenní
await page.click('img[src="/dist/img/shielding/venkovni-zaluzie/typ/thumb/zs.jpg"]');

//zvol barvu stříbrnou
await page.click('img[src="/dist/img/shielding/venkovni-zaluzie/barva-vodicich-list-zs/thumb/ral_9006_stribrna-vlzs.jpg"]');

//zvolím barvu vodích lišt bílou
await page.click('img[src="/dist/img/shielding/venkovni-zaluzie/barva-vnitrni-listy-spoj/thumb/ral_9016_bila-vls.jpg"]');

//zvolím barvu lamel stříbrnou
await page.click('img[src="/dist/img/shielding/venkovni-zaluzie/barva-lamel/thumb/ral_9006_stribrna-bl.jpg"]');

//zvolím ukončovací lištu lamel barvu
await page.click('img[src="/dist/img/shielding/venkovni-zaluzie/spodni-ukoncovaci-lista-lamel/thumb/ral_9006_stribrna-sull.jpg"]');

// Kliknutí na „POTVRDIT VÝBĚR“
await page.getByRole('button', { name: 'POTVRDIT VÝBĚR' }).click();

// Kliknutí na „postup na krok → 7. Sítě“
await page.getByRole('button', { name: /postup na krok.*7\. Sítě/i }).click();

// 12️⃣ Kliknout na button "postup na krok → 8. montáž"
await clickBySelector(page, '#snippet--prevAndNextStep div:nth-child(3) > a > button');

// 12️⃣ Kliknout na button "postup na krok → 9. závěr"
await clickBySelector(page, '#snippet--prevAndNextStep div:nth-child(3) > a > button');

//nezávazná kalkulace-konec
const button = page.locator('//*[@id="snippet--finish"]/div[2]/div/div[1]/div/span[2]/button');

// Poscrolluje na tlačítko, pokud je mimo viewport
await button.scrollIntoViewIfNeeded();

// Klikne na tlačítko
await button.click();

//zadám psč
// Najde input podle id
const pscInput = page.locator('#psc');
await pscInput.waitFor({ state: 'visible' });
await pscInput.fill('73961');

// Kliknutí vedle pro vyvolání onblur / AJAX
await page.locator('body').click({ position: { x: 0, y: 0 } }); // klikne někde do prázdného prostoru

// Čekání na případné dokončení AJAX volání (volitelně)
await page.waitForTimeout(500); // nebo použít waitForResponse, pokud znáš URL

// Vytvoření cenové nabídky
await test.step('🧱 KROK: Kliknutí na tlačítko „Vytvořit cenovou nabídku“', async () => {
  const vytvorCenovouNabidkuBtn = page.getByRole('button', { name: /vytvořit cenovou nabídku/i });
  await vytvorCenovouNabidkuBtn.waitFor({ state: 'visible' });
  await vytvorCenovouNabidkuBtn.scrollIntoViewIfNeeded(); // pro jistotu scroll
  await vytvorCenovouNabidkuBtn.click();
});

// 🧱 KROK: Vyplnění jména
await test.step('Vyplnění jména', async () => {
  const firstNameInput = page.locator('#frm-productList-sendOfferForm-billingFirstname');
  await firstNameInput.waitFor({ state: 'visible' });
  await firstNameInput.fill('Adam');
});

// 🧱 KROK: Vyplnění příjmení
await test.step('Vyplnění příjmení', async () => {
  const surnameInput = page.locator('#frm-productList-sendOfferForm-billingSurname');
  await surnameInput.waitFor({ state: 'visible' });
  await surnameInput.fill('Czernek');
});

// 🧱 KROK: Vyplnění emailu
await test.step('Vyplnění emailu', async () => {
  const emailInput = page.locator('#frm-productList-sendOfferForm-billingEmail');
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.fill('czernekadam@centrum.cz');
});



});