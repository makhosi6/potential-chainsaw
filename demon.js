const puppeteer = require("puppeteer");
const stream = require('./jobs/stream')
const {minimal_args} = require("./helpers/browser")

let clients = [{
    regNum: "JNC683EC",
    imei: "354018119380768"
}]


const launch = async () => await puppeteer.launch({
    headless: false,
    // args: minimal_args,
    // executablePath: 'C:\Program Files\Google\Chrome\Application\chrome.exe',
    /**
     * just to avoid logging in between sessions
     */
    userDataDir: './data/user_dir'
})


Promise.resolve(launch()).then(function (browser) {
    console.log(browser.wsEndpoint());
    clients.map(client => {  
        console.log(client.imei)
        stream(browser, client)
            .then((msg) => {
                console.log(msg);
            })
            .catch((err) => console.log(err.message));
    })
})