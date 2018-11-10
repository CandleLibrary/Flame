let Application = require("spectron").Application;
let path = require("path");
const electronPath = require('electron');
const chai = require("chai");
chai.should();
const assert = chai.assert;

describe("App Launch", function() {
    this.timeout(10000);
    
    beforeEach(function() {
        this.app = new Application({
            path: electronPath,
            args: [path.join(__dirname, "..")]
        })

        return this.app.start();
    })
    afterEach(function() {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    })
    it('shows an initial window', function() {
        return this.app.client.getWindowCount().then(function(count) {
            count.should.equal(1);
            // Please note that getWindowCount() will return 2 if `dev tools` are opened.
            // assert.equal(count, 2)
        })
    })
})