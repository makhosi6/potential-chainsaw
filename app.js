const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const _search = express.Router();
const _error = express.Router();
/**
 * 
 */
const {
    minimal_args
} = require("./helpers/browser")
const {
    task,
    log
} = require("./jobs/search");
const PORT = process.env.PORT || 2020;

app.use(function (req, res, next) {
    console.log({
        METHOD: req.method
    })
    if (req.method === 'GET') {
        next()
    } else {
        res.status(405).json({
            status: 405,
            message: "Method Not Allowed",
            path: req.originalUrl
        })
    }

})

/**
 * Launch the browser 
 * @tutorial {@link Puppeteer} https://pptr.dev/#?product=Puppeteer&version=v13.0.1&show=api-class-browser
 *
 */
const launchTheBrowser = async () => await puppeteer.launch({
    headless: false,
    args: minimal_args,
    userDataDir: './data/user_dir'
})
Promise.resolve(launchTheBrowser()).then(function (browser) {
    _search.get("/:search", async function (req, res) {
        let search = req.query.search || req.params.search
        let url = req.protocol + '://' + req.get('host') + req.originalUrl;
        console.log("\x1b[43m%s\x1b[0m", url)
        task(browser, search).then(data => {
            // if (JSON.stringify({}) === JSON.stringify(data)) {
            if (log.length === 0) {
                res.send({
                    status: 500,
                    message: "Internal Server Error"
                })
            } else {
                res.send({
                    status: 200,
                    path: req.originalUrl,
                    "total": log.length,
                    current_page: 1,
                    next_page: null,
                    data
                });
            }
        })
    });
    _error.get('*', function (req, res) {
        res.status(404).json({
            status: 404,
            message: "Resource Not Found",
            path: req.originalUrl
        })
    });

    app.use('/api/v1/', [_search, _error]);
    app.listen(PORT, () => console.log("\x1b[42m%s\x1b[0m", `listening on http://localhost:${PORT}`));

})