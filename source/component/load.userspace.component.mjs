import { CREATE_COMPONENT } from "../interface/actions/create.mjs";
//Used to track components. Serve's as the local components filename;
var component_id = 0;

export default function (scope, env, x = 100, y = 100, w = 0, h = 0){
	
	scope.ast.origin_url.path += component_id++;

    const doc_id = env.data.docs.loadFile(scope.ast.origin_url.pathname + ".html", true);

	const doc = env.data.docs.get(doc_id);

    doc.data = scope.ast;

    CREATE_COMPONENT(env, doc, x, y, w, h);
}
