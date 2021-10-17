import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { ComponentData, Context, loadComponentsFromDirectory } from "@candlelib/wick";
import {
    Components,
    EndPoints,
    PageComponents
} from "@candlelib/wick/build/types/entry/wick-server";
import { WickCompileConfig } from '@candlelib/wick/build/types/types/all';
import { Session } from '../../common/session';


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

export async function loadComponents(
    root_directory: URI,
    context: Context,
    config: WickCompileConfig
) {

    logger.debug(`Loading components within [ ${root_directory} ]`);

    const { page_components, components, endpoints }
        = await loadComponentsFromDirectory(
            root_directory, context, config.endpoint_mapper
        );

    store.endpoints = endpoints;
    store.page_components = page_components;
    store.components = components;

    for (const [component, { endpoints }] of page_components) {
        for (const endpoint of endpoints)
            logger.debug(`Registered endpoint [ ${endpoint} ] with component [ ${component} ]`);
    }
}


export const __sessions__: Session[] = [];
