//Just for fun
function rB(){ //randomByte
    return (Math.random() * 245 + 10)|0;
}
function randomColor() {
    var r = ((Math.random() * 240) + 15)|0;
	return `rgb(${rB()},${r},${r})`;
}

//Compares code with argument list and returns true if match is found, otherwise false is returned 
function compareCode(code) {
	var list = arguments;
	for (var i = 1, l = list.length; i < l; i++) {
		if (list[i] === code) return true;
	}
	return false;
}

//Returns true if code lies between the other two arguments 
function inRange(code) {
	return (code > arguments[1] && code < arguments[2]);
}
//The resulting array is used while parsing and tokenizing token strings
export var string_parse_and_format_functions = (function() {
	var array = [{
			type: "number",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code, text) {
				if (inRange(code, 47, 58)) {
					code = text.charCodeAt(1);
					if (compareCode(code, 66, 98, 88, 120, 79, 111)) {
						return 2;
					}
					return 1;
				} else if (code == 46) {
					code = text.charCodeAt(1);
					if (inRange(code, 47, 58)) {
						return 2;
					}
				}
				return 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				return inRange(code, 47, 58) || code === 46
			},
			format(token) {
				token.color = "rgb(20,40,180)";
			}

        }, {
			type: "identifier",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return (inRange(code, 64, 91) || inRange(code, 96, 123)) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				return inRange(code, 47, 58) || inRange(code, 64, 91) || inRange(code, 96, 123) || compareCode(code, 35, 36, 38, 45, 95);
			},
			format(token) {

				//token.color = randomColor();
			}

        }, {
			type: "white_space",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return (code === 32 || code === 9) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				return code === 32 || code === 9;
			},
			format(token) {
				//console.log(token)
			}

        }, {
			type: "open_bracket",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return compareCode(code, 123, 40, 91) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Single character, end comes immediatly
				return false;
			},
			format(token) {
				token.color = "rgb(100,100,100)";
			}

        }, {
			type: "close_bracket",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return compareCode(code, 125, 41, 93) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Single character, end comes immediatly
				return false;
			},
			format(token) {
				token.color = "rgb(100,100,100)";
			}

        },

		{
			type: "operator",
			//Initial check function. Return index offset to start for scan. If 0 is returned then the parser will move on to the next check function
			check(code) {
				return compareCode(code, 42, 43, 60, 61, 62, 92, 38, 37, 33, 94, 124, 58) ? 1 : 0;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Single character, end comes immediatly
				return false;
			},
			format(token) {
				token.color = "rgb(205,120,0)";
			}

        }, {
			type: "symbol", //Everything else should be generic symbols
			check(code) {
				return 1;
			},
			// Scan for end of token. Return false if character not part of token
			scanToEnd(code) {
				//Generic will capture ANY remainder character sets.
				return false;
			},
			format(token) {
				token.color = "red";
			}
        }
    ];

	//This allows for creation custom parsers and formatters based upon this object. 
	array.clone = function() {
		return string_parse_and_format_functions();
	};

	return array;
});