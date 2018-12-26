function MOVE(system, env) {
    const css = system.css;

    describe("Handling movement and positioning of components", function() {
        let component, element, style, rect, input;

        beforeEach(() =>
            env
            .loadTestComponentA()
            .then((v) => {
                let { comp } = v;
                component = comp;
                element = component.query("span");
                input = element.nextSibling.childNodes[1];
                style = component.window.getComputedStyle(element);
            })
        );

        afterEach(() => system.project.reset());

        it("Necessary CSS rules are created when moving an element in a component.", function(fin) {

            //Span
            let style = component.window.getComputedStyle(element);
            system.actions.MOVE(system, element, component, 10, 0, false);
            let rules = css.mergeRules(css.aquireCSS(element, component));
            rules.props.left.should.equal(10);
            rules.props.position.should.equal("relative");
            style.left.should.equal("10px");
            style.top.should.equal("0px");
            style.position.should.equal("relative");

            //Input
            style = component.window.getComputedStyle(input);
            system.actions.MOVE(system, input, component, 50, 40, false);
            rules = css.mergeRules(css.aquireCSS(input, component));
            rules.props.left.should.equal(50);
            rules.props.position.should.equal("relative");
            style.left.should.equal("50px");
            style.top.should.equal("40px");
            style.position.should.equal("relative");

            fin();
        });

        it("Converting position type should keep element in same visual location - display:inline", function(fin) {
            //SPAN
            let style = component.window.getComputedStyle(element);
            rect = element.getBoundingClientRect();
            let left = rect.left;
            let top = rect.top;

            //Absolute
            system.actions.TOPOSITIONABSOLUTE(system, element, component);
            style.position.should.equal("absolute");
            rect = element.getBoundingClientRect();
            rect.left.should.equal(left);
            rect.top.should.equal(top);
            element.flame_cache = null;

            //Relative
            system.actions.TOPOSITIONRELATIVE(system, element, component);
            style.position.should.equal("relative");
            style.left.should.equal("0px");
            style.top.should.equal("0px");
            rect = element.getBoundingClientRect();
            rect.left.should.equal(left);
            rect.top.should.equal(top);
            element.flame_cache = null;

            //INPUT
            style = component.window.getComputedStyle(input);
            rect = input.getBoundingClientRect();
            left = rect.left;
            top = rect.top;

            //Absolute
            system.actions.TOPOSITIONABSOLUTE(system, input, component);
            style.position.should.equal("absolute");
            rect = input.getBoundingClientRect();
            rect.left.should.equal(left);
            rect.top.should.equal(top);
            input.flame_cache = null;
            //Relative
            system.actions.TOPOSITIONRELATIVE(system, input, component);
            style.position.should.equal("relative");
            style.left.should.equal("0px");
            style.top.should.equal("0px");
            rect = input.getBoundingClientRect();
            rect.left.should.equal(left);
            rect.top.should.equal(top);
            input.flame_cache = null;
            fin();
        });

        it("Converting position type should keep element in same visual location - display:block");
        it("Converting position type should keep element in same visual location - display:grid");
        it("Converting position type should keep element in same visual location - display:flex");
        it("Converting position type should keep element in same visual location - display:inline-box");

        it("Converting unit type keeps element in same spot", function() {
            rect = element.getBoundingClientRect();
            const left = rect.left;
            const top = rect.top;
            system.actions.CONVERT_LEFT(system, element, component, "%");
            rect = element.getBoundingClientRect();
            left.should.equal(rect.left);
            system.actions.CONVERT_LEFT(system, element, component, "px");
            rect = element.getBoundingClientRect();
            left.should.equal(rect.left);

            system.actions.CONVERT_TOP(system, element, component, "%");
            rect = element.getBoundingClientRect();
            top.should.equal(rect.top);
            system.actions.CONVERT_TOP(system, element, component, "px");
            rect = element.getBoundingClientRect();
            top.should.equal(rect.top);
        });
    });
}