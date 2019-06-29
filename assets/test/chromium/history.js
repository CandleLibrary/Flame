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

        it("Basic history commands UNDO and REDO", async function() {

            system.actions.MOVE(system, component, element, 10, 10, false);
            system.actions.COMPLETE(system, element);

            const rules = css.mergeRules(css.aquireCSS(component, element));
            rules.props.left.should.equal(10);
            rules.props.position.should.equal("relative");
            style.left.should.equal("10px");
            style.top.should.equal("10px");

            system.actions.MOVE(system, component, element, 20, 20, false);
            system.actions.COMPLETE(system, element);

            style.left.should.equal("30px");
            style.top.should.equal("30px");

            system.actions.UNDO(system);

            await env.tO(100)

            style.left.should.equal("10px");
            style.top.should.equal("10px");
            system.actions.REDO(system);

            await env.tO(200)

            style.left.should.equal("30px");
            style.top.should.equal("30px");
            system.actions.UNDO(system);

            await env.tO(200)

            style.left.should.equal("10px");
            style.top.should.equal("10px");
        });
    });
}
