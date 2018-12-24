function LOAD(system, env) {
    describe("Loading components", function() {
        this.slow(2000)

        after(()=>{
            //Reset the ui, doc, and components

           // system.docs.reset();

        })

        it("Should be able to load html file from file system and create a component in the main view.", function() {
            //Load in test component
            let uri = path.resolve(env.url);

            system.docs.load(uri);

            let doc = system.docs.get(uri);

            doc.should.not.equal(undefined);

            return new Promise(res => {
                doc.bind({
                    documentReady: (data) => {
                        data.should.not.equal(undefined);

                        system.actions.CREATE_COMPONENT(system, doc, { x: 20, y: 20 });

                        setTimeout(function() {
                            //system.ui.components.should.have.lengthOf(1);
                            system.ui.components[0].x.should.equal(20);
                            system.ui.components[0].y.should.equal(20);
                            res();
                        }, 100);

                    }
                });
            });
        });
    });
}