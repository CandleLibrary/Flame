<sub>version 0.1.0-a</sub>

# Flame

## THE WEB TECHNOLOGY EDITOR

CandleFW flame is the lynchpin system that combines all of CandleFW libraries into a single, comprehensive website editing package.

Features

- Integration with **wick** & **radiate** to provide on-demand editing capabilities for web components. 

-  - CSS - HTML - JS editing with a WYSIWYG in-browser editor. 

-  - Customized Animation sequencer using **glow**. 

- Integration with **lantern** allows file saving, asset history, 


USAGE

Flame can be integrated with any existing **Radiate** or **Wick** project by passing the ``wick`` / ``radiate`` object to the ``flame`` function. 


```javascript

wick(`<div> MY radiate object </div>`)

flame(wick, options); // now we have a flaming wick!

```

```javascript

flame(radiate(), options); // now we are radiating flames!

```
- 
- Element Selection
- Glow Animation Keyframe System
- Per File Updating with git commits
- Smart CSS Updating With lazy write back
- Branching undo/redo tree. 