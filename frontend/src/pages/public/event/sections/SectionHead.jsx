import { FlagBanner } from '@phosphor-icons/react'
import styles from './SectionHead.module.css'

// Mũi tên dài — nét đặc trưng lấy từ Hero (theme) để đồng bộ toàn trang
const LongArrowIcon = ({ className }) => (
  <svg width="42" height="16" viewBox="0 0 42 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M2 8H40M40 8L33 1M40 8L33 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * SectionHead — header dùng chung cho các section trang public event.
 *
 * Props:
 *   eyebrow  : nhãn nhỏ phía trên tiêu đề (vd: "Giới thiệu").
 *   title    : tiêu đề chính (bắt buộc).
 *   accent   : phần chữ trong title được tô CAM (vd: "Về").
 *   flagIcon : icon Phosphor cạnh tiêu đề (mặc định FlagBanner).
 *   subtitle : mô tả phụ (nên viết copy có ý nghĩa).
 *   align    : 'left' (mặc định) | 'center'.
 */
function SectionHead({ eyebrow, title, accent, flagIcon: FlagIcon = FlagBanner, subtitle, align = 'left' }) {
  // Tách title để tô màu cam cho phần accent mà không đổi nội dung từ API
  const renderTitle = () => {
    if (!accent || !title?.includes(accent)) return title
    const [before, after] = title.split(accent)
    return (
      <>
        {before}
        <span className={styles.accent}>{accent}</span>
        {after}
      </>
    )
  }

  return (
    <header className={`${styles.head} ${align === 'center' ? styles.center : ''}`}>
      {eyebrow && (
        <span className={styles.eyebrow}>
          <LongArrowIcon className={styles.arrow} />
          {eyebrow}
        </span>
      )}

      <div className={styles.titleRow}>
        <h2 className={styles.title}>{renderTitle()}</h2>
        {FlagIcon && (
          <span className={styles.flag}>
            <FlagIcon weight="fill" />
          </span>
        )}
      </div>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  )
}

export default SectionHead