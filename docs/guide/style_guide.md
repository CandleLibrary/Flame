# Style Guide

Javascript Variables:

Variables and properties that are not methods or functions should be in `underscored_form`.
Variables that represent flags and boolean values should be in `UPPERCASED_UNDERSCORED_FORM`.
Method and function names should be in "camelCaseForm".
Constructor functions and class names should be in `CapitalizedCamelCaseForm`.

Semicolons:
	All statments that can end in semicolons in JS syntax should have a semicolon.


# Statements:

#### Nested statements should be indented by 4 space characters.


#### Multi-part statements that except either a single satement or a statement-block should be reduced to a single statement terminated with a semicolon whenever possible. 

e.g.
```javascript

if(true){
	object.property = value
}else{
	return
}


//should be reduced to 

if(true)
	object.property = value;
else 
	return;

``` 
> If this causes ambiguity then use brackets to clearify syntax
>e.g
>```js
>if(true)
>	if(false)
>		value = 1;
>	else 
>		value = 2;
>
>// should be refined to 
>
>if(true){
>	if(false)
>		value = 1;
>	else
>		value = 2;
>}		
>
>//OR - 
>
>if(true){
>	if(false)
>		value = 1;
>}else
>	value = 2;
>```

Files names should use `underscored_form`.
ES6 module files should have the extension `.mjs`.
All files should end with a newline character.
