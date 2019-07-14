import * as css from "@candlefw/css";
import integrate_element from "./nodes/element.mjs";
import integrate_text from "./nodes/text.mjs";
import integrate_scope from "./nodes/scope.mjs";
import integrate_style from "./nodes/style.mjs";
import integrate_runtime_scope from "./runtime/scope.mjs";
/*
	Integrates Flame systems with Wick HTML nodes
*/
export default async function(integrating_wick, env) {

    //Replacing the compile environement references to css elements ensures that all css data types are consistent throughout the flame environment
    /*integrating_wick.compiler_environment.stylesheet = css.stylesheet;
    integrating_wick.compiler_environment.stylerule = css.stylerule;
    integrating_wick.compiler_environment.ruleset = css.ruleset;
    integrating_wick.compiler_environment.compoundSelector = css.compoundSelector;
    integrating_wick.compiler_environment.comboSelector = css.comboSelector;
    integrating_wick.compiler_environment.typeselector = css.typeselector;
    integrating_wick.compiler_environment.selector = css.selector;
    integrating_wick.compiler_environment.idSelector = css.idSelector;
    integrating_wick.compiler_environment.classSelector = css.classSelector;
    integrating_wick.compiler_environment.attribSelector = css.attribSelector;
    integrating_wick.compiler_environment.pseudoClassSelector = css.pseudoClassSelector;
    integrating_wick.compiler_environment.pseudoElementSelector = css.pseudoElementSelector;
    integrating_wick.compiler_environment.parseDeclaration = css.parseDeclaration;*/

    const
        $filter = integrating_wick("<f/>"),
        $scope = integrating_wick("<scope/>"),
        $slot = integrating_wick("<slot/>"),
        $void = integrating_wick("<void/>"),
        $style = integrating_wick("<style></style>"),
        $svg = integrating_wick("<svg/>"),
        $container = integrating_wick("<container/>"),
        $import = integrating_wick("<link/>"),
        $pre = integrating_wick("<pre/>"),
        $element = integrating_wick("<div>test</div>"),
        $script = integrating_wick("<script></script>"),
        $link = integrating_wick("<a/>");

    await $link.pending;

    const
        filter_prototype = $filter.ast.constructor.prototype,
        scope_prototype = $scope.ast.constructor.prototype,
        slot_prototype = $slot.ast.constructor.prototype,
        void_prototype = $void.ast.constructor.prototype,
        style_prototype = $style.ast.constructor.prototype,
        svg_prototype = $svg.ast.constructor.prototype,
        container_prototype = $container.ast.constructor.prototype,
        import_prototype = $import.ast.constructor.prototype,
        pre_prototype = $pre.ast.constructor.prototype,
        element_prototype = $element.ast.constructor.prototype,
        text_prototype = $element.ast.children[0].constructor.prototype,
        script_prototype = $script.ast.constructor.prototype,
        link_prototype = $link.ast.constructor.prototype;

    env.wick.nodes = {
        filter : filter_prototype.constructor,
        scope : scope_prototype.constructor,
        slot : slot_prototype.constructor,
        void : void_prototype.constructor,
        style : style_prototype.constructor,
        svg : svg_prototype.constructor,
        container : container_prototype.constructor,
        import : import_prototype.constructor,
        pre : pre_prototype.constructor,
        element : element_prototype.constructor,
        script : script_prototype.constructor,
        link : link_prototype.constructor,
        text : text_prototype.constructor
    };

    integrate_element(element_prototype, env);
    integrate_text(text_prototype, element_prototype, env);
    integrate_scope(scope_prototype, env);
    integrate_style(style_prototype, env);

    integrate_runtime_scope((await $scope.mount()).constructor.prototype, env);



}
