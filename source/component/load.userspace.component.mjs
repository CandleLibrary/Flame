import { CREATE_COMPONENT } from "../interface/actions/create.mjs";


export default function (scope, env){

    const doc_id = env.data.docs.loadFile(scope.ast.origin_url.pathname, true);

	const doc = env.data.docs.get(doc_id);

    doc.data = scope.ast;

    CREATE_COMPONENT(env, doc, 0, 0);
}
