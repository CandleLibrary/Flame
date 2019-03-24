module.exports = function(chia, app, client, flame){
	describe("Basic User Interaction", function(){
		it.skip("Allows the view to be zoomed in and out", function(){
			
		})
		it("Allows the view to be panned vertically and horizontally", function(){
			let client = this.app.client;
			/*

			client.actions([
				{
					type:"pointer",
					id:"pan",
					parameters:{pointerType:"mouse"},
					actions:[
						{type:"pointerDown", button:2},
						{type:"pointerMove", duration:300, x:60, y: 400},
						{type:"pointerUp", button:0},
					]}
			])

			client.actions().then(e=>{
				console.log("!!!")
			});
			*/
			client.buttonDown(1);
			client.moveTo(null, 300, 300);
			client.buttonUp(1)
			return client.getCssProperty("#main_view","transform").then(e=>{
				e.value.should.equal("matrix(1, 0, 0, 1, 300, 300)");
			})
		})

		it.skip("Allows components to be moved", function(){
			client.moveTo()
		})
	})
} 