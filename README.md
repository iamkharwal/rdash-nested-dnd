#Problem Statement
You are tasked with building a nested list component where:
● Each item may contain sub-items (children).
● The items and sub-items should be reorderable via drag-and-drop, both:
○ within the same level, and
○ moved across levels (e.g., moving an item into another item's children).

#Requirements
1. Display a list of items. Each item may have zero or more children.
2. Implement drag-and-drop functionality such that:
○ Items can be reordered at the same level.
○ Items can be moved into another item’s sublist (i.e., become a child).
○ Items can be moved out of a sublist to a parent level.
3. Prevent circular structures (e.g., an item can't be dragged into one of its descendants).
