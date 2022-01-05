
/**
 * @summary Stream
 * @param {Browser} browser 
 * @param {object} client 
 * @property {string} client.regNum
 * @property {string} client.imei
 */
const task = async (browser,client) => { 
    
    let port = "5432"
    // const 
    let URL = `http://localhost:${port}/#/live/${client.imei}`;
    URL = "https://app.quickloc8.co.za/#/live/" + client.imei
console.log({URL});
    var page = await browser.newPage();
    await page.goto(URL,{
        waitUntil: "networkidle2",
    });
    await page.waitForSelector("video");
    const video = await page.$("video");
    await page.waitForTimeout(3000)
    await page.evaluate(async (el) => el.play(), video)

    return {
        client, URL, port
    }
}


module.exports = task;