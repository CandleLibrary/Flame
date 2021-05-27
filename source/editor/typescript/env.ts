import * as $css from "@candlelib/css";
import * as $js from "@candlelib/js";
import * as $conflagrate from "@candlelib/conflagrate";
import { WickLibrary } from "@candlelib/wick";
import URL from "@candlelib/url";
import $spark from "@candlelib/spark";

/**
 * Common CandleFW libraries.
 * 
 * Pulled in from the global object. Libraries assigned to 
 * global object by @candlelib/cfw utility library.
 */

//@ts-ignore
const url: typeof URL = cfw.url, wick: WickLibrary = cfw.wick, glow = cfw.glow, css: typeof $css = cfw.css, js: typeof $js = cfw.js, conflagrate: typeof $conflagrate = cfw.conflagrate, spark: typeof $spark = cfw.spark;

export {
    spark,
    url,
    wick,
    glow,
    css,
    js,
    conflagrate
};