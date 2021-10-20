- [ ] Move styles between components/stylesheets
- [ ] Re-order styles
- [ ] Choose selector to modify
- [ ] Combine updated style patches
- [ ] Modify position
- [ ] Modify color
- [ ] Modify gradient
- [ ] Modify background-color
- [ ] Re-implement History
- [ ] Modify Text
- [ ] Fix selection breakage when component is patched
- [ ] Remember last chosen selector for a givin element
- [ ] Use selected rule path to enable/disable features such as hover, @media, etc
- [X] Sort selector list by specificity 
- [X] Fix sync when source code is modified
- [ ] Allow transitions from new to old


Ensure root component element selector are handled as edge cases: 
- Detect if a root element is selected
- Use root.<class> for all class attributes to ensure the element is targeted



### Why do elements jump around when I make changes? 

Flame use technique called selector preview to maximize your WYSIWYG experience. In
short, when you select a rule to modify, that rule's properties gets the highest priority
while you modify your element, regardless of the rules original location or selector specificity 
in the cascade. When your changes are committed, the priority status of the rule is removed, 
and whatever the original cascade priorities were take effect again. This may cause elements to 
change and jump around as the original CSS ordering is implemented. 

If this something you want to avoid, consider the following tips to improve
your experience.

- Only modify selectors with the highest specificity. The selector list is ordered 

- Create a new selector that targets exclusively the selected element. 

## Rule Selector

Every rule is matched to the element through a specific selector.

## Selector Specificity

The rules are always sorted based on the specificity of the matching selector.