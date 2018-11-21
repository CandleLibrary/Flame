import wick from "@galactrax/wick";



const scheme = wick.scheme;
const core = wick.core;

const Model = core.model;
const ModelContainer = core.model.container;
const BinaryTreeModelContainer = core.model.container.btree;
const ArrayModelContainer = core.model.container.array;
const DateModelContainer = core.model.container.btree;
const MultiIndexedContainer = core.model.container.multi;

const EPOCH_Date = scheme.date;
const EPOCH_Time = scheme.time;
const Longitude = scheme.number;
const Latitude = scheme.number;
const $Number = scheme.number;
const $String = scheme.string;
const $Boolean = scheme.bool;

/**
 * Schema for flame_data model
 */
const schemed = wick.model.scheme;
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