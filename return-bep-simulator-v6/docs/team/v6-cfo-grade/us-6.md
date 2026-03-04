# US-6: FixedCost Feature Completion

## User Story
As a pricing analyst, I want to input fixed costs and see the break-even volume, so that I can determine the minimum sales quantity needed to cover both fixed and variable costs.

## Acceptance Criteria
- [ ] AC-6.1: `FixedCostSection` renders correctly in the sidebar and accepts `fixedCost` input
- [ ] AC-6.2: `computeAll` calculates `bepVolume = fixedCost / contribPerUnit` when `fixedCost > 0`
- [ ] AC-6.3: `SimulatorDerived` includes `bepVolume?: number` field
- [ ] AC-6.4: `bepVolume` is displayed in the UI (MainPanel or dedicated section)
- [ ] AC-6.5: When `fixedCost` is 0, `bepVolume` is `undefined` or not displayed
- [ ] AC-6.6: When `contribPerUnit <= 0`, an appropriate Korean warning message is shown instead of division-by-zero

## Notes
- Depends on US-1 (type fix) — `fixedCost` must exist in `SimulatorInputs` first
- `contribPerUnit` is already computed in `computeAll`: `G * (1 - Rw / BEP)`
- `bepVolume` represents the minimum units to sell to cover fixed costs at the given margin and return rate
