### Tasks 
#### Things that have been, need to be, or are currently being worked on.

[] Ongoing - Documentation

[] Rebuild the activation actions to create a facsimile of the on the screen contents that can be 	manipulated, instead of targeting individual components.

[] Use outlines to define component start elements. 

[] Create a simple button interface that allows activating text editors for HTML, CSS, JS, DATA. 

[] Create save back to file / DB actions. 

[] Implement History 

[] Need a way to toggle editors:
	[] Make each editor the recipient of a state object that determines the position and display of the editors. Allow other editors to modify this state. Think box widget for the editors. 
	
[] Enable Element Click/Highlight through
	[] Turn element selecton into a single function
	[] Use a different method to the information about the current element under consideration 
		[] cache element box areas, for instance, which would require cache invalidation methods
	[] Us a method to considere alternatives if the element returned is already selected - 
		need to keep track of cursor movement to allow z-list click through

[] Prevent Highlight from operating when elements are being manipulated

[] Prevent incomplete style elements from killing the interface

[] Allow bindings to be manipulated

[] Setup CSS Editor
	Renaming class should apply globally

	[] Sort Editor by CSS Selectors, allow maximis and minimize of these list. Think google chrome developer tools. Allow a single list that coallates all these values. Allow this coallation to be formed into a new rule with a specific selector for the given element. 

	[] Create buttons for common actions - Color / Gradients; Image selection; Font family; Position conversion; Grid layouts. 

[] Setup HTML Editor
	[] Prevent Sub-Scope contents from showing up. Scopes should only be accessed as the top level part of a component. This implies a way to access the scopes/components without using the active component. Create a component gallery. Allow a custom CSS to be applied to these components in the gallery view. 

	[] Change the Text area into a list of elements that can update the highleted state of the elements. 


[] Setup Data Editor
	[] Create a JSON complaint KEY VALUE system
	[] Create a DB connector plugin system.
	[] Data applies to the Component scope, not to its child elements. Allow models to be created / swapped out for the component to re-initialize around

[] Setup JS Editor

[] Design Theme

[] change "widget" action to "user_update"

[x] add "element_selected" action 

[] new in identifiers is not be recognized as a part of the identifier

[] prevent widget event from being thrown twice during element selection

[] Prevent movement updates from corrupted CSS values with Infinity and NaN

## Misc Notes:

UI_Controllers represent large UI components that can be stacked, presented, and hidden from the users view. Think layers / histogram / and effects panel in Photosop.
	
	Objects UI_Controllers Receive

		Widget - Event, When element is selected / updated
			x, y, 
		env - the flame environment object

		loading - built_in - see cfw wick compoenent lifecycle events

		changed - event, thrown when a new element is selected

		actions - EVENTS that take on the form (env, component, element, ...[values]) that update the state of the given component / element. See action list

		this.ui

Environment Object
	UI - Access to ui objects
		comp - access to component objects
			active - the active component and elements
				element - the most active element of the active elements
				elements - list of active elements [todo]
				component - the active component
					local_css - list of all css objects that affect elements of the component
						see candlefw css style sheets.





# CSS Handling



CSS data is contained with a node based structure where each node represents one of 5 different constructs:
Stylesheet
Stylerule
Styleprop

UIStyleSheet
UIStylerule
UIStyleprop.

A Scope will have access to the Stylesheet objects defined within it's own reference frame inside &nblt;style&nbgt; elements. A Flame component is able to access these CSS nodes and present them to manipaltion to provide desired transform effects. If there is no style data available to the component when it is needed, and ad hoc stylesheet object is created and attached to both the COMPONENT. This stylesheet is known as the LOCAL_COMPONENT_CSS and must be differentiated from stylesheets defined from user and scope definitions. Information in the LOCAL_COMPONENT_CSS may be lost if the user is not made aware that the data must be saved in order to benefit from it's inclusion. This does not occur with Scope and User defined stylesheets, since information from these are already pulled from user data stores. LOCAL_COMPONENT_CSS has the highest precedence of all the stylesheet objects.


# Flame data


Backup of data is 
