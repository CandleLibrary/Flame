/**
 * Schema for flame_data model
 */
//const schemed = wick.model.scheme;

export default function(env) {
    const wick = env.wick;
    const schemed = wick.model.scheme;

    const EPOCH_Date = new wick.model.scheme.date.constructor;
    const EPOCH_Time = new wick.model.scheme.time.constructor;
    const Longitude = new wick.model.scheme.number.constructor;
    const Latitude = new wick.model.scheme.number.constructor;
    const $Number = new wick.model.scheme.number.constructor;
    const $String = new wick.model.scheme.string.constructor;
    const $Boolean = new wick.model.scheme.bool.constructor;

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
