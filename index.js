import puppeteer from 'puppeteer';
import secret from './secret.js';

const colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};

const runBot = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        args: [`--window-size=800,800`],
      });
      const page = await browser.newPage();
    
      await page.goto('https://citas.sre.gob.mx/', { waitUntil: 'load' });

      console.log(colours.bg.blue, colours.fg.white, "Iniciando...", colours.reset) ; 

    
    // Dialog handlers
        const territoryDialogAction = async () => {
            const dialogBtn = await page.$$('.modal-body button', button => button,  { delay: 1000 })
            const aHandle = await dialogBtn[1].evaluateHandle(() => document.body)
            const resultHandle = await dialogBtn[1].evaluateHandle(body => body.innerHTML, aHandle)
            const btnValue = await resultHandle.jsonValue() 
    
    
            if (btnValue.includes("Consulares")){
               await dialogBtn[1].click()
               return  setTimeout(() => {
                                login()
                        }, 10000)
            }
    
            console.log("Error buscando la opcion de oficina consular, cerrando");
            return await browser.close()
    
        }
    
        const closeOfficeDialog = async () => {
            await page.waitForNavigation()
            const modalClose = await page.$$('div.form-group a span svg', modal => modal)
            setTimeout(async () => {
                await modalClose[0].click()
                checkForAppointment()
            }, 7000)
        }
    
    // Steps for the flow
        const login = async () => {
            console.log("Iniciando sesion...")
            // Filling form fields
            const inputs = await page.$$('.form-control', inputs => inputs)
            await inputs[0].type(secret.email)
            await inputs[1].type(secret.password)
    
            // Marking terms and services as read
            const checkbox = await page.$$('.form-group .col-sm-12 .checkbox input', checkbox => checkbox)
            await checkbox[0].click()
    
            const modalClose = await page.$$('div .modal-body a span svg', modal => modal)
            await modalClose[0].click()
    
            // loging
            const buttons = await page.$$('button', btn => btn)
    
            const aHandle = await buttons[3].evaluateHandle(() => document.body)
            const resultHandle = await buttons[3].evaluateHandle(body => body.innerHTML, aHandle)
            const btnValue = await resultHandle.jsonValue() 
    
    
            if (btnValue.includes("Ingresar")){
                await buttons[3].click()
                console.log("Sesion iniciada")
                return schedule()
            }
    
            console.log("Error iniciando sesion");
            return await browser.close()
    
        }
    
        const schedule = async () => {
            await page.waitForNavigation()
            setTimeout(async () => {
                await page.click('a.btn-primary')
                closeOfficeDialog()
            }, 5000)
        }
    
        const checkForAppointment = async () => {
            console.log("Validando si existe el tramite...")
            await page.click('a.thickTwoInfo')
            const options = await page.$$('div.modal-body li', options => options)
            if (options.length !== 2){
                for(let i = 0; i < 20; i++ ) {
                    console.log(colours.bg.yellow, colours.fg.crimson, "YA ESTA LA OPCION", colours.reset) ; 
                    console.log(options)
                } 
            } else {
                console.log(colours.bg.green, colours.fg.white, "Volviendo a intentar en 27 minutos", colours.reset) ; 
                console.log(options)
                setTimeout(async () => {
                    await browser.close();
                    runBot();
                }, 1600000)
            }
        }
    
        // Wait for the territory dialog and click the appropiate action to begin the flow
        page.waitForSelector('.modal-body').then(() =>{ 
            console.log("Aceptando la opcion de territorio...")
            territoryDialogAction()
        })
}

runBot();
