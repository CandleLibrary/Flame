function DATA(system, env) {
    describe("File Handling", function() {
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

        after(() => { system.project.reset();});

        it("Should be able to load html file from file system and create a component in the main view.", 
            () => {

                system.ui.components.should.have.lengthOf(1);
                component.x.should.equal(20);
                component.y.should.equal(20);
            }
        );

        it("Saves all project data", (fin)=>{
            this.timeout(2000);
            //system.project.properties.project.bundle_files = true;

            system.project.save(path.resolve("assets/test/temp.fpd"), ()=>{
                system.project.reset();
                system.project.load(path.resolve("assets/test/temp.fpd"), ()=>{
                    fin();
                });
            });
        });
    });
}
