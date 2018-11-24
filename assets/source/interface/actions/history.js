export function UNDO(system){
	system.docs.stepBack();
}

export function REDO(system){
	system.docs.stepForward();
}