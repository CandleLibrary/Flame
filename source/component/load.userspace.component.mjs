import Component from "./component.mjs";

export default function (active_scope, env){

	const comp = new Component(active_scope);

	return comp;
}