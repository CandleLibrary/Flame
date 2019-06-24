const fs = {};

/**
	Represents actions to save a file to disk. 
**/
export class FileBuilder {

    constructor(file_path) {
        this.handle = -1;
        this.stream = -1;
        this.offset = 0;

        try {
            this.handle = fs.openSync(file_path, "w+");
        } catch (e) {
            console.error(e);
        }
    }

    async writeWord(offset, word){
    	return await this.writeB(new Uint32Array([word]), offset, false);
    }

    writeB(buffer, off = this.offset, MOVE_OFFSET = true){
    	if(this.ready){
	    	return new Promise((res, rej)=>{
	    		fs.write(this.handle, buffer, 0, buffer.byteLength, off, (err, written)=>{
	    			if(err) return rej(err);
	    				
	    			if(MOVE_OFFSET)this.offset = off+written;

	    			res(off+written);
	    		});
	    	}).catch(e=>console.error(e));
    	}
    }

    writeS(string, off = this.offset, MOVE_OFFSET = true){
    	if(this.ready){
	    	return new Promise((res, rej)=>{
	    		fs.write(this.handle, string, off, "utf8", (err, written)=>{
	    			if(err) return rej(err);
	    				
	    			if(MOVE_OFFSET)this.offset = off+written;

	    			res(off+written);
	    		});
	    	}).catch(e=>console.error(e));
    	}
    }

    scanTo(byte_offset) {
        if (!this.ready) return;
    }

    close() {
        if (this.ready) {
        	try{
        		fs.closeSync(this.handle);
        	}catch(e){
        		console.error(e);
        	}
        }
    }

    get ready() { return this.handle !== -1; }
}
