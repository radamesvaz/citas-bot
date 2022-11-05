import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: [`--window-size=800,800`],
  });
  const page = await browser.newPage();

  await page.goto('https://citas.sre.gob.mx/');

  // Type into search box.
//   await page.type('.devsite-search-field', 'Headless Chrome');

//   // Wait for suggest overlay to appear and click "show all results".
//   const allResultsSelector = '.devsite-suggest-all-results';
//   await page.waitForSelector(allResultsSelector);
//   await page.click(allResultsSelector);

//   // Wait for the results page to load and display the results.
//   const resultsSelector = '.gsc-results .gs-title';
//   await page.waitForSelector(resultsSelector);

//   // Extract the results from the page.
//   const links = await page.evaluate(resultsSelector => {
//     return [...document.querySelectorAll(resultsSelector)].map(anchor => {
//       const title = anchor.textContent.split('|')[0].trim();
//       return `${title} - ${anchor.href}`;
//     });
//   }, resultsSelector);

    const territoryDialogAction = async () => {
        const dialogBtn = await page.$$('.modal-body button', button => button.innerHTML,  { delay: 1000 })
        const aHandle = await dialogBtn[1].evaluateHandle(() => document.body)
        const resultHandle = await dialogBtn[1].evaluateHandle(body => body.innerHTML, aHandle)
        const btnValue = await resultHandle.jsonValue() 


        if (btnValue.includes("Consulares")){
           return await dialogBtn[1].click()
        }

        console.log("Error buscando la opcion de oficina consular, cerrando");
        return await browser.close()

    }

    // Wait for the territory dialog and click the appropiate action
    page.waitForSelector('.modal-body').then(() =>{ 
        console.log("Aceptando la opcion de territorio...")
        territoryDialogAction()


    })

})();