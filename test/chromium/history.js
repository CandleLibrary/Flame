function HISTORY(system, env) {
    const css = system.css;

    describe("Handling State History", function() {
        this.slow(2000);

        let component, element, style;

        beforeEach(() =>
            env
            .loadTestComponentA()
            .then((v) => {
                let { comp } = v;
                component = comp;
                element = component.query("span");
                style = component.window.getComputedStyle(element);
            })
        );

        afterEach(() => system.project.reset());

        it("Basic history commands UNDO and REDO", function() {
            console.log("AA")
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