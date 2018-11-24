function BB (system){
	const css = system.css;
	const ui = system.ui;

	describe("Handling border box of elements", function(){
		this.slow(1000)
		let component, element, style, rect, input;

		before(function(){
		 component = ui.components[0];
		 element = component.query("#main");
		 style = component.window.getComputedStyle(element);
		})

		it("Allows arbitrary adjustment of height and width of an element.", function(){
			let rect = element.getBoundingClientRect();

			let width = rect.width;
			let height = rect.height; 

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

			system.actions.RESIZEBR(system, element, component, -20, -20)
			rect = element.getBoundingClientRect();
			rect.height.should.equal(100);
			rect.width.should.equal(100);

			system.actions.RESIZEBL(system, element, component, -20, -20)
			rect = element.getBoundingClientRect();
			rect.height.should.equal(80);
			rect.width.should.equal(120);

			system.actions.RESIZETL(system, element, component, -20, -20)
			rect = element.getBoundingClientRect();
			rect.height.should.equal(100);
			rect.width.should.equal(140);

			system.actions.RESIZETR(system, element, component, -20, -20)
			rect = element.getBoundingClientRect();
			rect.height.should.equal(120);
			rect.width.should.equal(120);
		})

		it("Moving padding adjusts width simultanously to keep position relative to cursor and overall border-bx width constant.", function(){
			let rect = element.getBoundingClientRect();

			let width = rect.width;
			let height = rect.height; 

			system.actions.RESIZEPADDINGTL(system, element, component, 20, 20)
			rect = element.getBoundingClientRect();
			style.paddingLeft.should.equal("20px")
			style.paddingTop.should.equal("20px")
			rect.height.should.equal(120);
			rect.width.should.equal(120);

			system.actions.RESIZEPADDINGBR(system, element, component, -20, -20)
			rect = element.getBoundingClientRect();
			style.paddingRight.should.equal("20px")
			style.paddingBottom.should.equal("20px")
			rect.height.should.equal(120);
			rect.width.should.equal(120);
		})
	})
}