import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="float-right bg-transparent border-none text-xl cursor-pointer text-text-faint hover:text-text p-0 leading-none" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-1">변수 도움말</h2>
        <p className="text-xs text-text-muted mb-5">각 변수의 의미, 영향, 설정 근거, 비유를 확인하세요. 라벨에 마우스를 올리면 간단한 툴팁도 볼 수 있습니다.</p>

        <Section title="마진 설정">
          <Var title="판매가 (Price)"
            meaning="판매 단위당 수익. G(이익)과 가격 탄력성 모델의 기준점으로 사용됩니다."
            effects="단위 이익(G) 직접 변동 / BEP 변동 / 가격 탄력성 통해 판매량 변동 / 규모효과 연쇄 변동"
            basis="Gentle Monster 등 프리미엄 아이웨어 가격대. $550은 탄력성 공식의 기준가로도 사용."
            analogy="택시 미터기처럼, 요금을 올리면 주머니엔 더 들어오지만 손님이 다른 앱을 켜기 시작한다." />
          <Var title="매출원가 (COGS)"
            meaning="제품 한 개당 원가. G(이익)을 줄이면서 동시에 L(반품 손실)을 늘리는 이중 타격 구조입니다."
            effects="단위 이익(G↓) / 반품 손실(L↑) / BEP 변동 — 하나의 변수가 양쪽에 동시 작용"
            basis="$220은 판매가 $550 대비 ~60% 매출총이익률."
            analogy="댐의 균열처럼, 원가가 오르면 마진에서도 새고 반품 손실에서도 동시에 새어나간다." />
        </Section>

        <Section title="반품 비용">
          <Var className="cat-cost" title="배송비 — 왕복 (Round-trip Shipping)"
            meaning="반품 1건당 왕복 운송비." effects="반품 손실(L) 직접 증가 / BEP 하락"
            basis="미국/캐나다 UPS/FedEx 편도 $12~18 합산."
            analogy="헛걸음 택배처럼, 물건이 돌아오면 기름값을 내가 떠안는다." />
          <Var className="cat-cost" title="검수/재입고비 (Inspection & Restocking)"
            meaning="반품 제품의 상태 확인, 분류, 재포장 인건비." effects="L 직접 증가 / BEP 하락"
            basis="3PL 창고 반품 처리 단가 $15~25."
            analogy="공항 입국심사처럼, 재입고 전 신원 확인 비용." />
          <Var className="cat-cost" title="고객경험 가치 — CXV"
            meaning="관대한 반품 정책이 만드는 무형의 고객 가치를 건당 금액으로 환산한 값."
            effects="반품 손실(L) 감소 / BEP 상승(유리)"
            basis="재구매율 상승(30~40%), 브랜드 신뢰도, 입소문 효과, 고객 이탈 비용 절감."
            analogy="면세점 VIP 라운지처럼, 당장 수익은 아니지만 신뢰가 장기 매출로 돌아온다." />
        </Section>

        <Section title="반품 사유 세분화 (v6 신규)">
          <Var className="" title="반품 사유 분류" style={{ borderLeftColor: '#0d9488' }}
            meaning="반품 사유에 따라 비용 구조가 다릅니다. 불량, 변심, 파손으로 분류하여 정밀한 L을 산출합니다."
            effects="가중평균 L 변동 → BEP 변동."
            basis="업계 평균: 불량 20~40%, 변심 40~65%, 파손 10~20%."
            analogy="병원 응급실처럼, 환자마다 증상이 다르면 치료비도 달라진다." />
        </Section>

        <Section title="반품 모델 (Weibull)">
          <Var className="cat-weibull" title="R∞ 최대 반품률"
            meaning="시간이 무한히 흐를 때 이론적 최대 반품률."
            effects="각 시점 반품률 변동 / λ 역산 / 곡선 형태 변경"
            basis="아이웨어 28%."
            analogy="수조의 만수위선처럼, R∞는 반품이 차오를 수 있는 최대 수위다." />
          <Var className="cat-weibull" title="k 형상 파라미터"
            meaning="반품의 시간 집중도. k>1이면 초반 집중, k<1이면 장기 분산."
            effects="반품 시점 분포 형태 변경"
            basis="아이웨어 k=1.1."
            analogy="버스 파업 뉴스처럼, k가 크면 당일 폭주, 작으면 드문드문." />
        </Section>

        <Section title="판매량 모델 (탄력성)">
          <Var className="cat-volume" title="기준 판매량 (Base Volume)"
            meaning="참조 조건에서의 월 판매량."
            effects="V_adj 기준점 / 규모효과 분모"
            basis="단일 SKU 프리미엄 e-커머스 월 1,000개."
            analogy="체중계의 표준 체중처럼, 모든 변화를 이 기준 대비로 환산한다." />
        </Section>

        <Section title="비교 모드 (v3 신규)">
          <Var className="" title="시나리오 A vs B 비교" style={{ borderLeftColor: '#ea580c' }}
            meaning="같은 제품에서 마진 구조만 다를 때의 수익 영향 비교."
            effects="수익률 차트에 B 곡선 오버레이 / 비교 테이블"
            basis="Weibull 파라미터와 반품비용은 동일, 마진만 다름."
            analogy="같은 도로를 달리는 두 자동차. 연비가 다르면 연료 소진 시점이 다르다." />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <h3 className="text-[13px] font-bold text-text mb-2 pb-[5px] border-b border-border-light">{title}</h3>
      {children}
    </div>
  );
}

function Var({ title, meaning, effects, basis, analogy, className = '', style }: {
  title: string; meaning: string; effects: string; basis: string; analogy: string;
  className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`modal-var ${className}`} style={style}>
      <h4>{title}</h4>
      <p><span className="tag tag-meaning">의미</span> {meaning}</p>
      <p><span className="tag tag-effects">영향</span> {effects}</p>
      <p><span className="tag tag-basis">근거</span> {basis}</p>
      <p><span className="tag tag-analogy">비유</span> {analogy}</p>
    </div>
  );
}
