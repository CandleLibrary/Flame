import { css } from "../env.js";

import { CSSCacheFactory } from "../cache/css_cache.js";
import { getFirstPositionedAncestor, prepRebuild } from "./common.js";

export function SETCSSPROP(system, component, element, value_string) {

        // Get CSS information on element and update appropriate records
        let cache = CSSCacheFactory(system, component, element);

        cache.setPropFromString(value_string);

        prepRebuild(element);
}
