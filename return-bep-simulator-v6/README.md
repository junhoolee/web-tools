# Return BEP Simulator v6

반품 손익분기점(Break-Even Point) 시뮬레이터. 반품 정책 변경이 수익에 미치는 영향을 정량적으로 분석하는 CFO-Grade 의사결정 도구.

## Model Overview

### Weibull CDF Return Rate

반품률은 Weibull 누적분포함수로 모델링:

```
R(w) = R∞ × (1 - exp(-(w/λ)^k))
```

- `R∞`: 최대 반품률 (asymptotic return rate)
- `k`: shape parameter (반품 속도 곡선 형태)
- `λ`: scale parameter (14일 반품률에서 역산)
- `w`: 경과 일수

Lambda 캘리브레이션 (14일 반품률 r14 기준):

```
λ = 14 / (-ln(1 - r14/R∞))^(1/k)
```

### BEP Formula

```
BEP = G / (G + L)
```

- `G = Price - COGS` (건당 매출이익)
- `L` = 건당 반품손실 (배송비 + 검수비 + 포장비 - 잔존가치 + COGS조정)

BEP Day (반품률이 BEP에 도달하는 날):

```
bepDay = λ × (-ln(1 - BEP/R∞))^(1/k)
```

### Per-Unit Contribution

```
ContribPerUnit = G × (1 - R(w) / BEP)
```

## Key Assumptions

1. 반품률은 Weibull CDF를 따름 (단조 증가, 포화)
2. 14일 반품률(r14)로 λ를 캘리브레이션
3. 가격 탄성(priceElast)은 멱함수 적용: `adjVol = baseVol × (price/refPrice)^ε`
4. 반품 윈도우 탄성(retElast)은 동일 구조
5. 물류비는 볼륨 비율의 멱함수로 스케일링
6. Scenario B는 독립적 볼륨 계산 (v6 개선)

## Data Sources

| Parameter | Default | Source |
|-----------|---------|--------|
| Reference Price | $550 | 기준 가격대 |
| Reference Window | 30일 | 업계 표준 |
| Price Elasticity | -1.2 | 시장 조사 추정치 |
| Return Elasticity | 0.20 | 내부 데이터 분석 |
| Cost Scale | -0.25 | 규모의 경제 계수 |
| Salvage Scale | 0.15 | 잔존가치 볼륨 효과 |

## Input Ranges

| Field | Min | Max | Unit | Description |
|-------|-----|-----|------|-------------|
| price | > 0 | - | $ | 판매가 |
| cogs | >= 0 | < price | $ | 매출원가 |
| Rinf | 0 (excl) | 1 (incl) | ratio | 최대 반품률 |
| r14 | 0 (excl) | < Rinf | ratio | 14일 반품률 |
| k | > 0 | - | - | Weibull shape |
| retWindow | > 0 | - | days | 반품 윈도우 |
| baseVol | > 0 | - | units | 기본 판매량 |
| recoveryRate | 0 | 1 | ratio | 회수율 |
| fixedCost | 0 | - | $/month | 월 고정비 |

## Validation Procedures

1. **Build Check**: `npm run build` — TypeScript 타입 체크 + Vite 빌드
2. **Unit Tests**: `npm test` — Vitest (weibull, cost, volume, sensitivity, computeAll)
3. **Input Clamping**: FieldInput 컴포넌트에서 blur 시 min/max 클램핑
4. **Boundary Guards**: computeAll 진입 시 유효성 검증 (Korean 에러 메시지)

## Recovery Paths

| Path | Formula |
|------|---------|
| Salvage | `L = COGS + Ops - SalvageValue` |
| Refurb | `L = COGS×(1-recoveryRate) + Ops + RefurbCost` |
| Mixed | Weighted blend of salvage + refurb paths |

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v6.0 | 2026-03-03 | Initial v6 — reason segmentation, CXV, tornado sensitivity |
| v6.1 | 2026-03-04 | CFO-Grade: build fix, independent B volume, input validation, unit tests, domain docs, fixedCost |

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7.3 + Tailwind CSS 4.2
- Chart.js 4 (react-chartjs-2)
- Vitest 4 (unit testing)
