import { CacheFactory } from "./cache";

export function COMPLETE(system, element) {
	
	//Diff changed documents, clear caches, close opened dialogs if necessary
	if(element)
		CacheFactory.clear(element);

	system.docs.seal();
	system.history.seal();
}