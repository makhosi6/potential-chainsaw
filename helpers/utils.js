/**
 * Filter junk/bad characters in the provided string
 * @param {string} param
 * @returns {string}
 */
function excludeJunkChars(input) {
  let str = input;
  let junk = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "IPA(key):", ".", "quotations", "show ▼", "▼", "±", "[", "]"];
  let last = "";
  junk.map((j) => j !== last && (str = str.replace(j, "")));
  return str.replace(/(&nbsp;)*/g, "");
}
/**
 * Separate text/defination from examples.
 * @param {string} input
 * @returns {object}
 */
 function filterExamples(input) {
  try {
    // console.log(input.length, input);
    if (input.length > 0) {
      let a = input.replace("\n", "__45h4w__");
      let b = a.split("__45h4w__");
      let defination = b[0];
      let examples = b[1] ? b[1].split("\n") : [];
      return {
        defination,
        examples,
      };
    }
  } catch (error) {
    console.error(error);
  }
}
/**
 * Output a string or an array, depending on the input string
 * @param {string} input
 * @returns {string|array}
 */
 function isArray(input) {
  return input.includes("\n") ? input.split("\n") : input;
}


module.exports = { excludeJunkChars, filterExamples, isArray }  