import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { ComponentData, loadComponentsFromDirectory, Context } from "@candlelib/wick";
import {
    Components,
    EndPoints,
    PageComponents
} from "@candlelib/wick/build/types/entry-point/wick-server";


const logger = Logger.createLogger("Flame");

export const store: {
    components: Components;
    endpoints: EndPoints;
    page_components: PageComponents;
    updated_components: Map<string, ComponentData>;
} = {
    components: null,
    endpoints: null,
    page_components: null,
    updated_components: new Map
};


export async function loadComponents(working_directory: URI, context: Context) {

    logger.debug(`Loading components within [ ${working_directory} ]`);

    const { endpoints, page_components, components }
        = await loadComponentsFromDirectory(
            working_directory,
            context,
            function (uri: URI) {

                // If this an index.wick component
                // then it will serve as an endpoint
                if (uri.filename == "index") {

                    const name = (uri + "").replace(working_directory + "", "").replace("index.wick", "");

                    return {
                        IS_ENTRY_COMPONENT: true,
                        output_name: name
                    };
                }

                return {
                    IS_ENTRY_COMPONENT: false
                };
            }
        );

    store.endpoints = endpoints;

    store.page_components = page_components;

    store.components = components;


    for (const [component, { endpoints }] of page_components) {

        for (const endpoint of endpoints)
            logger.debug(`Registered endpoint [ ${endpoint} ] with component [ ${component} ]`);
    }
}



