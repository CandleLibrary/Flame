function HISTORY(system, env) {
    const css = system.css;

    describe("Handling State History", function() {
        this.slow(2000);

        let component, element, style;

        beforeEach(() =>
            env
            .loadTestComponentA()
            .then((v) => {
                const { comp } = v;
                component = comp;
                element = component.query("span");
                style = component.window.getComputedStyle(element);
            })
        );

        afterEach(() => system.project.reset());

        it("Basic history commands UNDO and REDO", function() {

            system.actions.MOVE(system, element, component, 10, 10, false);
            system.actions.COMPLETE(system, element);

            const rules = css.mergeRules(css.aquireCSS(element, component));
            rules.props.left.should.equal(10);
            rules.props.position.should.equal("relative");
            style.left.should.equal("10px");
            style.top.should.equal("10px");

            system.actions.MOVE(system, element, component, 20, 20, false);
            system.actions.COMPLETE(system, element);

            style.left.should.equal("30px");
            style.top.should.equal("30px");

            system.actions.UNDO(system);

            return env.tO(100).then(() => {
                    style.left.should.equal("10px");
                    style.top.should.equal("10px");
                    system.actions.REDO(system);
                })
                .then(env.tO)
                .then(() => {
                    style.left.should.equal("30px");
                    style.top.should.equal("30px");
                    system.actions.UNDO(system);
                })
                .then(env.tO)
                .then(() => {
                    style.left.should.equal("10px");
                    style.top.should.equal("10px");
                });
        });
    });
}