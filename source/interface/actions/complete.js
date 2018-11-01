import wick from "wick";
import { CacheFactory } from "./cache";
export function COMPLETE(system, element, component) {
	//Diff changed documents, clear caches, close opened dialogs if necessary
	if(element)
		CacheFactory.clear(element);
}