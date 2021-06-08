var radiate = (function (exports) {
    'use strict';

    const global_object = (typeof global !== "undefined") ? global : window, cfw = global_object.cfw || {};
    function addModuleToCFW(module, name) {
        if (global_object) {
            if (!global_object.cfw || !global_object.cfw[name]) {
                //@ts-ignore
                if (typeof global_object.cfw == "undefined") {
                    //@ts-ignore
                    global_object.cfw = cfw;
                    //@ts-ignore
                }
                Object.defineProperty(global_object.cfw, name, { value: module, writable: false, configurable: false });
            }
            return global_object[name];
        }
        return null;
    }

    let fetch = (typeof window !== "undefined") ? window.fetch : null;
    const uri_reg_ex = /(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:\/\/))?(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:([^\<\>\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\<\>\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\<\>\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;
    const STOCK_LOCATION = {
        protocol: "",
        host: "",
        port: "",
        path: "",
        hash: "",
        query: "",
        search: "",
        hostname: "",
        pathname: ""
    };
    function getCORSModes(url) {
        const IS_CORS = (URL.GLOBAL.host !== url.host && !!url.host);
        return {
            IS_CORS,
            mode: IS_CORS ? "cors" : "same-origin",
            credentials: IS_CORS ? "omit" : "include",
        };
    }
    function fetchLocalText(url, m = "cors") {
        return new Promise((res, rej) => {
            fetch(url + "", Object.assign({
                method: "GET"
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.text().then(rej);
                else
                    r.text().then(res);
            }).catch(e => rej(e));
        });
    }
    function fetchLocalJSON(url, m = "cors") {
        return new Promise((res, rej) => {
            fetch(url + "", Object.assign({
                method: "GET"
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.json().then(rej);
                else
                    r.json().then(res).catch(rej);
            }).catch(e => rej(e));
        });
    }
    function submitForm(url, form_data, m = "same-origin") {
        return new Promise((res, rej) => {
            var form;
            if (form_data instanceof FormData)
                form = form_data;
            else {
                form = new FormData();
                for (let name in form_data)
                    form.append(name, form_data[name] + "");
            }
            fetch(url + "", Object.assign({
                method: "POST",
                body: form
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.text().then(rej);
                else
                    r.json().then(res);
            }).catch(e => e.text().then(rej));
        });
    }
    function submitJSON(url, json_data, m = "same-origin") {
        return new Promise((res, rej) => {
            fetch(url + "", Object.assign({
                method: "POST",
                body: JSON.stringify(json_data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.json().then(rej);
                else
                    r.json().then(res);
            }).catch(e => e.text().then(rej));
        });
    }
    /**
     *  Used for processing URLs, handling `document.location`, and fetching data.
     */
    class URL {
        constructor(url = "", USE_LOCATION = false) {
            let IS_STRING = true, IS_LOCATION = false, location = (typeof (document) !== "undefined") ? document.location : STOCK_LOCATION;
            if (typeof (Location) !== "undefined" && url instanceof Location) {
                location = url;
                url = "";
                IS_LOCATION = true;
            }
            if ((!url || typeof (url) != "string") && !(url instanceof URL)) {
                IS_STRING = false;
                IS_LOCATION = true;
                if (URL.GLOBAL && USE_LOCATION)
                    return URL.GLOBAL;
            }
            /**
             * URL protocol
             */
            this.protocol = "";
            /**
             * Username string
             */
            this.user = "";
            /**
             * Password string
             */
            this.pwd = "";
            /**
             * URL hostname
             */
            this.host = "";
            /**
             * URL network port number.
             */
            this.port = 0;
            /**
             * URL resource path
             */
            this.path = "";
            /**
             * URL query string.
             */
            this.query = "";
            /**
             * Hashtag string
             */
            this.hash = "";
            /**
             * Map of the query data
             */
            this.map = null;
            if (url instanceof URL) {
                this.protocol = url.protocol;
                this.user = url.user;
                this.pwd = url.pwd;
                this.host = url.host;
                this.port = url.port;
                this.path = url.path;
                this.query = url.query;
                this.hash = url.hash;
            }
            else if (IS_STRING) {
                let part = url.match(uri_reg_ex);
                //If the complete string is not matched than we are dealing with something other 
                //than a pure URL. Thus, no object is returned. 
                if (part[0] !== url)
                    return null;
                this.protocol = part[1] || ((USE_LOCATION) ? location.protocol : "");
                this.user = part[2] || "";
                this.pwd = part[3] || "";
                this.host = part[4] || part[5] || part[6] || ((USE_LOCATION) ? location.hostname : "");
                this.port = parseInt(part[7]) || ((USE_LOCATION) ? parseInt(location.port) : 0);
                this.path = part[8] || ((USE_LOCATION) ? location.pathname : "");
                this.query = part[9] || ((USE_LOCATION) ? location.search.slice(1) : "");
                this.hash = part[10] || ((USE_LOCATION) ? location.hash.slice(1) : "");
            }
            else if (IS_LOCATION && location) {
                this.protocol = location.protocol.replace(/\:/g, "");
                this.host = location.hostname;
                this.port = parseInt(location.port);
                this.path = location.pathname;
                this.hash = location.hash.slice(1);
                this.query = location.search.slice(1);
                this._getQuery_();
                if (USE_LOCATION) {
                    URL.GLOBAL = this;
                    return URL.GLOBAL;
                }
            }
            this._getQuery_();
        }
        /**
         * Resolves a URL relative to an original url. If the environment is NodeJS,
         * then node_module resolution may be used if the relative path
         * does not begin with a ./ or ../.
         * @param URL_or_url_new
         * @param URL_or_url_original
         */
        static resolveRelative(URL_or_url_new, URL_or_url_original = (URL.GLOBAL)
            ? URL.GLOBAL
            : (typeof document != "undefined" && typeof document.location != "undefined")
                ? document.location.toString()
                : null) {
            const URL_old = new URL(URL_or_url_original), URL_new = new URL(URL_or_url_new);
            if (!(URL_old + "") || !(URL_new + ""))
                return null;
            if (URL_new.path[0] != "/") {
                let a = URL_old.path.split("/");
                let b = URL_new.path.split("/");
                if (b[0] == "..")
                    a.splice(a.length - 1, 1);
                for (let i = 0; i < b.length; i++) {
                    switch (b[i]) {
                        case ".": a.splice(a.length - 1, 0);
                        case "..":
                            a.splice(a.length - 1, 1);
                            break;
                        default:
                            a.push(b[i]);
                    }
                }
                URL_new.path = a.join("/");
            }
            return URL_new;
        }
        /**
        URL Query Syntax
     
        root => [root_class] [& [class_list]]
             => [class_list]
     
        root_class = key_list
     
        class_list [class [& key_list] [& class_list]]
     
        class => name & key_list
     
        key_list => [key_val [& key_list]]
     
        key_val => name = val
     
        name => ALPHANUMERIC_ID
     
        val => NUMBER
            => ALPHANUMERIC_ID
        */
        /**
         * Pulls query string info into this.map
         * @private
         */
        _getQuery_() {
            if (this.query) {
                const data = this.query
                    .split(/(?<!\\)\?/)
                    .map(s => s.split("="))
                    .map(s => (s[1] = s[1] || true, s));
                this.map = new Map(data);
            }
        }
        setPath(path) {
            this.path = path;
            return new URL(this);
        }
        setLocation() {
            history.replaceState({}, "replaced state", `${this}`);
            //window.onpopstate();
        }
        toString() {
            let str = [];
            if (this.host) {
                if (this.protocol)
                    str.push(`${this.protocol}://`);
                str.push(`${this.host}`);
            }
            if (this.port)
                str.push(`:${this.port}`);
            if (this.path)
                str.push(`${this.path[0] == "/" || this.path[0] == "." ? "" : "/"}${this.path}`);
            if (this.query)
                str.push(((this.query[0] == "?" ? "" : "?") + this.query));
            if (this.hash)
                str.push("#" + this.hash);
            return str.join("");
        }
        /**
         * Pulls data stored in query string into an object an returns that.
         * @param      {string}  class_name  The class name
         * @return     {object}  The data.
         */
        getData(class_name = "") {
            if (this.map) {
                let _c = this.map.get(class_name);
                return _c;
            }
            return null;
        }
        /**
         * Sets the data in the query string. Wick data is added after a second `?` character in the query field,
         * and appended to the end of any existing data.
         * @param     {object | Model | AnyModel}  data The data
         * @param     {string}  class_name  Class name to use in query string. Defaults to root, no class
         */
        setData(data_name = "", value) {
            if (data_name) {
                let map = this.map = new Map();
                map.set(data_name, value);
                let str = [];
                for (const [key, value] of map.entries()) {
                    if (!value);
                    else if (value === true)
                        str.push(`${key}`);
                    else
                        str.push(`${key}=${value}`);
                }
                this.query = str.join("?");
            }
            else {
                this.query = "";
            }
            return this;
        }
        /**
         * Fetch a string value of the remote resource.
         * Just uses path component of URL. Must be from the same origin.
         * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached.
         * If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
         * @return     {Promise}  A promise object that resolves to a string of the fetched value.
         */
        fetchText(ALLOW_CACHE = false) {
            if (ALLOW_CACHE) {
                let resource = URL.RC.get(this.path);
                if (resource)
                    return new Promise((res) => {
                        res(resource);
                    });
            }
            return fetchLocalText(this).then(res => (URL.RC.set(this.path, res), res));
        }
        /**
         * Fetch a JSON value of the remote resource.
         * Just uses path component of URL. Must be from the same origin.
         * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached,
         * that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
         * @return     {Promise}  A promise object that resolves to a string of the fetched value.
         */
        fetchJSON(ALLOW_CACHE = false) {
            if (ALLOW_CACHE) {
                let resource = URL.RC.get(this.path);
                if (resource)
                    return new Promise((res) => {
                        res(resource);
                    });
            }
            return fetchLocalJSON(this).then(res => (URL.RC.set(this.path, res), res));
        }
        /**
         * Cache a local resource at the value
         * @param    {object}  resource  The resource to store at this URL path value.
         * @returns {boolean} `true` if a resource was already cached for this URL, false otherwise.
         */
        cacheResource(resource) {
            let occupied = URL.RC.has(this.path);
            URL.RC.set(this.path, resource);
            return occupied;
        }
        submitForm(form_data) {
            return submitForm(this, form_data);
        }
        submitJSON(json_data, mode) {
            return submitJSON(this, json_data, mode);
        }
        /**
         * Goes to the current URL.
         */
        goto() {
            return;
            //let url = this.toString();
            //history.pushState({}, "ignored title", url);
            //window.onpopstate();
            //URL.GLOBAL = this;
        }
        //Returns the last segment of the path
        get file() {
            return this.path.split("/").pop();
        }
        //returns the name of the file less the extension
        get filename() {
            return this.file.split(".").shift();
        }
        //Returns the all but the last segment of the path
        get dir() {
            return this.path.split("/").slice(0, -1).join("/") || "/";
        }
        get pathname() {
            return this.path;
        }
        get href() {
            return this.toString();
        }
        get ext() {
            const m = this.path.match(/\.([^\.]*)$/);
            return m ? m[1] : "";
        }
        get search() {
            return this.query;
        }
        /**
         * True if the path is a relative path.
         *
         * Path must begin with `../` or `./` to be
         * considered relative.
         */
        get IS_RELATIVE() {
            return this.path.slice(0, 3) == "../"
                || this.path.slice(0, 2) == "./";
            //|| this.path.slice(0, 1) != "/";
        }
    }
    /**
     * The fetched resource cache.
     */
    URL.RC = new Map();
    /**
     * The Default Global URL object.
     */
    URL.GLOBAL = (typeof location != "undefined") ? new URL(location) : new URL;
    let SIMDATA = null;
    /** Replaces the fetch actions with functions that simulate network fetches. Resources are added by the user to a Map object. */
    URL.simulate = function () {
        SIMDATA = new Map;
        URL.prototype.fetchText = async (d) => ((d = this.toString()), SIMDATA.get(d)) ? SIMDATA.get(d) : "";
        URL.prototype.fetchJSON = async (d) => ((d = this.toString()), SIMDATA.get(d)) ? JSON.parse(SIMDATA.get(d).toString()) : {};
    };
    URL.addResource = (n, v) => (n && v && (SIMDATA || (SIMDATA = new Map())) && SIMDATA.set(n.toString(), v.toString));
    let POLLYFILLED = false;
    URL.polyfill = async function () {
        if (typeof (global) !== "undefined" && !POLLYFILLED) {
            POLLYFILLED = true;
            const fsr = (await import('fs')), fs = fsr.promises, path = (await import('path')), http = (await import('http')),
                //@ts-ignore
                g = global;
            URL.GLOBAL = new URL(process.cwd() + "/");
            g.document = g.document || {};
            g.document.location = URL.GLOBAL;
            g.location = URL.GLOBAL;
            const cached = URL.resolveRelative;
            URL.resolveRelative = function (new_url, old_url) {
                let URL_old = new URL(old_url), URL_new = new URL(new_url);
                const first_char = URL_new.path[0];
                if (first_char == "/") {
                    //Prevent traversal outside the CWD for security purposes.
                    URL_new.path = path.join(process.cwd(), URL_new.path);
                    return URL_new;
                }
                else if (!URL_new.IS_RELATIVE) {
                    //Attempt to resolve the file from the node_modules directories.
                    /**
                     * TODO handle resolution of modules with a more general method.
                     * See yarn Plug'n'Play: https://yarnpkg.com/features/pnp
                     */
                    const base_path = URL_old.path.split("/").filter(s => s !== ".."), new_path = URL_new.path;
                    let i = base_path.length;
                    while (i-- >= 0) {
                        try {
                            let search_path = "";
                            if (base_path[i] == "node_modules")
                                search_path = path.join(base_path.slice(0, i + 1).join("/"), new_path);
                            else
                                search_path = path.join(base_path.slice(0, i + 1).join("/"), "node_modules", new_path);
                            const stats = fsr.statSync(search_path);
                            if (stats)
                                return new URL(search_path);
                        }
                        catch (e) {
                            //Suppress errors - Don't really care if there is no file found. That can be handled by the consumer.
                        }
                    }
                }
                return cached(URL_new, URL_old);
            };
            /**
             * Global `fetch` polyfill - basic support
             */
            fetch = g.fetch = async (url, data) => {
                if (data.IS_CORS) { // HTTP Fetch
                    return new Promise((res, rej) => {
                        try {
                            http.get(url, data, req => {
                                let body = "";
                                req.setEncoding('utf8');
                                req.on("data", d => {
                                    body += d;
                                });
                                req.on("end", () => {
                                    res({
                                        status: 200,
                                        text: () => {
                                            return {
                                                then: (f) => f(body)
                                            };
                                        },
                                        json: () => {
                                            return {
                                                then: (f) => f(JSON.stringify(body))
                                            };
                                        }
                                    });
                                });
                            });
                        }
                        catch (e) {
                            rej(e);
                        }
                    });
                }
                else { //FileSystem Fetch
                    let p = path.resolve(process.cwd(), "" + url), d = await fs.readFile(p, "utf8");
                    try {
                        return {
                            status: 200,
                            text: () => {
                                return {
                                    then: (f) => f(d)
                                };
                            },
                            json: () => {
                                return {
                                    then: (f) => f(JSON.parse(d))
                                };
                            }
                        };
                    }
                    catch (err) {
                        throw err;
                    }
                }
            };
        }
    };
    Object.freeze(URL.RC);
    Object.seal(URL);

    /**
     * Page visualization of the data that model contains.
     *
     * @class      PageView (name)
     */
    class PageView {
        constructor(URL, app_page) {
            this.url = URL;
            this.eles = [];
            this.finalizing_view = null;
            this.type = "normal";
            this.ele = app_page;
            this.ele_backer = null;
            this.LOADED = false;
            this.style = null;
        }
        destroy() {
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.destroy();
            }
            this.eles = null;
            this.ele = null;
        }
        unload() {
            this.LOADED = false;
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.unloadComponents();
            }
            if (this.style && this.style.parentElement)
                this.style.parentElement.removeChild(this.style);
        }
        getElement(id) {
            return this.eles.find((e) => e.ele.id == id);
        }
        mount(app_element, wurl, prev_page) {
            if (this.style && !this.style.parentElement)
                document.head.appendChild(this.style);
            this.LOADED = true;
            if (app_element.firstChild)
                app_element.insertBefore(this.ele, app_element.firstChild);
            else
                app_element.appendChild(this.ele);
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                let contemporary = (prev_page && element.ele.id) ? prev_page.getElement(element.ele.id) : null;
                element.loadComponents(wurl, contemporary);
            }
        }
        finalize() {
            if (this.LOADED)
                return;
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.finalize();
            }
            if (this.ele.parentElement)
                this.ele.parentElement.removeChild(this.ele);
        }
        /**
         * Loads elements from HTML and JS data provided by router. Returns Promise that resolves when components are fully constructed. Allows for asynchronous network bound component construction.
         *
         * @param      {<type>}   model_constructors      The model constructors
         * @param      {<type>}   component_constructors  The component constructors
         * @param      {<type>}   presets                 The presets
         * @param      {<type>}   DOM                     The dom
         * @param      {<type>}   wurl                    The wurl
         * @return     {Promise}  { description_of_the_return_value }
         */
        load(model_constructors, component_constructors, presets, DOM, wurl) {
            return new Promise((res, rej) => {
                let unresolved_count = 1;
                const resolution = () => {
                    unresolved_count--;
                    if (unresolved_count == 0)
                        res(this);
                };
                const unresolved = (count = 1) => unresolved_count += count;
                for (var i = 0; i < this.eles.length; i++) {
                    let element = this.eles[i];
                    element.page = this;
                    element.setComponents(model_constructors, component_constructors, presets, DOM, wurl, unresolved, resolution);
                }
                resolution();
            });
        }
        up(data, src) {
            for (var i = 0; i < this.eles.length; i++)
                this.eles[i].down(data, src);
        }
        transitionOut(transitioneer) {
            for (var i = 0; i < this.eles.length; i++)
                this.eles[i].transitionOut(transitioneer);
        }
        transitionIn(transitioneer) {
            /*
            transitioneer({
                obj: this.ele,
                prop: "style.opacity",
                key: [0, 1],
                duration: 50,
                delay: 0
            });

            if (this.type == "modal") {
                setTimeout(() => {
                    this.ele.style.opacity = 1;
                }, 50);
            }
            */
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.parent = this;
                element.transitionIn(transitioneer);
            }
        }
        compareComponents() {
            //This will transition objects
        }
        setType(type, router) {
            this.type = type || "normal";
            if (type == "modal") {
                if (!this.ele_backer) {
                    this.ele_backer = document.createElement("div");
                    this.ele_backer.classList.add("modal_backer");
                    this.ele.insertBefore(this.ele_backer, this.ele.firstChild);
                    this.ele_backer.addEventListener("click", (e) => {
                        if (e.target == this.ele_backer) {
                            router.closeModal();
                        }
                    });
                }
            }
        }
    }

    /**
     * The base class for all components
     * @param      {HTMLElement}  element  The DOM `<component>` element that the Component can append sub elements to. It may be replaced by a different type of element if necessary, is in the case with an ErrorComponent.
     * @memberof module:wick~internals.component
     * @alias BaseComponent
     */
    class BaseComponent {
        constructor(element) {
            /**
             * The HTML element the component will append elements to.
             */
            this.ele = element;
            /**
             * Set to `true` if the component's `ele` element is currently appended to the main document.
             */
            this.LOADED = false;
        }
        /**
         * Returns a list of all elements that have a name attribute.
         * @param      {Object}  named_elements  Object to _bind_ named elements to.
         */
        getNamedElements(named_elements) { }
        /**
         * Called by the hosting Element when it is mounted to the active page.
         * Allows the component to react to changes observed in the URL of the website.
         */
        handleUrlUpdate() { }
        /**
         * Called by the hosting Element when it is mounted to the active page.
         * Allows the component to apply a transition in effect.
         */
        transitionIn() { }
        /**
         * Called by the hosting Element before it is unmounted from the active page.
         * Allows the component to apply a transition out effect.
         * @override
         */
        transitionOut() { }
        finalizeMount(parent) {
            if (this.LOADED == false && this.ele.parentElement)
                this.ele.parentElement.removeChild(this.ele);
        }
        pendMount(obj, wrap_index, url) {
            this.LOADED = true;
            this.parent = obj;
            this.parent.wraps[wrap_index].appendChild(this.ele);
            this.handleUrlUpdate(url);
        }
    }
    /**
     * Component attaches an error message to the `<component>`.  It allows JS errors to show in client space.
     * @param      {HTMLElement}  element        Ignored by this class
     * @param      {(string | Error)}  error_message  The error message or object to display.
     * @param      {Presets}  presets        The global Presets object.
     * @alias FailedComponent
     * @memberof module:wick~internals.component
     * @extends BaseComponent
     */
    class FailedComponent extends BaseComponent {
        constructor(element, error_message, presets) {
            super(document.createElement("div"));
            this.ele.innerHTML = `<h3> This Wick component has failed!</h3> <h4>Error Message:</h4><p>${error_message.stack}</p><p>Please contact the website maintainers to address the problem.</p> <p>${presets.error_contact}</p>`;
        }
    }
    /**
     * Builds out a `<component>` trough the Wick templating system.
     * @param      {HTMLElement}  element                 The element
     * @param      {Presets}  presets                 The global Presets object
     * @param      {Object}  app_components          The application components
     * @param      {Object}  component_constructors  The component constructors
     * @param      {Object}  model_constructors      The model constructors
     * @param      {HTMLElement}  WORKING_DOM             The working dom
     * @memberof module:wick~internals.component
     * @alias Component
     * @return     {Component}  If this object is already cached in app_components, returns the existing cached object.
     * @extends BaseComponent
     */
    class Component extends BaseComponent {
        constructor(element, presets, DOM, component_constructor, resolve_pending, wick_ele) {
            super(element);
            this.element = wick_ele;
            this.public = "";
            this.presets = presets;
            /**
             * The {@link Model} the
             */
            this.model = null;
            /**
             * All {@link Source}s bound to this component from a {@link SourcePackag}.
             */
            this.sources = [];
            /**
             *  Set to true by Element when the Element mounts the component to the document.
             */
            this.ACTIVE = false;
            this._resolve_pending_ = resolve_pending;
            const id = element.classList[0];
            this.comp = new component_constructor(null, element);
            this.resolve();
        }
        resolve() {
            if (this._resolve_pending_)
                this._resolve_pending_();
            this._resolve_pending_ = null;
        }
        /**
         * @override
         */
        transitionOut(transitioneer) {
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].transitionOut({ trs_out: transitioneer });
            if (!this.LOADED || !this.ACTIVE) {
                this.ACTIVE = false;
                return 0;
            }
            this.ACTIVE = false;
            let t = 0;
            return t;
        }
        /**
         * @override
         */
        transitionIn(transitioneer) {
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].transitionIn({ trs_in: transitioneer });
            if (!this.LOADED || this.ACTIVE) {
                this.ACTIVE = true;
                return 0;
            }
            this.ACTIVE = true;
        }
        sourceLoaded() {
            if (this.sources.length > 0) {
                let ele = this.sources[0].ele;
                let statics = this.sources[0].statics;
                //Load temporary public model data;
                if (statics && statics.public)
                    this.presets.models[statics.public] = this.sources[0].model;
                if (ele !== this.ele) {
                    if (this.ele.parentElement) {
                        this.ele.parentElement.insertBefore(ele, this.ele);
                        this.ele.parentElement.removeChild(this.ele);
                    }
                    this.ele = ele;
                }
            }
            this._resolve_pending_();
            this._resolve_pending_ = null;
            this.handleUrlUpdate();
        }
        /**
         * @override
         */
        handleUrlUpdate(url = new URL("", true)) {
            let query_data = url.getData();
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].update(query_data, null, true);
            if (this.url_store) {
                let url = this.url_store;
                this.url_store = null;
                this.handleUrlUpdate(url);
            }
            if (this.sources.length == 0)
                this.url_store = url;
        }
        _upImport_(prop_name, data, meta, src) {
            let d = {};
            d[prop_name] = data;
            this.element.up(d, src);
        }
        down(data, src) {
            for (let i = 0, l = this.sources.length; i < l; i++)
                if (src !== this.sources[i])
                    this.sources[i].down(data);
        }
        pendMount(obj, wrap_index, url) {
            super.pendMount(obj, wrap_index, url);
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].update({ mounted: true });
        }
    }

    /**
     * Class for element.
     *
     * @class      Element (name)
     *
     * Elements are the root scope for a set of components.
     * If two pages share the same element name, then the will remain mounted on the page as it transitions to the next.
     * Elements are used to determine how one page transitions into another.
     */
    class Element {
        /**
         * Constructs an Element.
         *
         * @param      {HTMLElement}  element  The HTMLElement that this Element will be bound to.
         */
        constructor(element, page) {
            this.id = (element.classList) ? element.classList[0] : element.id;
            this.components = [];
            this.bubbled_elements = null;
            this.wraps = [];
            this.page = page;
            //The original element container.
            //this.parent_element = parent_element;
            //Content that is wrapped in an ele_wrap
            this.ele = element;
            if (element.dataset.unique)
                this.unique = !!element.dataset.unique;
            else
                this.unique = false;
        }
        up(data, src) {
            this.page.up(data, src);
        }
        down(data, src) {
            for (var i = 0; i < this.components.length; i++)
                this.components[i].down(data, src);
        }
        finalize() {
            for (var i = 0; i < this.components.length; i++)
                this.components[i].finalizeMount(this);
        }
        unloadComponents() {
            for (var i = 0; i < this.components.length; i++)
                this.components[i].LOADED = false;
        }
        loadComponents(url, contemporary) {
            for (let i = 0; i < this.components.length; i++)
                this.components[i].pendMount(this, i, url);
            let before = this.ele.firstChild;
            if (contemporary) {
                for (let i = 0; i < contemporary.components.length; i++) {
                    let component = contemporary.components[i];
                    if (component.LOADED)
                        before = component.ele.parentElement;
                    else
                        this.ele.insertBefore(component.ele, (before) ? before.nextSibling : null);
                }
            }
        }
        transitionOut(transitioneer) {
            for (var i = 0; i < this.components.length; i++) {
                let component = this.components[i];
                if (!component.LOADED) {
                    component.transitionOut(transitioneer);
                }
            }
        }
        transitionIn(transitioneer) {
            // This is to force a document repaint, which should cause all elements to report correct positioning hereafter
            let t = this.ele.style.top;
            this.ele.style.top = t;
            for (let i = 0; i < this.components.length; i++) {
                let component = this.components[i];
                component.transitionIn(transitioneer);
            }
        }
        bubbleLink(link_url, child, trs_ele = {}) {
            this.bubbled_elements = trs_ele;
            history.pushState({}, "ignored title", link_url);
            window.onpopstate();
        }
        setComponents(Model_Constructors, Component_Constructors, presets, DOM, url, add_pending, res_pending) {
            //if there is a component inside the element, register that component if it has not already been registered
            var components = Array.prototype.map.call(this.ele.querySelectorAll(`[w-component]`), (a) => a);
            if (components.length < 1) {
                //Create a wrapped component for the elements inside the <element>
                let component = document.createElement("div");
                component.classList.add("comp_wrap");
                //Straight up string copy of the element's DOM.
                component.innerHTML = this.ele.innerHTML;
            }
            for (var i = 0; i < components.length; i++) {
                let app_component = null, component = components[i];
                add_pending(1);
                try {
                    /**
                        Replace the component with a component wrapper to help preserve DOM arrangement
                    */
                    //*
                    let comp_wrap = document.createElement("div");
                    comp_wrap.classList.add("comp_wrap");
                    this.wraps.push(comp_wrap);
                    component.parentElement.replaceChild(comp_wrap, component);
                    //*/
                    var id = component.getAttribute("w-component");
                    /**
                      We must ensure that components act as template "landing spots". In order for that to happen we must check for:
                      (1) The component has, as it's first class name, an id that (2) matches the id of a template. If either of these prove to be not true, we should reject the adoption of the component as a Wick
                      component and instead treat it as a normal "pass through" element.
                    */
                    let component_constructor = presets.component_class.get(id);
                    app_component = new Component(component, presets, DOM, component_constructor, res_pending, this);
                }
                catch (error) {
                    app_component = new FailedComponent(component, error, presets);
                    res_pending();
                }
                if (!app_component) {
                    app_component = new FailedComponent(component, new Error("Could not create new component, no suitable build data found."), presets);
                    res_pending();
                }
                this.components.push(app_component);
            }
        }
    }

    /** @namespace Router */
    /**
     * Returns the `<modal>` element from the document DOM, or creates and appends a new one to `<body>`.
     */
    function getModalContainer() {
        let modal_container = document.getElementsByTagName("modals")[0];
        if (!modal_container) {
            modal_container = document.createElement("modals");
            var dom_app = document.getElementById("app");
            if (dom_app)
                dom_app.appendChild(modal_container, dom_app);
            else
                document.body.appendChild(modal_container);
            modal_container.addEventListener("click", (e) => {
                if (e.target == modal_container) {
                    wick.router.closeModal();
                }
            });
        }
        return modal_container;
    }
    /**
     * Responsible for loading pages dynamically, handling the transition of page components, and monitoring and reacting to URL changes
     *
     * @memberof   module:wick~internal
     * @param      {Presets}  presets  A {@link Presets} object.
     * @package
     * @alias Router
     */
    class Router {
        /**
         * Constructs the object.
         */
        constructor(presets) {
            this.pages = {};
            this.elements = {};
            this.component_constructors = presets.custom_sources;
            this.models_constructors = presets.schemas;
            this.frozen_presets = presets;
            this.active_presets = presets;
            this.current_url = null;
            this.current_query = null;
            this.current_view = null;
            this.finalizing_pages = [];
            this.prev = null;
            presets.processLink = (temp, source) => {
                if (!temp.onclick)
                    temp.onclick = (e) => {
                        let link = e.currentTarget;
                        if (link.origin !== location.origin)
                            return;
                        //source.bubbleLink();
                        e.preventDefault();
                        //TODO: allow preloading of pages and modals
                        history.pushState({}, "ignored title", link.href);
                        window.onpopstate();
                    };
            };
            //Adding CandleLibrary URL to the presets object for use by wick components. 
            presets.url = URL;
            /* */
            this.modal_stack = [];
            window.onpopstate = (e = {}) => {
                if (this.IGNORE_NAVIGATION) {
                    this.IGNORE_NAVIGATION = false;
                    return;
                }
                if (e.state && e.state.modal_state) {
                    this.parseURL(e.state.modal_url);
                }
                else {
                    this.parseURL(document.location);
                }
            };
        }
        finalizePages(pages = this.finalizing_pages) {
            for (var i = 0, l = pages.length; i < l; i++) {
                var page = pages[i];
                page.finalize();
            }
            this.finalizing_pages.length = 0;
        }
        /**
         * Loads pages from server, or from local cache, and sends it to the page parser.
         * @param {String} url - The URL id of the cached page to load.
         * @param {String} query -
         * @param {Bool} IS_SAME_PAGE -
         */
        loadPage(page, wurl = new URL(document.location.href), IS_SAME_PAGE = false) {
            let transition = cfw.glow.createTransition();
            let app_ele = document.getElementById("app");
            let transition_elements = {};
            let finalizing_pages = [];
            let current_view = this.current_view;
            if (page.type == "modal" || page.type == "transitioning_modal") {
                page.CLOSE = false;
                //Replace the URL with the previous calling URL to prevent subsequent attempts of navigation to the modal resource.
                let u = new URL(this.prev_url.toString());
                u.hash = `rm${wurl.pathname.split("/").pop()}`;
                history.replaceState({ modal_state: true, modal_url: wurl.toString() }, "ignored title", u.toString());
                //trace modal stack and see if the modal already exists
                if (IS_SAME_PAGE)
                    return;
                let FORCE_CLOSE = (page.type == "transitioning_modal");
                this.modal_stack = this.modal_stack.reduce((r, a) => {
                    if ((!(FORCE_CLOSE || a.CLOSE))) {
                        r.push(a);
                    }
                    else if (a !== page) {
                        a.unload();
                        finalizing_pages.push(a);
                        a.transitionOut(transition.out);
                    }
                    return r;
                }, []);
                //*/
                //this.modal_stack.length = UNWIND;
                this.modal_stack.push(page);
                if (page.type != "transitioning_modal") {
                    page.mount(getModalContainer(), wurl);
                    page.transitionIn(transition.in);
                    transition.start().then(() => { this.finalizePages(finalizing_pages); });
                    return;
                }
                this.current_view = null;
            }
            else {
                this.prev_url = wurl;
                this.current_view = page;
                this.current_url = wurl.toString();
                for (var i = 0, l = this.modal_stack.length; i < l; i++) {
                    let modal = this.modal_stack[i];
                    modal.unload();
                    modal.transitionOut(transition.out);
                    finalizing_pages.push(modal);
                }
                this.modal_stack.length = 0;
            }
            if (current_view && current_view != page) {
                current_view.unload(transition_elements);
                page.mount(app_ele, wurl, current_view);
                current_view.transitionOut(transition.out);
                finalizing_pages.push(current_view);
                page.transitionIn(transition.in);
            }
            else if (!current_view) {
                page.mount(app_ele, wurl);
                page.transitionIn(transition.in);
            }
            transition.asyncPlay().then(() => { this.finalizePages(finalizing_pages); });
        }
        closeModal(data = {}) {
            let top = this.modal_stack.length - 1;
            let modal = this.modal_stack[top];
            modal.CLOSE = true;
            if (modal.reply)
                modal.reply(data);
            modal.reply = null;
            let next_modal = this.modal_stack[top - 1];
            if (next_modal)
                return this.loadPage(next_modal);
            return this.parseURL(this.prev_url.toString(), this.prev_url);
        }
        loadModal(url_, query_data) {
            return new Promise((res) => {
                history.pushState({}, "ignored title", url_);
                let url = new URL(url_);
                url.setData(query_data);
                this.parseURL(url, url, res);
            });
        }
        /*
            This function will parse a URL and determine what Page needs to be loaded into the current view.
        */
        parseURL(location, wurl = new URL(location), pending_modal_reply = null) {
            let url = wurl.toString();
            //if (wurl.pathname)
            //  url = wurl.pathname;
            let IS_SAME_PAGE = (this.current_url == url), page = null;
            if ((page = this.pages[wurl.path])) {
                page.reply = pending_modal_reply;
                if (IS_SAME_PAGE && this.current_view == page) {
                    console.log("missing same-page resolution");
                    return;
                }
                this.loadPage(page, wurl, IS_SAME_PAGE);
                return;
            }
            if (location)
                wurl.fetchText().then(html => {
                    var DOM = (new DOMParser()).parseFromString(html, "text/html");
                    this.loadNewPage(wurl, DOM, pending_modal_reply).then(page => this.loadPage(page, wurl, IS_SAME_PAGE));
                }).catch((error) => {
                    console.warn(`Unable to process response for request made to: ${this.url}. Response: ${error}. Error Received: ${error}`);
                });
        }
        /**
            Pre-loads a custom constructor for an element with the specified id and provides a model to that constructor when it is called.
            The constructor must have Element in its inheritance chain.
        */
        addStatic(element_id, constructor, model) {
            this.component_constructors[element_id] = {
                constructor,
                model_name: model
            };
        }
        /**
            Creates a new iframe object that acts as a modal that will sit ontop of everything else.
        */
        loadNonWickPage(URL) {
            let url = URL.toString();
            let iframe = document.createElement("iframe");
            iframe.src = URL;
            iframe.classList.add("modal", "comp_wrap");
            var page = new PageView(URL, iframe);
            page.type = "modal";
            this.pages[URL] = page; //new Modal(page, iframe, getModalContainer());
            return this.pages[URL];
        }
        /**
            Takes the DOM of another page and strips it, looking for elements to use to integrate into the SPA system.
            If it is unable to find these elements, then it will pass the DOM to loadNonWickPage to handle wrapping the page body into a wick app element.
        */
        loadNewPage(url = new URL("", true), DOM, pending_modal_reply = null) {
            //look for the app section.
            /**
                If the page should not be reused, as in cases where the server does all the rendering for a dynamic page and we're just presenting the results,
                then having NO_BUFFER set to true will cause the linker to not save the page to the hashtable of existing pages, forcing a request to the server every time the page is visited.
            */
            let NO_BUFFER = false;
            /*
                App elements: There should only be one.
            */
            let app_source = DOM.getElementById("app");
            /**
              If there is no <app> element within the DOM, then we must handle this case carefully. This likely indicates a page delivered from the same origin that has not been converted to work with the Wick system.
              The entire contents of the page can be wrapped into a <iframe>, that will be could set as a modal on top of existing pages.
            */
            if (!app_source) {
                console.warn("Page does not have an <app> element!");
                return this.loadNonWickPage(url);
            }
            var app_page = document.createElement("apppage");
            app_page.innerHTML = app_source.innerHTML;
            var app = app_source.cloneNode(true);
            var dom_app = document.getElementById("app");
            var page = new PageView(url, app_page);
            if (document == DOM)
                dom_app.innerHTML = "";
            else {
                //collect the templates and add to root dom. 
                const wick_script = DOM.getElementById("wick-components");
                if (wick_script)
                    (Function("cfw", "wick", wick_script.innerHTML))(cfw, { default: cfw.wick });
                const wick_style = DOM.getElementById("wick-css");
                if (wick_style) {
                    page.style = wick_style.cloneNode(true);
                }
            }
            if (app_source) {
                if (app_source.dataset.modal == "true" || pending_modal_reply) {
                    page.setType("modal", this);
                    let modal = document.createElement("modal");
                    modal.innerHTML = app.innerHTML;
                    app.innerHTML = "";
                    app = modal;
                    page.reply = pending_modal_reply;
                    /*
                        If the DOM is the same element as the actual document, then we shall rebuild the existing <app> element, clearing it of it's contents.
                    */
                    if (DOM == document && dom_app) {
                        let new_app = document.createElement("app");
                        document.body.replaceChild(new_app, dom_app);
                        dom_app = new_app;
                    }
                }
                else if (app_source.dataset.modal == "transition") {
                    page.setType("transitioning_modal", this);
                }
                if (app.dataset.no_buffer == "true")
                    NO_BUFFER = true;
                var elements = app_page.getElementsByTagName("element");
                for (var i = 0; i < elements.length; i++) {
                    let ele = elements[i], element;
                    let element_id = ele.id;
                    if (page.type !== "modal") {
                        element = new Element(ele);
                    }
                    else {
                        let new_ele = document.createElement("div");
                        new_ele.innerHTML = ele.innerHTML;
                        new_ele.classList.add("ele_wrap");
                        element = new Element(ele);
                    }
                    page.eles.push(element);
                    if (!this.elements[element_id])
                        this.elements[element_id] = {};
                    element.common_components = this.elements[element_id];
                }
                let promise = page.load(this.models_constructors, this.component_constructors, this.active_presets, DOM, url);
                if (!NO_BUFFER)
                    this.pages[url.path] = page;
                return promise;
            }
        }
    }
    let LINKER_LOADED = false;
    function radiate() {
        if (LINKER_LOADED)
            return;
        LINKER_LOADED = true;
        window.addEventListener("load", () => {
            const router = new Router(cfw.wick.rt.presets);
            router
                .loadNewPage(new URL(document.location), document, false)
                .then(page => router.loadPage(page, new URL(location.href), true));
        });
    }
    addModuleToCFW(radiate, "radiate");

    exports.Component = Component;
    exports.Element = Element;
    exports.PageView = PageView;
    exports.Router = Router;
    exports.default = radiate;

    return exports;

}({}));
