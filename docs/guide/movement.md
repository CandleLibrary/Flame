Movement types:

Normal Flow

    Block or inline formating context
    Block laid out vertical with margin separation

## 3 Positioning models:

Normal Flow
- relative, static, sticky

Float
- floats (left | right)

Absolute
- fixed, absolute


### Relative

First laid out according to normal flow, then offset. 
```
left = -right
if (left == right == auto) left = right = 0
if (left == auto) left = -right
if (right == auto) right = -left
if (right != auto && left != auto) (direction == ltr) ? right = -left : left = -right

if (top == bottom == auto) top = bottom = 0
if (top == auto) top = -bottom
if (bottom == auto) bottom = -top
if (bottom != auto && top != auto) bottom = -top
```


### Absolute 

#### Width
l + ml + bl + pl + w + pr + br + mr + r = width

assuming (ltr)

if(left == width == right == auto) 
    margin-left = (margin-left == auto) ? 0 : margin-left
    margin-right = (margin-right == auto) ? 0 : margin-right
    left = default position
    width = shrunk to fit
    right = -left

if(left == width == right == !auto)
    ml = mr = (containing_width - (l + r + w + bp))/2
    if(ml < 0|| mr < 0)
        ml = 0 
        mr = (containing_width - (l + r + w + bp))

if(l == width == auto && right !== auto)
    width = shrunk to fit
    left = solve

if(r == width == auto && l !== auto)
    width = shrunk to fit
    r = solve

if(l == auto && width == right !== auto)
    left = solve

if(r == auto && width == l !== auto)
    r = solve

if(width == auto && r == l !== auto)
    width = solve

