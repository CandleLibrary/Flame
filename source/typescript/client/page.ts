/**
 * Page visualization of the data that model contains.
 *
 * @class      PageView (name)
 */
export class PageView {

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

        if (this.LOADED) return;

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
