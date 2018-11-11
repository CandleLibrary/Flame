let Application = require("spectron").Application;
let path = require("path");
const electronPath = require('electron');
const chai = require("chai");
const assert = chai.assert;
chai.should();

//Test Modules
let base = require("./base.js");

describe("Flame Application", function() {
    this.timeout(10000);
    
    before(function() {
        this.app = new Application({
            path: electronPath,
            args: [path.join(__dirname, "..")],
            webdriverOptions:{
                deprecationWarnings: false
            }
        })

        return this.app.start().then(c=>this.app.client.getWindowCount());
    })
    
    it('shows an initial window', function() {
        return this.app.client.getWindowCount().then(function(count) {
            count.should.equal(1);
        })
    })

    after(function() {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    })
    
    
    
    base(chai, this.app, this.app)
})
