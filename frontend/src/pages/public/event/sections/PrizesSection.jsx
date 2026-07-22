import { Trophy, Star, Gift } from '@phosphor-icons/react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import RichTextView from './RichTextView'
import { fmtVND } from '../eventUtils'
import styles from './PrizesSection.module.css'

const MOCK_GENERAL = `
<ul>
  <li>Nhận Giấy chứng nhận tham gia SEAL Hackathon Summer 2026</li>
  <li>Được Mentor hỗ trợ kỹ thuật trực tiếp và tham gia miễn phí Workshop "Emerging Tech 101"</li>
  <li>Có cơ hội networking với giám khảo, cố vấn, doanh nghiệp đối tác và nhận hỗ trợ hậu cần trong các buổi thi đấu offline</li>
</ul>
`

const TIER_CLASS = {
  gold: styles.tierGold,
  silver: styles.tierSilver,
  bronze: styles.tierBronze,
  default: styles.tierDefault,
}

// Thứ tự hiển thị podium: Nhì (trái) – Nhất (giữa) – Ba (phải)
const PODIUM_ORDER = [1, 0, 2]

function PrizeCard({ prize, variant }) {
  const cls = [
    variant === 'podium' ? styles.podiumCard : styles.otherCard,
    TIER_CLASS[prize.tier] ?? styles.tierDefault,
  ].join(' ')
  return (
    <div className={cls}>
      <span className={styles.medal}>
        <Trophy size={variant === 'podium' ? 30 : 22} weight="fill" className={styles.medalIcon} />
      </span>
      <span className={styles.prizeName}>{prize.name}</span>
      <span className={styles.prizeCash}>{fmtVND(prize.cash)}</span>
      <span className={styles.prizeCount}>{prize.count} giải</span>
      {prize.perks && <span className={styles.prizePerks}>{prize.perks}</span>}
    </div>
  )
}

function PrizesSection({ id, prizes }) {
  const main = prizes?.main || []
  const extended = prizes?.extended || []
  const podium = PODIUM_ORDER.map((i) => main[i]).filter(Boolean)
  const others = [...main.slice(3), ...extended]
  const generalPerks = prizes?.general || MOCK_GENERAL
  const [prizesRef, prizesVisible] = useScrollReveal({ threshold: 0.15 })

  return (
    <section id={id} className={styles.section}>
      <div className={styles.topContent}>
        {/* ===== Header title ===== */}
        <div className={styles.headCol}>
          <span className={styles.eyebrow}>Giải thưởng</span>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              <span className={styles.ac}>Về</span> Cơ cấu giải thưởng
            </h2>
            <span className={styles.hicon}>
              <Gift weight="fill" />
            </span>
          </div>
          <div className={styles.uline}>
            <span />
            <span />
          </div>
        </div>

        {/* ===== Quyền lợi chung ===== */}
        <div className={styles.generalPerks}>
          <RichTextView html={generalPerks} />
        </div>
      </div>

      <div ref={prizesRef} className={`${styles.prizesWrapper} ${prizesVisible ? styles.prizesRevealed : ''}`}>
        {podium.length > 0 && (
          <>
            <div className={styles.mainHead}>
              <Star size={24} weight="fill" className={styles.mainHeadIcon} />
              <span>Giải chính</span>
            </div>
            <div className={styles.podium}>
              {podium.map((p, i) => (
                <PrizeCard key={i} prize={p} variant="podium" />
              ))}
            </div>
          </>
        )}

        {others.length > 0 && (
          <>
            <div className={styles.otherHead}>
              <span>Giải phụ</span>
            </div>
            <div className={styles.otherGrid}>
              {others.map((p, i) => (
                <PrizeCard key={i} prize={p} variant="other" />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default PrizesSection
