# US-3: Input Validation & Clamping

## User Story
As an end user, I want invalid inputs to be automatically corrected and clearly communicated, so that the simulator never produces misleading results from out-of-range values.

## Acceptance Criteria
- [ ] AC-3.1: `FieldInput.tsx` clamps values to `[min, max]` on change via `Math.max(min, Math.min(max, num))`
- [ ] AC-3.2: `computeAll` validates `Rinf` is in range `(0, 1]` and returns Korean error if violated
- [ ] AC-3.3: `computeAll` validates `r14` is in range `(0, 1)` and `r14 < Rinf`
- [ ] AC-3.4: `computeAll` validates `retWindow > 0` and `baseVol > 0`
- [ ] AC-3.5: `computeAll` validates `recoveryRate` is in range `[0, 1]`
- [ ] AC-3.6: In Compare mode, `computeAll` validates `priceB > cogsB`
- [ ] AC-3.7: All validation error messages are in Korean (consistent with existing messages like "판매가를 입력하세요")

## Notes
- Current `FieldInput.tsx` (line 26) accepts any numeric value without clamping
- Existing validation in `computeAll` only checks `price > 0`, `price > cogs`, `r14 < Rinf`, `k > 0`
- Missing validation for `Rinf`, `retWindow`, `baseVol`, `recoveryRate` can produce NaN/Infinity in downstream calculations
