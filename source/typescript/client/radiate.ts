import { cfw, addModuleToCFW } from "@candlefw/cfw";
import URL from "@candlefw/url";

import { PageView } from "./page";
import { Element } from "./element";
import { Component } from "./component";


const URL_HOST = { wurl: null };

export {
    PageView,
    Element,
    Component
};


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
export class Router {

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
            if (!temp.onclick) temp.onclick = (e) => {

                let link = e.currentTarget;
                if (link.origin !== location.origin) return;
                //source.bubbleLink();
                e.preventDefault();
                //TODO: allow preloading of pages and modals
                history.pushState({}, "ignored title", link.href);
                window.onpopstate();
            };
        };

        //Adding CandleFW URL to the presets object for use by wick components. 
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
            } else {
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

        URL_HOST.wurl = wurl;

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


            let UNWIND = 0;
            let FORCE_CLOSE = (page.type == "transitioning_modal");


            this.modal_stack = this.modal_stack.reduce((r, a) => {
                if ((!(FORCE_CLOSE || a.CLOSE))) {
                    r.push(a);
                } else if (a !== page) {
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

        } else {
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

        } else if (!current_view) {

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

        let IS_SAME_PAGE = (this.current_url == url),
            page = null;

        if ((page = this.pages[wurl.path])) {

            page.reply = pending_modal_reply;

            if (IS_SAME_PAGE && this.current_view == page) {

                URL_HOST.wurl = wurl;

                console.log("missing same-page resolution");
                return;
            }

            this.loadPage(page, wurl, IS_SAME_PAGE);

            return;
        }

        if (location)
            wurl.fetchText().then(html => {

                var DOM = (new DOMParser()).parseFromString(html, "text/html");

                this.loadNewPage(wurl, DOM, pending_modal_reply).then(page =>
                    this.loadPage(page, wurl, IS_SAME_PAGE)
                );

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
            } else if (app_source.dataset.modal == "transition") {
                page.setType("transitioning_modal", this);
            } else {
                //this.active_presets = this.frozen_presets.copy();
                //this.active_presets.router = this;
            }

            if (app.dataset.no_buffer == "true")
                NO_BUFFER = true;

            var elements = app_page.getElementsByTagName("element");

            for (var i = 0; i < elements.length; i++) {

                let ele = elements[i],
                    element;

                let element_id = ele.id;

                if (page.type !== "modal") {
                    element = new Element(ele);
                } else {

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


            if (!NO_BUFFER) this.pages[url.path] = page;

            return promise;
        }
    }
}

let LINKER_LOADED = false;

export default function radiate() {

    if (LINKER_LOADED) return;

    LINKER_LOADED = true;

    window.addEventListener("load", () => {
        const router = new Router(cfw.wick.rt.presets);
        router
            .loadNewPage(new URL(document.location), document, false)
            .then(page => router.loadPage(page, new URL(location.href), true));
    }
    );

}

addModuleToCFW(radiate, "radiate");