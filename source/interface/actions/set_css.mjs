import * as css from "@candlefw/css";

import { CacheFactory } from "./cache";
import { getFirstPositionedAncestor, prepRebuild } from "./common";

export function SETCSSPROP(system, component, element, value_string) {

        // Get CSS information on element and update appropriate records
        let cache = CacheFactory(system, component, element);

        cache.setCSSProp(value_string)
                
        prepRebuild(element);    
}
