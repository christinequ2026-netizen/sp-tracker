'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/Providers';

// ─────────────────────────────────────────────────────────────────────────────
// Product education data
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 'fcn',
    abbr: 'FCN',
    name: 'Fixed Coupon Note',
    nameZh: '固定票息票据',
    color: '#3b82f6',
    risk: 3,
    tagEn: 'Yield Enhancement',
    tagZh: '增益型',
    summaryEn: 'A structured note that pays a fixed periodic coupon as long as the underlying asset stays above the knock-in barrier. Principal is at risk if the barrier is breached at maturity.',
    summaryZh: '只要标的资产未触碰敲入障碍，投资者每期获得固定票息（通常年化8–25%）。若到期时障碍被触碰且标的低于行权价，本金将转换为股票或遭受损失。',
    mechanismEn: [
      'Investor lends notional to the issuer in exchange for periodic coupon payments.',
      'A knock-in barrier (typically 60–80% of initial spot) is set. If the underlying closes below this level at any observation date (or continuously), a knock-in event occurs.',
      'At maturity: if no knock-in has occurred → full principal + final coupon returned. If knock-in occurred AND final price < strike → investor receives shares or cash equivalent of the depreciated value.',
      'The higher the coupon, the lower the barrier or the higher-volatility underlying, reflecting greater downside risk taken.',
    ],
    mechanismZh: [
      '投资者将名义本金出借给发行商，换取定期固定票息（月付或季付）。',
      '设置敲入障碍价（通常为初始价格的60–80%）。若标的在观察日或任意交易日收盘价跌破此障碍，即触发"敲入事件"。',
      '到期结算：若未发生敲入 → 全额归还本金+最后一期票息。若发生敲入且到期价格低于行权价 → 投资者按行权价接收股票或承受等值现金损失。',
      '票息越高，通常意味着障碍更低、标的波动率更高，反映投资者承担了更大的下行风险。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '3–24 months / 3–24个月' },
      { label: 'Coupon / 票息', value: '8–25% p.a. / 年化8–25%' },
      { label: 'Strike / 行权价', value: '100% of initial spot / 初始价格100%' },
      { label: 'Knock-in Barrier / 敲入障碍', value: '60–80% of initial spot / 初始价格60–80%' },
      { label: 'Observation / 观察方式', value: 'Daily close or European (at maturity) / 每日收盘或欧式（到期观察）' },
      { label: 'Settlement / 结算', value: 'Cash or physical delivery / 现金或实物交割' },
      { label: 'Typical Underlyings / 常见标的', value: 'Single stocks (HSBC, Tencent, TSMC) or indices (HSI, KOSPI) / 单股或指数' },
    ],
    scenarios: [
      { name: 'Bull (上涨)', en: 'Underlying rises or stays flat → no knock-in → full coupon + principal returned', zh: '标的上涨或横盘 → 无敲入 → 收到全部票息+本金', outcome: 'positive' },
      { name: 'Flat (横盘)', en: 'Underlying moves sideways but stays above barrier → investor earns coupon yield', zh: '标的窄幅震荡，不跌破障碍 → 投资者获得票息收益', outcome: 'positive' },
      { name: 'Bear (下跌不触障碍)', en: 'Underlying declines but stays above knock-in barrier → still earns full coupon', zh: '标的下跌但未触及障碍 → 仍获全额票息', outcome: 'neutral' },
      { name: 'Sharp Drop (大跌触及障碍)', en: 'Knock-in triggered → at maturity if price < strike, principal converted to shares at 100% strike. Loss = decline from 100% to final price minus coupon received', zh: '敲入触发 → 到期若价格低于行权价，本金按行权价强制换股。亏损=从100%到最终价格的跌幅，再加已获票息', outcome: 'negative' },
    ],
    risksEn: [
      'Issuer credit risk: if the issuer defaults, the note may be worthless regardless of underlying performance.',
      'Knock-in risk: a single bad day (for daily barrier) can trigger permanent downside exposure.',
      'Worst-of risk: multi-underlying FCNs reference the worst performer, dramatically increasing knock-in probability.',
      'Liquidity risk: FCNs are OTC products — secondary market is limited and bid/offer spreads can be wide.',
      'Missed upside: if the underlying surges, investors only earn the fixed coupon.',
    ],
    risksZh: [
      '发行商信用风险：若发行商违约，无论标的表现如何，票据可能一文不值。',
      '敲入风险：对于每日观察型，任何一个交易日的大幅下跌都可能触发敲入，锁定下行风险敞口。',
      '最差表现风险：多标的FCN参考最差表现标的，大幅提高敲入概率。',
      '流动性风险：FCN为场外产品，二级市场有限，买卖价差可能较宽。',
      '错失上行：若标的大幅上涨，投资者仅获固定票息，错失超额收益。',
    ],
    suitability: { en: 'Investors with a neutral to mildly bullish view who seek yield enhancement above deposit rates and accept limited downside if barrier is breached. Requires tolerance for potential equity delivery.', zh: '对标的资产持中性至温和看多观点，寻求高于存款利率的增益收益，并能接受触障后承受下行风险的投资者。需能够承受实物股票交割。' },
  },
  {
    id: 'acn',
    abbr: 'ACN',
    name: 'Autocallable Note',
    nameZh: '自动赎回票据',
    color: '#8b5cf6',
    risk: 3,
    tagEn: 'Yield Enhancement',
    tagZh: '增益型',
    summaryEn: 'A structured note that automatically redeems early if the underlying asset reaches or exceeds the autocall barrier on observation dates, returning principal plus coupon. Otherwise functions similarly to an FCN.',
    summaryZh: '若标的资产在定期观察日达到或超过自动赎回障碍，票据自动提前赎回，返还本金加票息。若未触发自动赎回，运作方式类似FCN。',
    mechanismEn: [
      'Periodic observation dates (monthly or quarterly) check if the underlying is at or above the autocall barrier (typically 100% of initial).',
      'If autocall triggers: investor receives 100% principal + accrued coupon for that period → investment ends early.',
      'If autocall does not trigger in any period, the note continues to its final maturity like an FCN.',
      'Step-down feature (common): autocall barrier decreases over time (e.g., 100% → 98% → 96%) making early redemption progressively easier.',
      'At maturity without autocall: same payoff as FCN — full return if no knock-in, or equity delivery if knock-in occurred and price < strike.',
    ],
    mechanismZh: [
      '定期（月度或季度）观察日检查标的是否等于或高于自动赎回障碍（通常为初始价格的100%）。',
      '若触发自动赎回：投资者获得100%本金+当期票息，投资提前结束。',
      '若任何观察期均未触发，票据继续运行至最终到期日，类似FCN。',
      '常见的"递减"功能：自动赎回障碍随时间下降（如100%→98%→96%），提前赎回越来越容易。',
      '到期未触发自动赎回：与FCN相同，无敲入则全额返还，有敲入且低于行权价则交割股票。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '6–36 months / 6–36个月' },
      { label: 'Coupon / 票息', value: '10–30% p.a. / 年化10–30%' },
      { label: 'Autocall Barrier / 自动赎回障碍', value: '100% (or step-down from 100%) / 100%（或从100%递减）' },
      { label: 'Knock-in Barrier / 敲入障碍', value: '60–75% of initial spot / 初始价格60–75%' },
      { label: 'Observation / 观察频率', value: 'Monthly or quarterly / 月度或季度' },
      { label: 'Step-down / 递减步长', value: '0–2% per period / 每期0–2%' },
    ],
    scenarios: [
      { name: 'Early Call (提前赎回)', en: 'Underlying at or above autocall barrier at first/early observation → principal + coupon returned, investment ends profitably', zh: '标的在首次/早期观察日达到或超过障碍 → 本金+票息返还，投资提前圆满结束', outcome: 'positive' },
      { name: 'Late Call (延迟赎回)', en: 'Underlying dips below barrier for several periods then recovers → investor earns more coupon but waits longer', zh: '标的连续数期低于障碍后回升触发赎回 → 投资者获得更多票息但等待更长时间', outcome: 'neutral' },
      { name: 'Runs to Maturity (运行至到期)', en: 'Never autocalls — if no knock-in, full principal + all coupons returned at maturity', zh: '从未触发自动赎回，若无敲入则到期返还全部本金+票息', outcome: 'neutral' },
      { name: 'Knock-in at Maturity (到期触障)', en: 'Knock-in occurred + final price < strike → shares delivered or cash loss', zh: '发生敲入且到期价格低于行权价 → 交割股票或承受现金损失', outcome: 'negative' },
    ],
    risksEn: [
      'Similar to FCN: knock-in and issuer credit risk apply.',
      'Reinvestment risk: if autocalled early in a rising market, investor must redeploy capital at potentially lower yields.',
      'The note may NOT autocall in volatile markets, leaving capital locked for the full term.',
    ],
    risksZh: [
      '与FCN类似：敲入风险和发行商信用风险均适用。',
      '再投资风险：若在市场上涨期间提前赎回，投资者需在可能更低的收益率下重新配置资金。',
      '在市场震荡时，票据可能不会触发自动赎回，资金将被锁定至到期日。',
    ],
    suitability: { en: 'Investors seeking above-deposit yield who are comfortable with possible equity delivery, and prefer the optionality of early redemption. Good for moderately bullish or range-bound market views.', zh: '寻求高于存款收益，能接受可能的股票交割，并偏好提前赎回可能性的投资者。适合温和看多或区间震荡的市场观点。' },
  },
  {
    id: 'eln',
    abbr: 'ELN',
    name: 'Equity Linked Note',
    nameZh: '股票挂钩票据',
    color: '#10b981',
    risk: 2,
    tagEn: 'Yield Enhancement',
    tagZh: '增益型',
    summaryEn: 'A capital-at-risk note linked to equity performance. At maturity, if the underlying is below the strike, the investor receives shares instead of cash. The coupon is paid unconditionally, compensating for the downside risk taken.',
    summaryZh: '一种本金存在风险的票据，与股票表现挂钩。到期时若标的低于行权价，投资者获得股票而非现金，票息通常无条件支付。',
    mechanismEn: [
      'The ELN has no knock-in barrier — the downside protection comes purely from the strike level.',
      'Strike is typically set at 100% (at-the-money) or sometimes at a discount (e.g., 95% of spot).',
      'Coupon is paid at inception or periodically, regardless of underlying movement.',
      'At maturity: if final price ≥ strike → full principal + final coupon returned. If final price < strike → investor receives shares at strike price, suffering loss equal to decline from strike.',
      'ELNs are simpler than FCNs — no knock-in barrier means the downside scenario triggers only at maturity.',
    ],
    mechanismZh: [
      'ELN没有敲入障碍，下行保护完全来自行权价格水平。',
      '行权价通常设为100%（平价）或有时有折扣（如现价的95%）。',
      '票息通常在起息日或定期支付，与标的走势无关。',
      '到期结算：若最终价格≥行权价 → 全额返还本金+最后一期票息。若最终价格<行权价 → 按行权价接收股票，承受从行权价到最终价格的跌幅损失。',
      'ELN比FCN更简单，没有敲入障碍意味着损失场景仅在到期时触发。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '1–12 months / 1–12个月' },
      { label: 'Coupon / 票息', value: '4–15% p.a. / 年化4–15%' },
      { label: 'Strike / 行权价', value: '90–105% of initial spot / 初始价格90–105%' },
      { label: 'Barrier / 障碍', value: 'None (European-style only) / 无障碍（仅欧式）' },
      { label: 'Settlement / 结算', value: 'Physical share delivery if ITM / 价内时实物交割' },
    ],
    scenarios: [
      { name: 'Above Strike (高于行权价)', en: 'Final price ≥ strike → full principal returned + coupon earned', zh: '最终价格≥行权价 → 全额本金返还+票息', outcome: 'positive' },
      { name: 'Below Strike (低于行权价)', en: 'Final price < strike → shares delivered at strike. Loss = difference between strike and final price', zh: '最终价格<行权价 → 按行权价交割股票。亏损=行权价与最终价格之差', outcome: 'negative' },
    ],
    risksEn: [
      'Simpler but still capital-at-risk: any decline below strike at maturity results in shares, not cash.',
      'Unlike FCN, no opportunity to recover if shares subsequently rise — investor already owns the shares.',
      'Short tenors mean frequent re-booking needed — transaction costs add up.',
    ],
    risksZh: [
      '更简单但仍有本金风险：到期时任何跌破行权价均导致股票交割而非现金返还。',
      '与FCN不同，一旦交割股票，票据即终止，后续股价上涨对票据本身无补偿。',
      '期限较短意味着需要频繁重新建仓，交易成本累积。',
    ],
    suitability: { en: 'Investors who have a neutral to slightly bullish view on a specific stock and want to earn yield while being willing to buy the stock at the strike price. Essentially a covered put strategy.', zh: '对特定股票持中性至略微看涨观点，愿意在行权价买入该股票的同时赚取额外收益的投资者。本质上是卖出备兑看跌期权的策略。' },
  },
  {
    id: 'phoenix',
    abbr: 'Phoenix',
    name: 'Phoenix Note',
    nameZh: '凤凰票据',
    color: '#f97316',
    risk: 4,
    tagEn: 'Conditional Coupon',
    tagZh: '条件票息型',
    summaryEn: 'A Phoenix Note pays coupon only if the underlying is above a coupon barrier on observation dates. If the underlying drops below the knock-in barrier at any point, the memory feature may accumulate missed coupons for payment later.',
    summaryZh: '凤凰票据仅在观察日标的高于票息障碍时支付票息。若标的低于票息障碍，该期票息不支付但通过"记忆功能"积累，待标的回升后补发。',
    mechanismEn: [
      'Two barriers: (1) Coupon barrier — underlying must be at or above this level for coupon to be paid (typically 70–80% of initial); (2) Knock-in barrier — set lower, breaching this converts principal to equity at maturity (typically 50–65%).',
      'Memory feature: when the coupon barrier is re-breached upward, all previously missed coupons are paid in one lump sum.',
      'Autocall feature: if underlying is above autocall barrier on observation date, the note calls early with all principal and any outstanding coupons.',
      'The note combines autocall, conditional coupon, knock-in, and memory — making it one of the more complex structures.',
    ],
    mechanismZh: [
      '双重障碍机制：①票息障碍——标的须等于或高于此水平（通常为初始价的70–80%）才支付当期票息；②敲入障碍——更低，触及后在到期时转换本金为股票（通常50–65%）。',
      '"记忆功能"：当标的重新回升超过票息障碍时，此前所有未支付的票息将一次性补发。',
      '自动赎回功能：若标的在观察日高于自动赎回障碍，票据提前赎回，支付全部本金和未付票息。',
      '凤凰票据综合了自动赎回、条件票息、敲入和记忆功能，是结构最复杂的产品之一。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '12–36 months / 12–36个月' },
      { label: 'Conditional Coupon / 条件票息', value: '12–35% p.a. / 年化12–35%' },
      { label: 'Coupon Barrier / 票息障碍', value: '70–80% of initial / 初始价格70–80%' },
      { label: 'Knock-in Barrier / 敲入障碍', value: '50–65% of initial / 初始价格50–65%' },
      { label: 'Memory Feature / 记忆功能', value: 'Yes — missed coupons accumulate / 有——未付票息累积' },
      { label: 'Autocall Barrier / 赎回障碍', value: '100% of initial (may step down) / 初始价格100%（可递减）' },
    ],
    scenarios: [
      { name: 'Above Coupon Barrier (高于票息障碍)', en: 'Coupon paid each period + accumulated memory coupons if any → early redemption if above autocall barrier', zh: '每期支付票息+若有记忆票息一并支付 → 高于自动赎回障碍则提前赎回', outcome: 'positive' },
      { name: 'Below Coupon Barrier (低于票息障碍)', en: 'No coupon this period, but memory accumulates. If eventually recovers above coupon barrier → all missed coupons paid at once', zh: '本期不付票息，但记忆积累。若最终恢复超过票息障碍 → 一次性补发所有未付票息', outcome: 'neutral' },
      { name: 'Knock-in + No Recovery (敲入+未恢复)', en: 'Knock-in triggered AND final price < strike → shares delivered, partial/total capital loss', zh: '触发敲入且到期价格低于行权价 → 交割股票，部分/全部本金损失', outcome: 'negative' },
    ],
    risksEn: [
      'Coupon is conditional — in a prolonged bear market, no coupon may be received for many months.',
      'Memory feature sounds attractive but relies on the underlying recovering, which may not happen.',
      'Lower knock-in barrier offers more protection but results in lower coupon.',
      'Complex structure makes fair-value assessment difficult without sophisticated models.',
    ],
    risksZh: [
      '票息有条件——在持续熊市中，可能连续数月零收益。',
      '记忆功能听起来吸引人，但依赖标的反弹，而反弹可能不会发生。',
      '更低的敲入障碍提供更多保护，但对应更低的票息。',
      '复杂的结构使得在没有复杂模型的情况下难以评估公允价值。',
    ],
    suitability: { en: 'Experienced investors comfortable with complex payoffs who seek higher yield than FCN, accept conditional income, and believe the underlying will ultimately stay above the coupon barrier most of the time.', zh: '有经验的投资者，熟悉复杂收益结构，寻求高于FCN的收益，接受条件性收入，并相信标的大部分时间将保持在票息障碍之上。' },
  },
  {
    id: 'snowball',
    abbr: '雪球',
    name: 'Snowball (Accumulator-style Autocall)',
    nameZh: '雪球期权',
    color: '#ec4899',
    risk: 5,
    tagEn: 'High Yield / High Risk',
    tagZh: '高收益/高风险',
    summaryEn: 'A Snowball note originated in Chinese mainland markets, offering very high coupons (~15–40% p.a.) in exchange for a dual-trigger risk: knocked out (early call) if underlying rises above knock-out barrier, knocked in (principal loss) if it falls below knock-in barrier.',
    summaryZh: '雪球期权起源于中国大陆市场，提供极高票息（约年化15–40%），但有双向触发风险：标的上涨触及敲出障碍时提前结束，标的下跌触及敲入障碍时承受本金损失。',
    mechanismEn: [
      'The name "snowball" reflects how coupons "roll up" or accumulate during the observation period when the product remains alive.',
      'Knock-out barrier (上敲出): if underlying rises above this level (usually 100–103% of initial) on any observation date, the note terminates early and investor receives all accumulated coupons + principal. This is the best outcome.',
      'Knock-in barrier (下敲入): set well below current levels (usually 70–80% of initial). If breached at any point during the life, a knock-in event occurs. This is the loss scenario.',
      'If neither knock-out nor knock-in occurs: at maturity, the investor receives the total accumulated coupon + full principal.',
      'If knock-in occurs but no knock-out: investor loses the difference between strike and final price, partially offset by coupons earned.',
    ],
    mechanismZh: [
      '"雪球"之名来自票息"滚雪球式"积累——只要产品存续，每期票息不断叠加。',
      '敲出障碍（上方）：若标的上涨超过此水平（通常为初始价的100–103%），票据提前终止，投资者获得所有已积累票息+本金。这是最佳结果。',
      '敲入障碍（下方）：通常设在初始价格70–80%以下。若标的在存续期内任意时刻跌破此水平，触发敲入事件，这是亏损场景。',
      '若既未敲出也未敲入：到期时投资者获得全部积累票息+全额本金。',
      '若触发敲入但未敲出：投资者损失行权价与最终价格之差，部分由已获票息抵消。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '12–24 months / 12–24个月' },
      { label: 'Coupon / 票息', value: '15–40% p.a. (very high) / 年化15–40%（极高）' },
      { label: 'Knock-out Barrier / 敲出障碍', value: '100–103% of initial / 初始价格100–103%' },
      { label: 'Knock-in Barrier / 敲入障碍', value: '70–80% of initial / 初始价格70–80%' },
      { label: 'Observation / 观察方式', value: 'Daily knock-out + continuous/daily knock-in / 每日敲出+连续/每日敲入' },
      { label: 'Underlyings / 常见标的', value: 'CSI 300, CSI 500, Hang Seng Index, single A-shares / 沪深300、中证500、恒指、个股' },
    ],
    scenarios: [
      { name: 'Knocked Out Early (提前敲出)', en: 'Underlying rises above knock-out barrier → note terminates, investor receives all accumulated coupons + principal. Best outcome.', zh: '标的上涨触及敲出障碍 → 票据终止，收到全部积累票息+本金。最佳结果。', outcome: 'positive' },
      { name: 'Survives to Maturity (存续至到期)', en: 'Neither barrier triggered → investor receives maximum accumulated coupon + principal', zh: '两个障碍均未触发 → 投资者获得最大票息积累+本金', outcome: 'positive' },
      { name: 'Knock-in Only (仅触及敲入)', en: 'Knock-in triggered, no knock-out. Final loss = decline from 100% to final price − total coupons received', zh: '触发敲入但未敲出。最终亏损=从100%到最终价格的跌幅−已收票息', outcome: 'negative' },
    ],
    risksEn: [
      'Tail risk: the product is essentially a short put at the knock-in barrier. A sustained drop past knock-in leads to large principal loss, which coupons rarely fully compensate.',
      'Chinese market specific: most snowballs are linked to CSI 300/500 — subject to China equity market risk including circuit breakers and sudden sell-offs.',
      'Knock-in can happen quickly: in market crashes, barriers can be breached within days of issuance.',
      'Illiquid: unwinding before maturity is expensive and may result in significant mark-to-market loss.',
      'High coupon compensates issuer for selling OTM puts — essentially the investor is writing naked puts.',
    ],
    risksZh: [
      '尾部风险：本质上是在敲入障碍处卖出看跌期权。若标的持续下跌超过敲入障碍，将产生较大本金损失，票息收益往往难以覆盖。',
      '中国市场特有风险：大多数雪球挂钩沪深300/中证500，受中国股市风险影响，包括熔断机制和突发性暴跌。',
      '快速敲入风险：在市场崩盘中，障碍可能在发行后数日内即被触穿。',
      '流动性差：提前平仓代价高昂，可能造成重大的盯市损失。',
      '高票息是对卖出虚值看跌期权的补偿——本质上投资者等于在卖裸期权。',
    ],
    suitability: { en: 'Only for sophisticated investors with full understanding of the payoff structure, adequate risk capital, and a specific macroeconomic view (moderately bullish with controlled downside). NOT suitable for conservative investors.', zh: '仅适合充分理解收益结构、具有充足风险资本，且持有特定宏观观点（温和看多且控制下行）的成熟投资者。不适合保守型投资者。' },
  },
  {
    id: 'shark_fin',
    abbr: 'Shark Fin',
    name: 'Shark Fin',
    nameZh: '鲨鱼鳍期权',
    color: '#06b6d4',
    risk: 2,
    tagEn: 'Capital Protected Participation',
    tagZh: '参与型（保本）',
    summaryEn: 'A capital-protected note that provides upside participation if the underlying stays below a knock-out barrier. If the barrier is breached, participation is capped at a predefined rate. Principal is typically 100% protected.',
    summaryZh: '一种通常保本的票据，提供标的上涨参与，但设有敲出上限。若标的触及敲出障碍，参与收益被限制在预设水平。本金通常100%保护。',
    mechanismEn: [
      'Payoff resembles a shark fin chart: linear upside participation up to a knock-out barrier, then flat.',
      'If the underlying does NOT breach the knock-out barrier during the entire tenor: investor receives principal + (participation rate × underlying return).',
      'If the knock-out barrier IS breached: participation is locked in at the rebate rate (e.g., 10–15%), regardless of how much higher the underlying goes.',
      'Principal is typically 100% guaranteed — the downside risk is limited to opportunity cost.',
    ],
    mechanismZh: [
      '收益图形类似鲨鱼鳍：在敲出障碍以下线性参与上涨，触及障碍后持平。',
      '若标的在整个期限内未触及敲出障碍：投资者获得本金+（参与率×标的涨幅）。',
      '若触及敲出障碍：参与收益锁定在预设回扣率（如10–15%），无论标的后续涨幅多大。',
      '本金通常100%保证——下行风险仅限于机会成本。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '6–24 months / 6–24个月' },
      { label: 'Participation Rate / 参与率', value: '80–130% of upside / 上涨收益的80–130%' },
      { label: 'Knock-out Barrier / 敲出障碍', value: '115–130% of initial / 初始价格115–130%' },
      { label: 'Rebate / 回扣', value: '10–20% fixed if barrier breached / 触障时固定10–20%' },
      { label: 'Capital Protection / 本金保护', value: '100% at maturity / 到期100%保本' },
    ],
    scenarios: [
      { name: 'Below Barrier (未触障)', en: 'Underlying rises 20% → investor earns 20% × participation rate (e.g., 100%) = 20%', zh: '标的上涨20% → 投资者获得20%×参与率（如100%）=20%收益', outcome: 'positive' },
      { name: 'Barrier Breached (触及障碍)', en: 'Underlying rises 40% but hit barrier → investor receives only rebate (e.g., 15%) regardless of 40% gain', zh: '标的上涨40%但触及障碍 → 投资者仅获得回扣（如15%），错失40%涨幅', outcome: 'neutral' },
      { name: 'Underlying Declines (标的下跌)', en: 'Underlying falls → principal protected, investor receives 100% of principal', zh: '标的下跌 → 本金保护，投资者收回100%本金', outcome: 'neutral' },
    ],
    risksEn: [
      'If barrier is hit, the participation is capped — in strong bull markets, investor significantly underperforms.',
      'Capital protection only at maturity — early exit may result in less than 100% principal.',
      'Opportunity cost: the principal is locked for the tenor.',
    ],
    risksZh: [
      '若触及障碍，参与收益被封顶——在强劲牛市中，投资者表现将大幅落后。',
      '保本仅在到期时保证——提前退出可能低于100%本金。',
      '机会成本：本金在期限内被锁定。',
    ],
    suitability: { en: 'Risk-averse investors who want equity-like upside exposure with full capital protection. Suitable for conservative portfolios that cannot afford principal loss but want to participate in equity markets.', zh: '希望获得股票式上涨参与同时全额保本的保守型投资者。适合无法承担本金损失但希望参与股市的投资组合。' },
  },
  {
    id: 'reverse_convertible',
    abbr: 'RC',
    name: 'Reverse Convertible',
    nameZh: '反向可转债',
    color: '#ef4444',
    risk: 3,
    tagEn: 'Yield Enhancement',
    tagZh: '增益型',
    summaryEn: 'One of the oldest structured products. Investor lends money to issuer and receives a high fixed coupon. At maturity, the issuer may repay either cash or a fixed number of shares (whichever is less favourable to the investor).',
    summaryZh: '最古老的结构性产品之一。投资者向发行商出借资金并获得高额固定票息。到期时，发行商可选择以现金或固定数量股票还款（以对投资者较不利者为准）。',
    mechanismEn: [
      'The issuer sells the investor a bond (coupon) while simultaneously buying a put option on the underlying stock.',
      'At maturity: if stock price ≥ strike → issuer repays 100% principal + coupon. If stock price < strike → issuer delivers a fixed number of shares (equivalent to original notional ÷ strike price), which may be worth less.',
      'Unlike ELN, there is NO knock-in barrier — the put is always active. The option component is the key differentiator.',
      'Coupon is typically higher than ELN due to the unconditional put embedded.',
    ],
    mechanismZh: [
      '发行商向投资者出售债券（票息），同时购入标的股票的看跌期权。',
      '到期结算：若股价≥行权价 → 发行商偿还100%本金+票息。若股价<行权价 → 发行商交付固定数量股票（相当于原始名义本金÷行权价），价值可能低于本金。',
      '与ELN不同，没有敲入障碍——看跌期权始终有效。期权部分是关键区别。',
      '由于嵌入无条件看跌期权，票息通常高于ELN。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '1–12 months / 1–12个月' },
      { label: 'Coupon / 票息', value: '8–20% p.a. / 年化8–20%' },
      { label: 'Strike / 行权价', value: '90–110% of initial / 初始价格90–110%' },
      { label: 'Barrier / 障碍', value: 'None / 无' },
      { label: 'Settlement / 结算', value: 'Cash or physical shares / 现金或实物股票' },
    ],
    scenarios: [
      { name: 'Above Strike (高于行权价)', en: 'Full principal + coupon returned in cash', zh: '全额本金+票息以现金返还', outcome: 'positive' },
      { name: 'Below Strike (低于行权价)', en: 'Shares delivered: loss = (strike − final price) / strike × notional, partially offset by coupon', zh: '交割股票：亏损=（行权价−最终价格）/行权价×本金，由票息部分抵消', outcome: 'negative' },
    ],
    risksEn: [
      'No barrier protection — any decline below strike at maturity results in shares.',
      'Issuer credit risk.',
      'Liquidity risk if shares delivered are illiquid.',
    ],
    risksZh: [
      '无障碍保护——到期时任何跌破行权价都将导致股票交割。',
      '发行商信用风险。',
      '若交割的股票流动性差，存在流动性风险。',
    ],
    suitability: { en: 'Investors who want the simplest form of yield enhancement and are willing to buy shares at a specific price. Often used by private bank clients to accumulate equity positions at a discount.', zh: '希望以最简单方式增益收益并愿意在特定价格买入股票的投资者。私人银行客户常用此产品以折扣价积累股票仓位。' },
  },
  {
    id: 'capital_protected',
    abbr: 'CPN',
    name: 'Capital Protected Note',
    nameZh: '保本票据',
    color: '#84cc16',
    risk: 1,
    tagEn: 'Capital Protected',
    tagZh: '保本型',
    summaryEn: 'A note that guarantees return of 100% of principal at maturity while providing upside participation in an underlying index or basket. The capital protection comes at the cost of reduced participation or capped returns.',
    summaryZh: '保证到期时返还100%本金，同时提供对标的指数或篮子的上涨参与。本金保护以降低参与率或封顶收益为代价。',
    mechanismEn: [
      'Structurally: zero-coupon bond (provides 100% principal protection) + call option (provides upside participation).',
      'The zero-coupon bond component is sized to grow to 100% of notional by maturity — leaving the remaining capital (present value discount) to buy call options.',
      'In low interest rate environments, very little capital remains to buy options → participation is low or caps are tight.',
      'In higher rate environments, more capital available for options → better participation possible.',
      'Common variants: participation in average return (Asian option), best-of basket, or capped participation.',
    ],
    mechanismZh: [
      '结构上由两部分组成：零息债券（提供100%本金保护）+看涨期权（提供上涨参与）。',
      '零息债券部分按到期时增长至名义本金100%的规模进行配置，剩余资金（现值折扣部分）用于购买看涨期权。',
      '低利率环境下，可用于购买期权的资金很少，参与率低或上限紧。',
      '在较高利率环境下，可用于期权的资金更多，可实现更好的参与率。',
      '常见变体：参与平均回报（亚式期权）、最优篮子、封顶参与。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '3–7 years / 3–7年' },
      { label: 'Participation Rate / 参与率', value: '50–100% of upside / 上涨的50–100%' },
      { label: 'Capital Protection / 本金保护', value: '100% at maturity / 到期100%保本' },
      { label: 'Cap / 收益上限', value: 'May apply (e.g., max 40%) / 可能设有上限（如最高40%）' },
      { label: 'Issuer Risk / 发行商风险', value: 'Principal protection subject to issuer solvency / 保本以发行商偿付能力为前提' },
    ],
    scenarios: [
      { name: 'Market Rises (市场上涨)', en: 'Underlying up 50% → investor earns 50% × participation rate (e.g., 80%) = 40%', zh: '标的上涨50% → 投资者获得50%×参与率（80%）=40%', outcome: 'positive' },
      { name: 'Market Flat (市场横盘)', en: 'Underlying flat → investor receives only 100% principal (zero additional return)', zh: '标的横盘 → 投资者仅获得100%本金（无额外回报）', outcome: 'neutral' },
      { name: 'Market Falls (市场下跌)', en: 'Underlying falls 30% → investor still receives 100% principal', zh: '标的下跌30% → 投资者仍收到100%本金', outcome: 'neutral' },
    ],
    risksEn: [
      'Capital protection is an issuer obligation — if issuer defaults, 100% protection is void.',
      'Long tenors (3–7 years) mean capital is illiquid for a long time.',
      'In low rate environments, participation can be very low, making the note essentially a low-yield bond.',
      'Inflation risk: returning 100% nominal principal after 5 years may represent a real loss.',
    ],
    risksZh: [
      '本金保护是发行商义务——若发行商违约，100%保护即告无效。',
      '较长期限（3–7年）意味着资金长期被锁定，流动性差。',
      '低利率环境下参与率可能很低，使票据实质上变成低收益债券。',
      '通胀风险：5年后名义上返还100%本金，实际上可能是购买力损失。',
    ],
    suitability: { en: 'Risk-averse investors who prioritize capital preservation above all else, particularly those close to retirement or with specific liability-matching needs. Accepting low-to-moderate returns in exchange for certainty of principal.', zh: '以资本保全为首要目标的保守型投资者，尤其是临近退休或有特定负债匹配需求的人士。愿意接受较低回报换取本金确定性。' },
  },
  {
    id: 'warrant',
    abbr: 'Warrant',
    name: 'Structured Warrant',
    nameZh: '结构性权证（衍生权证）',
    color: '#a78bfa',
    risk: 4,
    tagEn: 'Leverage',
    tagZh: '杠杆型',
    summaryEn: 'Exchange-listed warrants issued by financial institutions that give holders the right (but not obligation) to buy (call) or sell (put) an underlying at a set price on a specific date. Highly leveraged instruments.',
    summaryZh: '由金融机构发行的交易所上市权证，赋予持有人在特定日期以约定价格买入（认购）或卖出（认沽）标的资产的权利（而非义务）。高度杠杆化工具。',
    mechanismEn: [
      'Listed on HKEX or SGX — fully transparent, tradeable in open market during trading hours.',
      'Call warrant: profits when underlying rises above strike price. Put warrant: profits when underlying falls below strike.',
      'Gearing (leverage): a small movement in the underlying results in a proportionally larger movement in the warrant price.',
      'Time decay: warrants lose value as they approach expiry (theta). Buying and holding without an underlying move will result in loss.',
      'Delta: measures how much the warrant price moves for a 1% move in the underlying. Decreases for OTM warrants as expiry approaches.',
    ],
    mechanismZh: [
      '在港交所或新交所上市，交易时间内完全透明、可公开买卖。',
      '认购权证：标的上涨至行权价以上时获利。认沽权证：标的下跌至行权价以下时获利。',
      '杠杆比率：标的小幅移动导致权证价格按比例更大幅波动。',
      '时间价值损耗：权证随到期日临近而贬值（Theta衰减）。若持有权证期间标的无运动，将产生损失。',
      'Delta：衡量标的移动1%时权证价格的变化幅度。价外权证随到期日临近Delta递减。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '1–24 months / 1–24个月' },
      { label: 'Gearing / 杠杆', value: '3x–15x typical / 典型3–15倍' },
      { label: 'Exercise Type / 行权方式', value: 'European (cash-settled at expiry) / 欧式（到期现金结算）' },
      { label: 'Board Lot / 手数', value: 'Varies (typically 10,000–100,000 units) / 不同（通常1–10万份）' },
      { label: 'Common Underlyings / 常见标的', value: 'HSI, HSTECH, Tencent, HSBC, BYD, US tech stocks / 恒指、科技指数、腾讯、汇丰、比亚迪、美股' },
    ],
    scenarios: [
      { name: 'In-the-money Call (价内认购)', en: 'Underlying rises significantly → warrant value increases by larger % (leverage working in favour)', zh: '标的大幅上涨 → 权证价值涨幅更大（杠杆发挥作用）', outcome: 'positive' },
      { name: 'Out-of-money at Expiry (到期价外)', en: 'Underlying stays below strike at expiry → warrant expires worthless, 100% loss', zh: '到期时标的仍低于行权价 → 权证归零，100%亏损', outcome: 'negative' },
      { name: 'Time Decay (时间损耗)', en: 'Underlying stays flat → warrant loses value daily due to time decay', zh: '标的横盘 → 权证每日因时间价值损耗而贬值', outcome: 'negative' },
    ],
    risksEn: [
      'Can lose 100% of investment if the warrant expires worthless.',
      'Time decay works against the holder constantly.',
      'Bid-offer spreads can be wide, especially for less liquid warrants.',
      'Market maker risk: if the market maker withdraws, liquidity may disappear.',
    ],
    risksZh: [
      '若权证到期归零，可损失100%投资金额。',
      '时间价值损耗持续对持有者不利。',
      '买卖价差可能较宽，尤其是流动性较低的权证。',
      '庄家风险：若庄家退出报价，流动性可能消失。',
    ],
    suitability: { en: 'Active traders with a short-term directional view, full understanding of option Greeks, and strict risk management. NOT suitable as long-term investments. Only use capital you can afford to lose entirely.', zh: '持有短期方向性观点、充分理解期权Greeks值并严格进行风险管理的活跃交易者。不适合作为长期投资。只投入可以全部损失的资金。' },
  },
  {
    id: 'cbbc',
    abbr: 'CBBC',
    name: 'Callable Bull/Bear Contract',
    nameZh: '牛熊证',
    color: '#f59e0b',
    risk: 5,
    tagEn: 'Leverage / Knock-out',
    tagZh: '杠杆型/敲出',
    summaryEn: 'Exchange-listed HKEX products with a mandatory call feature. If the underlying touches the call price at any time, the contract is immediately terminated. Residual value (if Category R) may be returned. Highest-risk exchange-listed instrument.',
    summaryZh: '香港交易所上市的带强制收回机制的产品。若标的资产在任意时刻触及收回价，合约立即终止。Category R牛熊证在收回后可能返还少量剩余价值。交易所上市风险最高的工具。',
    mechanismEn: [
      'Bull CBBC: leveraged long exposure. Call price is set below current market. If market touches call price → mandatory call, contract terminated immediately.',
      'Bear CBBC: leveraged short exposure. Call price is set above current market. If market touches call price → mandatory call.',
      'Category N (nil residual): if knocked out, investor receives zero, all capital lost.',
      'Category R (residual value): if knocked out, there is a small window to calculate residual value — investor may receive some small recovery (the difference between call price and highest/lowest price during the mandatory call period).',
      'No time decay in the same way as warrants — CBBC price tracks the underlying more linearly.',
    ],
    mechanismZh: [
      '牛证：提供杠杆做多敞口。收回价设在当前市价以下，若市场触及收回价 → 强制收回，合约立即终止。',
      '熊证：提供杠杆做空敞口。收回价设在当前市价以上，若市场触及收回价 → 强制收回。',
      'N类（无剩余价值）：被收回时投资者获得零，全部资金损失。',
      'R类（有剩余价值）：被收回时有小窗口期计算剩余价值——投资者可能收回少量（收回价与强制收回期间最高/最低价之差）。',
      '与权证不同，牛熊证没有相同意义的时间价值损耗，价格更线性地追踪标的。',
    ],
    terms: [
      { label: 'Tenor / 期限', value: '1–24 months / 1–24个月' },
      { label: 'Leverage / 杠杆', value: '3x–20x typical / 典型3–20倍' },
      { label: 'Call Price / 收回价', value: 'Set close to (within 3%) current price / 通常设在当前价格3%以内' },
      { label: 'Strike / 行权价', value: 'Often different from call price / 通常与收回价不同' },
      { label: 'Mandatory Call / 强制收回', value: 'Immediate, 24/7 including pre/post-market / 立即执行，含盘前盘后' },
      { label: 'Exchange / 交易所', value: 'HKEX only / 仅港交所' },
    ],
    scenarios: [
      { name: 'Bull CBBC — Market Rises (牛证 — 市场上涨)', en: 'HSI rises 2% → Bull CBBC rises ~10–15% (5–7x leverage)', zh: '恒指上涨2% → 牛证上涨约10–15%（5–7倍杠杆）', outcome: 'positive' },
      { name: 'Bull CBBC — Intraday Touch (牛证 — 日内触及收回价)', en: 'HSI drops briefly to call price intraday → entire position is wiped out, contract terminated', zh: '恒指日内短暂触及收回价 → 全仓归零，合约立即终止', outcome: 'negative' },
    ],
    risksEn: [
      'A single intraday touch of the call price wipes out the entire investment — even if the market recovers immediately after.',
      'Extreme leverage means small adverse moves compound into large losses.',
      'CBBC call prices cluster at common technical levels — market makers may benefit from triggering mass call events.',
      'Gap risk: overnight gaps can cause immediate mandatory call at open.',
    ],
    risksZh: [
      '日内任意瞬间触及收回价即导致全仓损失，即使市场随后立即反弹亦然。',
      '极高杠杆意味着小幅不利波动会放大为巨大损失。',
      '牛熊证收回价往往集中在常见技术支撑/阻力位——庄家可能从触发大规模强制收回中受益。',
      '缺口风险：隔夜跳空可能导致开市即被立即强制收回。',
    ],
    suitability: { en: 'Only for very short-term tactical traders with real-time monitoring capability. Must be able to watch positions continuously and set strict stop-losses. Absolutely not suitable for set-and-forget approaches.', zh: '仅适合具备实时监控能力的极短期战术交易者。必须能够持续监控仓位并设置严格止损。绝对不适合"买入持有"策略。' },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: number }) {
  const labels = ['', '低风险', '中低风险', '中等风险', '中高风险', '高风险'];
  const labelsEn = ['', 'Low', 'Low-Med', 'Medium', 'Med-High', 'High'];
  const colors = ['', '#84cc16', '#10b981', '#f59e0b', '#f97316', '#ef4444'];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: i <= level ? colors[level] : '#3f3f46' }}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium" style={{ color: colors[level] }}>
        {labelsEn[level]}
      </span>
    </div>
  );
}

function ScenarioTable({ scenarios, lang }: { scenarios: typeof PRODUCTS[0]['scenarios'], lang: string }) {
  const outcomeColors: Record<string, string> = {
    positive: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    neutral: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    negative: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return (
    <div className="space-y-2">
      {scenarios.map((s, i) => (
        <div key={i} className={`rounded-lg border px-4 py-3 ${outcomeColors[s.outcome]}`}>
          <div className="flex items-start gap-3">
            <div className="font-semibold text-xs whitespace-nowrap mt-0.5">{s.name}</div>
            <div className="text-[12px] opacity-90 leading-relaxed">
              {lang === 'zh' ? s.zh : s.en}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EducationPage() {
  const { lang } = useLanguage();
  const [activeId, setActiveId] = useState('fcn');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const active = PRODUCTS.find((p) => p.id === activeId) || PRODUCTS[0];

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Header />

      {/* Hero */}
      <div className="border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[#c8a97e] text-xs tracking-widest uppercase font-medium">Investor Education</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-500 text-xs tracking-widest uppercase">投资者教育中心</span>
          </div>
          <h1 className="text-2xl font-light text-zinc-100 mb-2">
            {lang === 'zh' ? '亚洲结构性产品完全指南' : 'Complete Guide to Asian Structured Products'}
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            {lang === 'zh'
              ? '涵盖FCN、ACN、ELN、凤凰票据、雪球、鲨鱼鳍、权证、牛熊证等主要产品类型的运作机制、风险收益分析及适合投资者说明。内容参考主要国际投资银行私人银行部门的公开教育材料。'
              : 'Covering FCN, ACN, ELN, Phoenix Notes, Snowball, Shark Fin, Warrants, CBBCs and more — payoff mechanics, risk-return analysis, and suitability guidance. Compiled from major international investment bank private banking educational materials.'}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-1 w-[220px] shrink-0 sticky top-24 self-start">
            <div className="text-[10px] text-zinc-600 tracking-widest uppercase px-3 mb-2">
              {lang === 'zh' ? '产品类型' : 'Product Types'}
            </div>
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                  activeId === p.id
                    ? 'bg-zinc-800 border border-zinc-700'
                    : 'hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color, opacity: activeId === p.id ? 1 : 0.5 }}
                />
                <div>
                  <div className={`text-xs font-medium ${activeId === p.id ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                    {p.abbr}
                  </div>
                  <div className="text-[10px] text-zinc-600 truncate max-w-[140px]">
                    {lang === 'zh' ? p.nameZh : p.name}
                  </div>
                </div>
                <div className="ml-auto">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="inline-block w-1 h-1 rounded-full mr-0.5"
                      style={{ backgroundColor: i <= p.risk ? p.color : '#3f3f46' }} />
                  ))}
                </div>
              </button>
            ))}
          </aside>

          {/* Mobile product selector */}
          <div className="lg:hidden w-full mb-6">
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 text-sm"
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.abbr} — {lang === 'zh' ? p.nameZh : p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Header card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="text-2xl font-semibold tracking-tight"
                      style={{ color: active.color }}
                    >
                      {active.abbr}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border"
                      style={{ borderColor: active.color + '40', color: active.color, backgroundColor: active.color + '10' }}>
                      {lang === 'zh' ? active.tagZh : active.tagEn}
                    </span>
                  </div>
                  <h2 className="text-lg font-light text-zinc-200">
                    {lang === 'zh' ? active.nameZh : active.name}
                  </h2>
                </div>
                <RiskBadge level={active.risk} />
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {lang === 'zh' ? active.summaryZh : active.summaryEn}
              </p>
            </div>

            {/* Mechanism */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => toggleSection('mech')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span style={{ color: active.color }}>⚙</span>
                  {lang === 'zh' ? '运作机制' : 'How It Works'}
                </h3>
                <span className="text-zinc-600 text-sm">{expandedSections['mech'] !== false ? '▾' : '▸'}</span>
              </button>
              {expandedSections['mech'] !== false && (
                <div className="px-6 pb-5 border-t border-zinc-800/50">
                  <ol className="mt-4 space-y-3">
                    {(lang === 'zh' ? active.mechanismZh : active.mechanismEn).map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="w-5 h-5 rounded-full text-[10px] font-bold shrink-0 flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: active.color + '20', color: active.color }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm text-zinc-400 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>

            {/* Key Terms */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => toggleSection('terms')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span style={{ color: active.color }}>📋</span>
                  {lang === 'zh' ? '典型条款' : 'Typical Terms'}
                </h3>
                <span className="text-zinc-600 text-sm">{expandedSections['terms'] !== false ? '▾' : '▸'}</span>
              </button>
              {expandedSections['terms'] !== false && (
                <div className="border-t border-zinc-800/50">
                  <table className="w-full">
                    <tbody>
                      {active.terms.map((term, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-zinc-900/30' : ''}>
                          <td className="px-6 py-3 text-xs text-zinc-500 font-medium w-[200px] shrink-0">
                            {term.label}
                          </td>
                          <td className="px-6 py-3 text-sm text-zinc-300">{term.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Payoff Scenarios */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => toggleSection('scenarios')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span style={{ color: active.color }}>📊</span>
                  {lang === 'zh' ? '收益场景分析' : 'Payoff Scenario Analysis'}
                </h3>
                <span className="text-zinc-600 text-sm">{expandedSections['scenarios'] !== false ? '▾' : '▸'}</span>
              </button>
              {expandedSections['scenarios'] !== false && (
                <div className="px-6 pb-5 border-t border-zinc-800/50 pt-4">
                  <ScenarioTable scenarios={active.scenarios} lang={lang} />
                </div>
              )}
            </section>

            {/* Risks */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => toggleSection('risks')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span style={{ color: active.color }}>⚠</span>
                  {lang === 'zh' ? '风险提示' : 'Key Risks'}
                </h3>
                <span className="text-zinc-600 text-sm">{expandedSections['risks'] !== false ? '▾' : '▸'}</span>
              </button>
              {expandedSections['risks'] !== false && (
                <div className="px-6 pb-5 border-t border-zinc-800/50 pt-4">
                  <ul className="space-y-2">
                    {(lang === 'zh' ? active.risksZh : active.risksEn).map((risk, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-zinc-400">
                        <span className="text-red-400 shrink-0 mt-0.5">▸</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Suitability */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => toggleSection('suit')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <span style={{ color: active.color }}>👤</span>
                  {lang === 'zh' ? '适合投资者' : 'Investor Suitability'}
                </h3>
                <span className="text-zinc-600 text-sm">{expandedSections['suit'] !== false ? '▾' : '▸'}</span>
              </button>
              {expandedSections['suit'] !== false && (
                <div className="px-6 pb-5 border-t border-zinc-800/50 pt-4">
                  <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 px-5 py-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {lang === 'zh' ? active.suitability.zh : active.suitability.en}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Bottom nav */}
            <div className="flex gap-4 pt-2">
              {PRODUCTS.findIndex(p => p.id === activeId) > 0 && (
                <button
                  onClick={() => setActiveId(PRODUCTS[PRODUCTS.findIndex(p => p.id === activeId) - 1].id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
                >
                  ← {lang === 'zh' ? '上一个' : 'Previous'}
                </button>
              )}
              {PRODUCTS.findIndex(p => p.id === activeId) < PRODUCTS.length - 1 && (
                <button
                  onClick={() => setActiveId(PRODUCTS[PRODUCTS.findIndex(p => p.id === activeId) + 1].id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors ml-auto"
                >
                  {lang === 'zh' ? '下一个' : 'Next'} →
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <div className="border border-amber-400/20 bg-amber-400/5 rounded-lg px-5 py-4 mt-4">
              <p className="text-[11px] text-amber-400/70 leading-relaxed">
                {lang === 'zh'
                  ? '⚠️ 本页面内容仅供投资教育目的，不构成投资建议。结构性产品涉及复杂风险，可能导致全部本金损失。投资前请咨询您的持牌金融顾问并详细阅读相关发售文件。过往表现不代表未来结果。'
                  : '⚠️ This content is for educational purposes only and does not constitute investment advice. Structured products involve complex risks and may result in total loss of principal. Please consult your licensed financial adviser and read all relevant offering documents before investing. Past performance is not indicative of future results.'}
              </p>
            </div>

          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
