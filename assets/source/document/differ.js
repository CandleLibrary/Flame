let diff = require("diff");

/**
 * Uses a diff algorithm to create a change map from one document version to another. Vesions are stored in the project as a change history. 
 */
export class DocumentDifferentiator{
	constructor(){

	}

	createDiff(old, new_){
		if(old == new_) return;
		return diff.diffChars(old, new_);
	}

	
}