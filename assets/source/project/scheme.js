import {SchemedModel,
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
const flame_scheme = schemed({
	project : schemed({
		name : $String,
        working_directory : $String,
        temp_directory : $String,
        last_modified : EPOCH_Time,
        creation_date : EPOCH_Time,
	}),
	default  : schemed({
        component  : schemed({
            width: $Number,
            height: $Number
        })
	}),
    settings: schemed({
        KEEP_UNIQUE: $Boolean,
        move_type : $String,
        primary_color: $Number,
        secondary_color : $Number,

    })
});

export {flame_scheme};