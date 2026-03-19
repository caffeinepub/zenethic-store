# Zenethic Store

## Current State
ProductCard shows image, name, price, description, qty stepper and Add to Cart button in a grid card. No product detail view exists.

## Requested Changes (Diff)

### Add
- ProductDetailModal component: opens when user clicks on a product image or card
- Modal shows: large product image, name, category badge, price in ₹, full description, qty stepper, Add to Cart button -- Amazon/Flipkart style

### Modify
- ProductCard: clicking the image (or product name) opens the detail modal instead of nothing

### Remove
- Nothing removed

## Implementation Plan
1. Create ProductDetailModal.tsx with a Dialog showing full product detail
2. In ProductCard, add onClick on image area to open the modal
3. Pass selected product state up or manage locally in ProductCard
