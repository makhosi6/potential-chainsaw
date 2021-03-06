//@ts-expect-error
const {
  excludeJunkChars,
  filterExamples,
  isArray,
  delay,
} = require("../helpers/utils");
/**
 * Keep track of properties of the data object
 * AND Monitor and keep track of error(s), So we can exit the loops
 */
let didCrush = false;

/**
 * 'var' statement declares a function-scoped or globally-scoped variable, so you will see 'var' in a number of place. DO PANIC!!
 * @param {puppeteer.Browser} browser
 * @param {string} search
 * @returns {object} data
 */
const task = async (browser, search) => {
  /**
   * wiktionary URL/URI
   */
  const URL = `https://en.wiktionary.org/wiki/${search.trim()}#English`;
  /**
   * Keep track of properties of the data object
   * AND Monitor and keep track of error(s), So we can exit the loops
   */
  var log = [];
  var audio = [];
  var href = [];
  let data = {};
  try {
    var start = new Date();
    var page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 768,
    });
    // await page.setRequestInterception(true);
    // page.on("request", (req) => {
    //   // console.table({url:req.url()});
    //   if (
    //     req.resourceType() == "stylesheet" ||
    //     req.resourceType() == "font" ||
    //     req.resourceType() ==
    //       "image" /** || req.resourceType() == "script" || req.resourceType() == "javascript"*/
    //   ) {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });
    page.on("response", (res) => {
      // console.table({
      //   fromCache: res.fromCache(),
      // url: res.url()
      // });
    });
    await page.goto(URL);
    /**await page.goto(`https://en.wiktionary.org/w/index.php?title=${search}`
, { waitUntil: "networkidle2", }*/
    await page.waitForSelector(".mw-headline");
    var hasLoaded = new Date();
    const h3 = await page.$$("h3");
    const h4 = await page.$$("h4");

    const heads = Array.from([...h3, ...h4]); //.filter((item) => item.id === "")
    /**
     * Monitor and keep track of error(s), So we can exit the loops
     *
     */
    let err = undefined;
    /**
     * Monitor and keep track of the index(s), So we can exit the loops
     */
    let lastIndex;
    // await page.waitForSelector("audio");
    // await page.evaluate(async () => {
    //   // use window.md5 to compute hashes
    //   const myString = "PUPPETEER";

    //   console.log(`${myString} USERAGENT  ${navigator.userAgent}`);
    // });

    var isAudio = await page.$(".mw-tmh-play");
    if (isAudio){ 
      await page.evaluate((el) => el.click(), isAudio);
      await delay()
    };

    for (let index = 0; index < heads.length; index++) {
      try {
        let element = heads[index];
        let nameEl = await page.evaluateHandle((el) => el.firstChild, element);
        let id = await page.evaluate((el) => el.id, nameEl);
        // console.log({
        //   id,
        // });
        let name;
        try {
          name = await id.toLowerCase();
        } catch (error) {
          name = "";
        }
        // console.log({
        //   name
        // });
        let headtext = await page.evaluate((text) => text.innerText, nameEl);
        // console.log({
        //   headtext
        // });
        let sub = await page.evaluateHandle(
          (el) => el.nextElementSibling,
          element
        );
        // console.log(typeof sub);
        let defs = await page.evaluateHandle(
          (el) => el.nextElementSibling,
          sub
        );
        let children;
        try {
          children = await defs.$$("ol > li");
          // console.log(children.length);
        } catch (error) {
          children = [];
        }

        let definitions = [];
        try {
          let defsID = await page.evaluate((text) => text.tagName, defs);
          if (defsID === "OL") {
            for (const li of children) {
              let links = await li.$$("a");
              Array.from(links).map(async (link) => {
                let tag = await page.evaluate(async (el) => el.innerText, link);
                let a = excludeJunkChars(tag);
                a.trim() && href.push(a);
              });
              let txt = await page.evaluate(async (el) => el.innerText, li);
              definitions.push(filterExamples(excludeJunkChars(txt)));
            }
          }
        } catch (error) {}
        let subtext =
          name === "pronunciation"
            ? await page.evaluate((el) => el.innerText, await page.$(".IPA"))
            : await page.evaluate((el) => el.innerText, sub);

        if (name !== "pronunciation") {
          let anchorTags = await page.evaluate((el) => {
            let links = el.querySelectorAll("a");
            console.log(links.length);
            //
            return [...Array.from(links).map((link) => link.innerText)];
          }, sub);

          anchorTags.map((link) => {
            let a = excludeJunkChars(link);
            a.trim() && href.push(link);
          });
        }

        if (isAudio) {
          try {
            const audio_en = await page.$("#mwe_player_0");

            const src = await audio_en.$$("source");
            Array.from(src).map(async (item) => {
              let str = await page.evaluate(
                (el) => el.dataset.src || el.src,
                item
              );
              audio.push(str);
            });
          } catch (err) {}
        }
        let exclude =
          name.includes("further_reading") ||
          name.includes("see_also") ||
          name.includes("declension") ||
          name.includes("descendants") ||
          name.includes("anagrams") ||
          name.includes("references") ||
          name.includes("quotations") ||
          name.includes("quotations") ||
          name.includes("mutation");
        if ((lastIndex === log.indexOf(headtext)) === -1) break;
        lastIndex = log.indexOf(headtext) === -1 ? true : false;
        if (!exclude && log.indexOf(headtext) === -1) {
          try {
            log.push(headtext.trim());
          } catch (error) {}
          var subText = isArray(excludeJunkChars(subtext));

          // console.log(subText+"|"+name+"|"+headtext );
          if (!subText.includes("Nounedit") && name &&  headtext) {
         
        data = {
              ...data,
              [name]: {
                headtext: excludeJunkChars(headtext),
                subtext: subText,
                definitions,
              },
            };
          }
        }
      } catch (error) {
        console.log(error);
        // if (err === error.message && err !== undefined) break
        // err = error.name;
        err = error.message;
      }
    }
  } catch (error) {
    console.log(error);
    didCrush = true;
    throw new Error("Internal Server Error");
  } finally {
    page.close();
    var end = new Date();
    console.log({
      searchTerm: search,
      start,
      end,
      didCrush,
      hasLoaded,
      timeElapsed: (end - start) / 1000,
    });
  }
  return {
    total: log.length + 2,
    data: {
      audio,
      href,
      ...data,
    },
  };
  ////
};
module.exports = {
  task,
  didCrush,
};
