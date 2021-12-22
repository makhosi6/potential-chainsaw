const express = require("express");
const app = express();
const port = process.env.PORT || 2020;
const {minimal_args} = require("./helpers/browser")
const {
    task
} = require("./jobs/search");
const puppeteer = require("puppeteer");
/**
 *
 *
 */

const launchTheBrowser = async () => await puppeteer.launch({
    headless: false,
    args: minimal_args,
    userDataDir: './data/user_dir'
})
Promise.resolve(launchTheBrowser()).then(function (browser) {
    console.log({
        pptrWsURL: browser.wsEndpoint()
    });
    app.get("/api/v1/:search", async function (req, res) {
        let search = req.query.search || req.params.search
        let data = await task(browser, search );
        res.send({
            data
        });
    });
    app.listen(port, () => console.log(`listening on http://localhost:${port}`));

})