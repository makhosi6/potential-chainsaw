// const browser = require("../helpers/browser");
/**
 * Keep track of properties of the data object 
 * AND Monitor and keep track of error(s), So we can exit the loops
 */
 let log = []

/**
 * 'var' statement declares a function-scoped or globally-scoped variable, so you will see 'var' in a number of place. DO PANIC!!
 * @param {puppeteer.Browser} browser 
 * @param {string} search 
 * @returns {object} data
 */
const task = async (browser, search) => {
  let data = {}
  try {

    var start = new Date()
    var page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() == "stylesheet" || req.resourceType() == "font" || req.resourceType() == "image" /** || req.resourceType() == "script"*/ || req.resourceType() == "javascript") {
        req.abort();
      } else {
        req.continue();
      }
    });
    // await page.goto(`https://en.wiktionary.org/wiki/${search}`
    await page.goto(`https://en.wiktionary.org/w/index.php?title=${search}`
      /** , { waitUntil: "networkidle2", }*/
    );
    await page.waitForSelector(".mw-headline");
    var hasLoaded = new Date()
    const allHeads = await page.$$("h3");
    const heads = Array.from(allHeads); //.filter((item) => item.id === "")
    /**
     * Monitor and keep track of error(s), So we can exit the loops
     * 
     */
    let err = undefined
    /**
     * Monitor and keep track of the index(s), So we can exit the loops
     */
    let lastIndex;
    /**
     * Filter junk/bad characters in the provided string
     * @param {string} param 
     * @returns {string}
     */
    function excludeJunkChars(param) {
      let str = param;
      let junk = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "IPA(key):", '.', "quotations", "[", "]"];
      let last = ''
      junk.map((j) => (j !== last) && (str = str.replace(j, "")));
      return str.replace(/(&nbsp;)*/g, "");
    }

    for (let index = 0; index < heads.length; index++) {
      console.log(index);
      try {
        let element = heads[index];
        let nameEl = await page.evaluateHandle((el) => el.firstChild, element);
        let id = await page.evaluate((el) => el.id, nameEl);
        let name = await id.toLowerCase();
        let headtext = await page.evaluate((text) => text.innerText, nameEl);

        let sub = await page.evaluateHandle(
          (el) => el.nextElementSibling,
          element);
        let defs = await page.evaluateHandle(
          (el) => el.nextElementSibling,
          sub
        );
        let children = await defs.$$('ol > li')
        let definations = []
        let defsID = await page.evaluate((text) => text.tagName, defs);
        if (defsID === "OL") {
          for (const li of children) {
            let txt = await page.evaluate(async (el) => el.innerText, li)
            definations.push(excludeJunkChars(txt))
          }
        }
        let subtext = name === "pronunciation" ?
          await page.evaluate((el) => el.innerText, await page.$(".IPA")) :
          await page.evaluate((el) => el.innerText, sub);
        let exclude = name.includes("further_reading") || name.includes("see_also") || name.includes("anagrams") || name.includes("references");

        if (lastIndex === log.indexOf(headtext) === -1) break
        lastIndex = (log.indexOf(headtext) === -1) ? true : false;
        if (!exclude && log.indexOf(headtext) === -1) {
          log.push(headtext.trim());
        
          data = {
            ...data,
            [name]: {
              headtext: excludeJunkChars(headtext),
              subtext: excludeJunkChars(subtext),
              definations
            }
          }

        }
      } catch (error) {
        if (err === error.message && err !== undefined) break
        err = error.message;
        console.log({
          ERROR_IS: error.message,
          NAMED: error.name,
        });
      }
    }

  } catch (error) {
    console.error({
      ERROR: error
    })
  } finally {
    page.close()
    var end = new Date()
    console.log({
      start,
      end,
      hasLoaded,
      timeElapsed: (end - start) / 1000
    });
  }
  return data;
  ////
}
module.exports = {
  task, log
}