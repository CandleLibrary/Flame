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