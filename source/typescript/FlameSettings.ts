export interface FlameCLISettings {
    /**
     * Directory where all prebuilt client side files can be found.
     * This is the directory that the dev web server will scope to.
     */
    input_dir: string;

    /**
     * Directory where built static web files will be stored. This
     * only applies when `flame build` is used.
     */
    output_dir: string;

    /**
     * If true, rendered pages will be integrated with the `radiate.js`
     * client side router.
     */
    RADIATE: boolean;

    /**
     * GIT commit interval - The interval at which to commit changes to
     * files. Can either be a rate based on number of changes made 
     * or a time interval. These can be combined to ensure commits happen
     * frequently.
     * 
     * E.G 
     * - `100c` - 100 changes, including undos and redos.
     * - `120s` - Make a commit every 2 minutes.
     * - `66m` - Make a commit every 66 minutes.
     * - `66m50c` - Make a commit every 66 minutes or after 50 changes. Whichever
     * comes first.
     */
    commit_rate: "";

    /**
     * The default Git branch in which flame commits will be made.
     */
    flame_branch: "";

    /**
     * Automatically make a commit when the editor history first gets rolled back
     * after making forward progress.
     */
    COMMIT_ON_UNDO: boolean;

    /**
     * Default commit message template. 
     */
    commit_msg_template: "";

}
