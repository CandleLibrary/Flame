let CSSRule = require("wick").core.css.prop;

/**
 * @brief This will replace the default rule.merge with a reactive system that updates the respective selector. 
 */
CSSRule.prototype.merge = function(rule) {
    if (rule.props) {
        for (let n in rule.props) {
            ((n) => {
                Object.defineProperty(this.props, n, {
                    configurable:true,
                    enumerable: true,
                    get: () => {
                        return rule.props[n];
                    },
                    set: (v) => {
                        rule.props[n] = v;
                        if(rule.root)
                            rule.root.updated();
                    }
                });
            })(n);
        }
        this.LOADED = true;
    }
};

export {CSSRule};