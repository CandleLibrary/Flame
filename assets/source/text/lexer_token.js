import wick from "wick";

export class Token extends wick.core.lexer.constr {
	constructor(){
		super();
		this.IWS = false;
		this.prev_sib = null;
		this.next_sib = null;
	}

	reset(){
		super.reset();
		this.prev_sib = null;
		this.next_sib = null;
	}

	get prev_line(){
		if(this.prev_sib){
			if(this.prev_sib.IS_NEW_LINE)
				return this.prev_sib;
			return this.prev_sib.prev_line();
		}
		return null;
	}

	get next_line(){
		if(this.next_sib){
			if(this.next_sib.IS_NEW_LINE)
				return this.next_sib;
			return this.next_sib.prev_line();
		}
		return null;
	}

	get IS_NEW_LINE(){
		return this.type == this.types.new_line;
	}
}