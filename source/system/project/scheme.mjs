/**
 * Schema for flame_data model
 */
//const schemed = wick.scheme;
import wax from "@candlefw/wax";

export default function(env) {
    
    const schemed = wax.scheme;

    const EPOCH_Date = new wax.scheme.date.constructor;
    const EPOCH_Time = new wax.scheme.time.constructor;
    const Longitude = new wax.scheme.number.constructor;
    const Latitude = new wax.scheme.number.constructor;
    const $Number = new wax.scheme.number.constructor;
    const $String = new wax.scheme.string.constructor;
    const $Boolean = new wax.scheme.bool.constructor;

    const n = new (schemed({
        meta: schemed({
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
    }));
    
    return n;
}
