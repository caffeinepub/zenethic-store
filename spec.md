# Zenethic Store

## Current State
Full-stack eCommerce with PIN admin, Stripe, INR pricing, orders. Backend uses non-stable Map storage that resets on upgrade.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend: stable var storage for products, orders, nextProductId, nextOrderId

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend with stable arrays/vars
2. Redeploy
