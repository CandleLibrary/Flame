function HISTORY(system, env) {
    const css = system.css;
    const ui = system.ui;

    const path = require("path");

    describe("Handling State History", function() {
        this.slow(2000);

        let component, element, style, rect, input;

        beforeEach(function(fin) {
            //Grab the single instance of the document. 
            let doc = system.docs.get(path.resolve(env.url));
            system.actions.CREATE_COMPONENT(system, doc, { x: 200, y: 40 });

            setTimeout(() => {
                component = ui.components[1];
                element = component.query("span");
                input = element.nextSibling.childNodes[1];
                style = component.window.getComputedStyle(element);
                fin();
            }, 100);
        });

        it("Basic history commands UNDO and REDO", function() {
            let style = component.window.getComputedStyle(element);

            system.actions.MOVE(system, element, component, 10, 10, false);
            system.actions.COMPLETE(system, element);

            let rules = css.mergeRules(css.aquireCSS(element, component));
            rules.props.left.should.equal(10);
            rules.props.position.should.equal("relative");
            style.left.should.equal("10px");
            style.top.should.equal("10px");

            system.actions.MOVE(system, element, component, 20, 20, false);
            system.actions.COMPLETE(system, element);

            style.left.should.equal("30px");
            style.top.should.equal("30px");

            system.actions.UNDO(system);

            return new Promise(res => {
                setTimeout(() => {
                    style.left.should.equal("10px");
                    style.top.should.equal("10px");
                    system.actions.REDO(system);
                    res();
                }, 100);
            })
            .then(()=>new Promise(res => {
            	setTimeout(() => {
                    style.left.should.equal("30px");
                    style.top.should.equal("30px");
                    system.actions.UNDO(system);
                    res();
                }, 100);
            })).then(()=>new Promise(res => {
            	setTimeout(() => {
                    style.left.should.equal("10px");
                    style.top.should.equal("10px");
                    res();
                }, 100);
            }));
        });
    });
}