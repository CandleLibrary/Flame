# FLAME Roadmap

## version 1.0.0
- Documentation
- Website
- Accessibility Modes
    - Low Visibility
    - Color Blind
    - Touch Mode

...

## version 0.5.0
- 3D CSS handling. Need to add 3D transform to CFW CSS.


## version 0.4.0
- Project explorer. File explorer.

## version 0.3.0 - Initial usable release
- Add Animation timeline. Animation element tagging. CSS and Glow animation integration.
- Transitions planning/mapping.
- Page organization.
- Create standalone executable.

## version 0.2.0

### Tools
- Shortcuts to move elements vertically ie z-index
- Image import
- Grouping Components and viewport bookmarks.
- Link mapping. Links should cause viewport to jump to relevant element. Links - should be relative to project root.
- Rulers

### UI
- Show the dimensions of the component
- UI tagging - Tagging certain UI to groups of components. + position of UI.  
- Style UI system - Grid, Border (radius etc), SVG, Gradients, Animation.
- Text UI should seamlessly appear and disappear depending on need.
- USE WebGL for line rendering

### ISSUES
- UI ATM feels clunky, unrefined, and in the way.

## version 0.1.0 - Base Functionality - Current WIP

### Tools
- [ ] BoundingBox/Draw creation of new elements/components. Should popup best guess for type of element.
- [ ] Step based adjustment mode.
- [ ] Allow center, left, right alignment for groups of elements.
- [ ] Allow multi selection
- [ ] Allow distribution alignment.

### UI
- [ ] Project management UI.
- [ ] Pop-up focus on individual elements.
- [ ] UI for background color, images and gradients
- [ ] UI for border handling.
- [ ] UI for fonts.

### File Handling
- [ ] Auto Save.
- [x] Saving and loading of files.
- [x] Change history, undo/redo.

### ISSUES
- [ ] Element jumps when initially moved
- [ ] Cursor alignment off in text editor
- [ ] TEXT `data` chars end up messing up elements
- [ ] Elements disappear when moved outside the bounds of a component
- [ ] UI boxes jump around when cursor hits certain regions
- [ ] Setting Background color does not yield instance change in component.
- [ ] Not all UI components load.  
- [ ] Component and UI header too verbose. Need to use icons and menus to reduce their presence.
- [ ] Delete/Backspace action in text edit does not update elements.

d3
