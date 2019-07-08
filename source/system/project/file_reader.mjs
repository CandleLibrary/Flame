import URL from "@candlefw/url";
//const fr = new FileReader();
/**
    Represents actions to save a file to disk. 
**/
class $FileReader {

    constructor(file_path) {
        this.handle = -1;
        this.stream = -1;
        this.offset = 0;
        this.file_path = file_path;
        this.url = new URL(file_path);

        try {
            //read data from the file server


        } catch (e) {
            console.error(e);
        }
    }

    async string(encoding = "utf8") {
        if (this.ready) {
            return new Promise((res, rej) => {
                /*
                fs.readFile(this.handle, encoding, (err, string) => {
                    if (err)
                        return rej(err);
                    res(string);
                });
                */
            });
        } else
            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);

    }

    async readB(array_constructor = ArrayBuffer, byte_length = 0, off = this.offset, MOVE_OFFSET = true) {
        if (this.ready && byte_length > 0) {

            let data = await this.url.fetchText();
            debugger


            return new Promise((res, rej) => {
                let buffer = new Uint8Array(byte_length);

                /*
                fs.read(this.handle, buffer, 0, byte_length, off, (err, read) => {

                    if (err) return rej(err);

                    if (MOVE_OFFSET) this.offset = off + read;

                    if (array_constructor === ArrayBuffer)
                        res(buffer.buffer);
                    else if (array_constructor == Uint8Array)
                        res(buffer);
                    else if (array_constructor == Blob)
                        res(new Blob([buffer.buffer]));
                    else
                        res(new array_constructor(buffer.buffer));

                });
                */
            })
        } else
            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);
    }

    async readS(byte_length = 0, off = this.offset, encoding = "utf8", MOVE_OFFSET = true) {
        if (this.ready && byte_length > 0) {
            let data = "";
            try{
                data = await this.url.fetchText();
            }catch(e){
                console.error(e);
            }
            debugger
            return data;
        } else
            throw new Error(`Invalid file handle to resource ${this.file_path}; FileReader is not ready to be used`);
    }

    scanTo(byte_offset) {
        if (!this.ready) return;
        this.offset = byte_offset;
    }

    close() {
        if (this.ready) {
            try {
                debugger
                //fs.closeSync(this.handle);
            } catch (e) {
                console.error(e);
            }
        }
    }

    get ready() { return this.handle !== -1; }
}

export { $FileReader as FileReader };