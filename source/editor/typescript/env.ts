import * as c from "@candlefw/css";

/**
 * Common CandleFW libraries.
 * 
 * Pulled in from the global object. Libraries assigned to 
 * global object by @candlefw/cfw library.
 */

//@ts-ignore
const url = cfw.url, wick = cfw.wick, glow = cfw.glow, css: typeof c = cfw.css, js = cfw.js, conflagrate = cfw.conflagrate;

export {
    url,
    wick,
    glow,
    css,
    js,
    conflagrate
};