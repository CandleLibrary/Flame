import {
    SchemedModel,
    Model,
    ModelContainerBase,
    BTreeModelContainer,
    ArrayModelContainer,
    MultiIndexedContainer,
    SchemeConstructor,
    DateSchemeConstructor,
    TimeSchemeConstructor,
    StringSchemeConstructor,
    NumberSchemeConstructor,
    BoolSchemeConstructor
} from "@candlefw/wick";

const schemed = (schema, sm) => (sm = class extends SchemedModel {}, sm.schema = schema, sm);
const EPOCH_Date = new DateSchemeConstructor;
const EPOCH_Time = new TimeSchemeConstructor;
const Longitude = new NumberSchemeConstructor;
const Latitude = new NumberSchemeConstructor;
const $Number = new NumberSchemeConstructor;
const $String = new StringSchemeConstructor;
const $Boolean = new BoolSchemeConstructor;
/**
 * Schema for flame_data model
 */
//const schemed = wick.model.scheme;
const FlameScheme = schemed({
    meta:schemed({
        last_modified: EPOCH_Time,
        creation_date: EPOCH_Time, 
    }),
    preferences: schemed({
        name: $String,
        working_directory: $String,
        temp_directory: $String,
        proj_data_directory: $String,
        bundle_files: $Boolean,
        auto_save_interval: $Number,
    }),
    defaults: schemed({
        component: schemed({
            width: $Number,
            height: $Number
        })
    }),
    components: schemed({
        KEEP_UNIQUE: $Boolean,
        move_type: $String,
        primary_color: $Number,
        secondary_color: $Number,
    })
});

export { FlameScheme };