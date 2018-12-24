import { TextFramework } from "@candlefw/charcoal";

/**
 * Uses a diff algorithm to create a change map from one document version to another. Versions are stored in the project as a change history. 
 */
export class DocumentDifferentiator {

    constructor() {
        this.oldTF = new TextFramework();
        this.newTF = new TextFramework();
    }

    createDiff(old, new_) {
        
        if (!old || !new_ || old == new_) return;
        
        const oldTF = this.oldTF;
        const newTF = this.newTF;

        oldTF.clearContents();
        newTF.clearContents();

        oldTF.insertText(old);
        oldTF.updateText();
        newTF.insertText(new_);
        newTF.updateText();

        let i = 0, j = 0, 
        	li = oldTF.length,
        	lj = newTF.length;

        const diffs = {new:[],old:[]};

        outer:
            for (i = 0, j = 0; i < li; i++) {

                if (j >= lj) {
                    //differences
                    diffs.push({ type: "old", index: i, text: oldTF.getLine(i).slice() });
                    continue;
                }


                if (oldTF.getLine(i).slice() == newTF.getLine(j).slice()) {
                    j++;
                    continue;
                }

                let root = j;

                for (let d = 1; j < lj; j++, d++) {
                	//*
                	if (j-root == 0 && i+d < li && oldTF.getLine(i+d).slice() == newTF.getLine(root+d).slice()){
                		for (let n = 0; n < d; n++) {	
                			diffs.new.push({index: root+n, text: newTF.getLine(root+n).slice()});
                        	diffs.old.push({index: i+n, text: oldTF.getLine(i+n).slice() });
                		}
                		i += d;
                        j = root+d+1;
                        continue outer;
                	}//*/

                    if (oldTF.getLine(i).slice() == newTF.getLine(j).slice()) {
                        const distance = j - i;
                        const l = Math.min(li, i + distance-1);
                        
                        for (let p = i+1; p < l; p++) {
                            if (oldTF.getLine(p).slice() == newTF.getLine(root).slice()) {

                                for (let n = i; n < p; n++) 
                                    diffs.old.push({index: n, text: oldTF.getLine(n).slice(), n:"AA"});
                                
                                i = p;
                                j = root + 1;
                                continue outer;
                            }
                        }

                        for (let n = root; n < j; n++) 
                            diffs.new.push({index: n, text: newTF.getLine(n).slice(), n:"AB", root});
                        
                        j++;
                        
                        continue outer;
                    }


                    if (j == lj - 1) {

                        for (let p = i; p < li; p++) {
                            if (oldTF.getLine(p).slice() == newTF.getLine(root).slice()) {
                                for (let n = i; n < p; n++)
                                    diffs.old.push({index: n, text: oldTF.getLine(n).slice(), n:"DD", root, p});

                                i = p;
                                j = root + 1;
                                continue outer;
                            }
                        }

                        diffs.new.push({index: root, text: newTF.getLine(root).slice()});
                        diffs.old.push({index: i, text: oldTF.getLine(i).slice() });
                        j = root + 1;
                        break;
                    }
                }
            }


        while (j < lj) {
            diffs.new.push({index: j, text: newTF.getLine(j).slice()});
            j++;
        }

        return diffs;
    }

    convert(doc, diff) {
    	let a = new TextFramework();
    	a.insertText(doc + "");

        a.updateText();


        for(let i = diff.old.length -1; i >= 0; i--){
            let d = diff.old[i];
            let line = a.getLine(d.index);
            a.line_container.remove(line);
            line.release();
        }

        if(a.length == 0) debugger

        for(let i = 0; i < diff.new.length;i++){
            let d = diff.new[i];
            a.insertText(d.text, d.index - 1);
            a.updateText();
        }

        a.updateText();

        console.log(a + "","\n_________________________________\n" , doc +"")

        doc.fromString(a.toString(), false);
    }

    revert(doc, diff) {

        let a = new TextFramework();
        a.insertText(doc + "");
        a.updateText();

        for(let i = diff.new.length -1; i >= 0; i--){
            let d = diff.new[i];
            let line = a.getLine(d.index);
            a.line_container.remove(line);
            line.release();
        }

        if(a.length == 0) debugger
        for(let i = 0; i < diff.old.length;i++){
            let d = diff.old[i];
            a.insertText(d.text, Math.max(0,d.index - 1));
            a.updateText();
        }   
        console.log(a + "","\n_________________________________\n" , doc +"")
        
        doc.fromString(a.toString(), false);
    }
}