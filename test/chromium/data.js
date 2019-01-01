const timeoutP = (interval) => new Promise(res => setTimeout(res, interval));

function DATA(system, env) {
    const css = system.css;
    describe("File Handling", function() {
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

                return timeoutP(50);
            })
        );

        afterEach(() => system.project.reset());

        it("Should be able to load html file from file system and create a component in the main view.",
            () => {
                system.ui.components.should.have.lengthOf(1);
                component.x.should.equal(20);
                component.y.should.equal(20);
            }
        );

        it("Saves all project data", () => {
            this.timeout(2000);

            const project = system.project;
            project.defaults.component.height = 200;

            project.preferences.auto_save_interval = 200;
            project.preferences.bundle_files = true;
            const date = project.meta.creation_date;

            return env.loadTestComponentA()
                .then(v => {

                    const { comp } = v;

                    system.ui.components.should.have.lengthOf(2);
                    comp.x = 300;
                    comp.y = 300;

                    const element = comp.query("span");

                    system.actions.MOVE(system, element, comp, 10, 10, false);
                    system.actions.COMPLETE(system, element);

                    const rules = css.mergeRules(css.aquireCSS(element, comp));
                    rules.props.left.should.equal(10);
                    rules.props.position.should.equal("relative");
                    style = component.window.getComputedStyle(element);
                    style.left.should.equal("10px");
                    style.top.should.equal("10px");

                    system.actions.MOVE(system, element, comp, 20, 20, false);
                    system.actions.COMPLETE(system, element);

                    return system.project.save(path.resolve("test/temp.fpd"));
                })
                .then(() => {
                    system.project.reset();

                    project.preferences.auto_save_interval.should.equal(0);
                    system.ui.components.should.have.lengthOf(0);
                    return system.project.load(path.resolve("test/temp.fpd"));
                })
                .then(() => {

                    project.meta.creation_date.should.equal(date);
                    project.preferences.auto_save_interval.should.equal(200);
                    project.defaults.component.height.should.equal(200);

                    return env.tO(100);
                })
                .then(() => {
                    system.ui.components.should.have.lengthOf(2);

                    const comp = system.ui.components[1];
                    comp.x.should.equal(300);

                    const element = comp.query("span");
                    const rules = css.mergeRules(css.aquireCSS(element, comp));
                    rules.props.left.should.equal(30);
                    rules.props.position.should.equal("relative");
                    style = comp.window.getComputedStyle(element);
                    style.left.should.equal("30px");
                    style.top.should.equal("30px");

                    //Check that history state has been preserved. 
                    system.actions.UNDO(system);
                    return env.tO(50);
                })
                .then(()=>{
                    const comp = system.ui.components[1];
                    const element = comp.query("span");
                    const rules = css.mergeRules(css.aquireCSS(element, comp));
                    //debugger
                    //rules.props.left.should.equal(10);
                    style = comp.window.getComputedStyle(element);
                    style.left.should.equal("10px");
                    style.top.should.equal("10px");

                    const fs = require("fs");

                    fs.unlinkSync(path.resolve("test/temp.fpd"));
                });
        });

        it("Auto-saves data at regular intervals", async function(){
            this.slow(7500);
            this.timeout(6000)

            const pd = path.resolve("./test");
            const name = "auto_save_test";
            const file = path.resolve(pd, name + ".fpd");

            console.log(pd, name, file)


            system.project.allow_auto_save = true;
            system.project.preferences.name = name;
            system.project.preferences.proj_data_directory = pd;
            system.project.preferences.auto_save_interval = 1;
            system.project.scheduleAutoSave();

            await env.tO(1020);

            system.project.preferences.auto_save_interval = 0;
            system.project.scheduleAutoSave();

            let stats = fs.statSync(file);


            if(!stats)
                throw "File Has not been saved";
            
            fs.unlinkSync(file);

            return true;
        })
    });
}