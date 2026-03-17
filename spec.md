# Zenethic Store

## Current State
The backend uses `Map.empty<>()` with plain `let` bindings — these are NOT stable, so all products, orders, and cart data are wiped on every deployment. Cancelled orders placed yesterday are no longer visible.

## Requested Changes (Diff)

### Add
- Stable storage for all data (products, orders, carts, counters, UPI ID, Stripe config) so data persists permanently across deployments.

### Modify
- Backend: Change all `let` map bindings and counter/config vars to use stable storage so data survives upgrades.
- Cancelled orders must remain permanently visible in My Orders with "Cancelled" status.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate Motoko backend with stable vars for products, orders, carts, nextProductId, nextOrderId, upiId, stripeConfiguration.
2. Ensure cancelOrder sets status to "cancelled" permanently (already implemented, just needs stable backing).
3. Frontend already shows cancelled orders — no frontend changes needed.
