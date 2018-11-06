export function UNDO(system){
	system.doc_man.stepBack();
}

export function REDO(system){
	system.doc_man.stepForward();
}