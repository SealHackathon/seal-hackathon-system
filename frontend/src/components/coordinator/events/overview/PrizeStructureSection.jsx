import { Star, Trophy } from '@phosphor-icons/react'
import SectionHeader from '../../../shared/SectionHeader'
import styles from './PrizeStructureSection.module.css'

/**
 * PrizeStructureSection — Cơ cấu giải thưởng
 * Props:
 *   prizes: Array<{ name, cash, description, count, tier }>
 *     - tier: 'gold' | 'silver' | 'bronze' | 'default'
 *   totalCash: number
 */

// "7,000,000 VNĐ" (dấu phẩy) — dùng cho tổng + số tiền lớn bên trái
function formatVND(amount) {
  if (amount == null) return null
  return new Intl.NumberFormat('en-US').format(amount) + ' VNĐ'
}

// "7.000.000 đồng" (dấu chấm) — dùng cho chi tiết bên phải
function formatDong(amount) {
  if (amount == null) return null
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đồng'
}

// Tách mô tả (hiện vật) thành từng dòng
function toLines(desc) {
  if (!desc) return []
  return String(desc)
    .split(/\r?\n|,|;|\//)
    .map((s) => s.trim())
    .filter(Boolean)
}

const TIER_CLASS = {
  gold: styles.tierGold,
  silver: styles.tierSilver,
  bronze: styles.tierBronze,
  default: styles.tierDefault,
}

function PrizeStructureSection({ prizes = [], totalCash }) {
  if (prizes.length === 0) return null

  return (
    <div className={styles.container}>
      <SectionHeader icon={Trophy} title="Cơ cấu giải thưởng" level="h1" />

      <div className={styles.card}>
        {/* Tổng giá trị hiện kim */}
        {totalCash > 0 && (
          <div className={styles.totalBox}>
            <span className={styles.totalValue}>{formatVND(totalCash)}</span>
            <span className={styles.totalLabel}>Tổng giá trị hiện kim của giải thưởng</span>
          </div>
        )}

        {/* Lưới giải thưởng 2 cột */}
        <div className={styles.grid}>
          {prizes.map((prize, i) => (
            <div
              key={i}
              className={[styles.prizeItem, TIER_CLASS[prize.tier] ?? styles.tierDefault].join(' ')}
            >
              {/* Trái: sao + tên · số tiền · số lượng */}
              <div className={styles.left}>
                <div className={styles.nameRow}>
                  <Star size={20} weight="fill" className={styles.star} />
                  <span className={styles.name}>{prize.name}</span>
                </div>
                {prize.cash > 0 && <div className={styles.amount}>{formatVND(prize.cash)}</div>}
                {prize.count > 0 && <div className={styles.count}>{prize.count} giải</div>}
              </div>

              {/* Gạch chéo ngăn */}
              <span className={styles.slash} />

              {/* Phải: hiện kim + hiện vật */}
              <div className={styles.right}>
                {prize.cash > 0 && <span className={styles.detailCash}>{formatDong(prize.cash)}</span>}
                {toLines(prize.description).map((line, idx) => (
                  <span key={idx} className={styles.detailLine}>{line}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PrizeStructureSection