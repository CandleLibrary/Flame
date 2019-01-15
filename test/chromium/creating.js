function CREATION(system, env) {
    const css = system.css;

    describe("Handle the creation of elements in the UI", function() {
        let component, element, style, rect, input;

        beforeEach(async () => {
            //const { comp } = await env.loadTestComponentA();
            //component = comp;
            //element = component.query("span");
            //input = element.nextSibling.childNodes[1];
        });

        afterEach(() => system.project.reset());

        it("Creates unbound elements in the main ui.", async function() {
            this.slow(1000)
            
            await env.tO(5);

            system.actions.CREATE_ELEMENT(
                system,
                system.ui.master_component,
                system.ui.master_component.query("div"),
                "div",
                20, 20, 100, 50);

            await env.tO(5);

            const element = system.ui.master_component.query("div").firstChild;

            if (!element)
                throw new Error("failed to create component on master component");

            const style = system.ui.master_component.window.getComputedStyle(element);
            const rules = css.mergeRules(css.aquireCSS(element, system.ui.master_component));

            style.left.should.equal("20px");
            style.top.should.equal("20px");
            style.width.should.equal("100px");
            style.height.should.equal("50px");
        });

        it("Transfers elements between components.", async function() {
            this.slow(1000)

            const {comp : compa} = await env.loadTestComponentA();
            const {comp : compb} = await env.loadTestComponentB();

            await env.tO(5);

            let elementA = compa.query("span");
            let elementB = compb.query("div");

            compa.window.document.body.children[0].children.should.have.lengthOf(9)
            compb.window.document.body.children[0].children.should.have.lengthOf(9)

            const element = system.actions.TRANSFER_ELEMENT(system, compb, elementB, elementA, 50, 50);

            await env.tO(5);

            compa.window.document.body.children[0].children.should.have.lengthOf(8);
            compb.window.document.body.children[0].children.should.have.lengthOf(10);

            const style = system.ui.master_component.window.getComputedStyle(element);
            const rules = css.mergeRules(css.aquireCSS(element, system.ui.master_component));

            style.left.should.equal("50px");
            style.top.should.equal("50px");
        })

        it("Copies element from one component to another.", async function() {
            this.slow(1000)
            
            const {comp : compa} = await env.loadTestComponentA();
            const {comp : compb} = await env.loadTestComponentB();

            await env.tO(5);

            let elementA = compa.query("span");
            let elementB = compb.query("div");

            compa.window.document.body.children[0].children.should.have.lengthOf(9)
            compb.window.document.body.children[0].children.should.have.lengthOf(9)

            const element = system.actions.TRANSFER_ELEMENT(system, compb, elementB, elementA, 50, 50, true);

            await env.tO(5);

            compa.window.document.body.children[0].children.should.have.lengthOf(9);
            compb.window.document.body.children[0].children.should.have.lengthOf(10);

            const style = system.ui.master_component.window.getComputedStyle(element);
            const rules = css.mergeRules(css.aquireCSS(element, system.ui.master_component));

            style.left.should.equal("50px");
            style.top.should.equal("50px");
        })   
    });
}
