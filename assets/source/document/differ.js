/**
 * Uses a diff algorithm to create a change map from one document version to another. Vesions are stored in the project as a change history. 
 */
export class DocumentDifferentiator{
	createDiff(old, new_){
		if(old == new_) return;

		return {
			old,
			new:new_
		}
	}

	convert(doc, diff){
		doc.fromString(diff.new, false);
	}	

	revert(doc, diff){
		doc.fromString(diff.old, false);
	}
}