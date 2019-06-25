import integrate_element from "./nodes/element.mjs";
import integrate_scope from "./nodes/scope.mjs";
import integrate_runtime_scope from "./runtime/scope.mjs";

/*
	Integrates Flame systems with Wick HTML nodes
*/
export default async function(integrating_wick, env){

	const 
		$filter = integrating_wick("<f/>"),
		$scope = integrating_wick("<scope/>"),
		$slot = integrating_wick("<slot/>"),
		$void = integrating_wick("<void/>"),
		$style = integrating_wick("<style></style>"),
		$svg = integrating_wick("<svg/>"),
		$container = integrating_wick("<container/>"),
		$import = integrating_wick("<import/>"),
		$pre = integrating_wick("<pre/>"),
		$element = integrating_wick("<div/>"),
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
		script_prototype = $script.ast.constructor.prototype,
		link_prototype = $link.ast.constructor.prototype;

	integrate_element(element_prototype, env);
	integrate_scope(scope_prototype, env);

	integrate_runtime_scope((await $scope.mount()).constructor.prototype, env);
}
