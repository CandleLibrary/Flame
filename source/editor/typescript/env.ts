import { cfw } from "@candlelib/candle";
import * as $conflagrate from "@candlelib/conflagrate";
import * as $css from "@candlelib/css";
import * as $js from "@candlelib/js";
import $spark from "@candlelib/spark";
import URL from "@candlelib/url";
import wick from "@candlelib/wick";

/**
 * Common CandleLibrary libraries.
 * 
 * Pulled in from the global object. Libraries assigned to 
 * global object by @candlelib/candle utility library.
 */

//@ts-ignore
const
    url: typeof URL = cfw.url,
    glow = cfw.glow,
    css: typeof $css = cfw.css,
    js: typeof $js = cfw.js,
    conflagrate: typeof $conflagrate = cfw.conflagrate,
    spark: typeof $spark = cfw.spark;

export {
    spark,
    url,
    wick,
    glow,
    css,
    js,
    conflagrate
};
