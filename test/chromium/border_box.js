function BB (system, env){
	const css = system.css;
	const ui = system.ui;

	describe("Handling border box of elements", function(){
		this.slow(1000);
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

		it("Allows arbitrary adjustment of height and width of an element.", function(){
			let rect = element.getBoundingClientRect(); 
			system.actions.SETHEIGHT(system, element, component, 60);
			system.actions.SETWIDTH(system, element, component, 40);
			rect = element.getBoundingClientRect();
			
			rect.height.should.equal(60);
			rect.width.should.equal(40);

			system.actions.SETDELTAHEIGHT(system, element, component, 60);
			system.actions.SETDELTAWIDTH(system, element, component, 80);
			rect = element.getBoundingClientRect();
			rect.height.should.equal(120);
			rect.width.should.equal(120);

			system.actions.RESIZEBR(system, element, component, -20, -20);
			rect = element.getBoundingClientRect();
			rect.height.should.equal(100);
			rect.width.should.equal(100);

			system.actions.RESIZEBL(system, element, component, -20, -20);
			rect = element.getBoundingClientRect();
			rect.height.should.equal(80);
			rect.width.should.equal(120);

			system.actions.RESIZETL(system, element, component, -20, -20);
			rect = element.getBoundingClientRect();
			rect.height.should.equal(100);
			rect.width.should.equal(140);

			system.actions.RESIZETR(system, element, component, -20, -20);
			rect = element.getBoundingClientRect();
			rect.height.should.equal(120);
			rect.width.should.equal(120);
		});

		it("Moving padding adjusts width simultanously to keep position relative to cursor and overall border-bx width constant.", function(){
			let rect = element.getBoundingClientRect(); 
			system.actions.SETHEIGHT(system, element, component, 120, true);
			system.actions.SETWIDTH(system, element, component, 120);
			system.actions.RESIZEPADDINGTL(system, element, component, 20, 20);
			
			rect = element.getBoundingClientRect();
			style.paddingLeft.should.equal("20px");
			style.paddingTop.should.equal("20px");
			rect.height.should.equal(120);
			rect.width.should.equal(120);

			system.actions.RESIZEPADDINGBR(system, element, component, -20, -20);
			rect = element.getBoundingClientRect();
			style.paddingRight.should.equal("20px");
			style.paddingBottom.should.equal("20px");
			rect.height.should.equal(120);
			rect.width.should.equal(120);
		})
	})
}