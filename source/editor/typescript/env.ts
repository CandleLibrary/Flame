import * as $css from "@candlefw/css";
import * as $js from "@candlefw/js";
import * as $conflagrate from "@candlefw/conflagrate";
import { WickLibrary } from "@candlefw/wick";
import URL from "@candlefw/url";
import $spark from "@candlefw/spark";

/**
 * Common CandleFW libraries.
 * 
 * Pulled in from the global object. Libraries assigned to 
 * global object by @candlefw/cfw utility library.
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