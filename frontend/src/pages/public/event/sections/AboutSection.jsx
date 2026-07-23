import { FlagBanner } from '@phosphor-icons/react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import styles from './AboutSection.module.css'

// Mũi tên dài — nét đặc trưng lấy từ Hero ("→ FinTech for Everyone")
const LongArrowIcon = ({ className }) => (
  <svg className={className} width="46" height="17" viewBox="0 0 42 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8H40M40 8L33 1M40 8L33 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Mock data để render thử — thay bằng data thật khi ráp API
const MOCK = {
  banner: 'https://res.cloudinary.com/df5ismxf9/image/upload/v1783973613/b0zctl3tw5cgfwtmnwre.jpg',
  shortDesc:
    'Sân chơi dành cho sinh viên CNTT xây dựng sản phẩm số hướng người dùng, đi từ ý tưởng đến trải nghiệm thực tế và khả năng thương mại hóa.',
  detailDesc: `
    <p>SEAL Hackathon Summer 2026 là sự kiện thứ ba trong hệ thống <strong>SEAL – Software Engineering Agile League</strong>, tiếp nối thành công của <em>SEAL Fall 2025</em> và <em>SEAL Spring 2026</em>. Đây là sân chơi học thuật dành cho sinh viên ngành Công nghệ thông tin đang theo học tại <strong>Trường Đại học FPT cơ sở TP.HCM</strong> và các trường đại học khác trên địa bàn thành phố.</p>
    <p>Đúng với định hướng <strong>"Summer SEAL – Emerging Technologies"</strong>, mùa giải năm nay tập trung vào ba công nghệ mới nổi:</p>
    <ul>
      <li><strong>Trí tuệ nhân tạo (AI)</strong></li>
      <li><strong>Internet vạn vật (IoT)</strong></li>
      <li><strong>Blockchain</strong></li>
    </ul>
    <p>Thí sinh sẽ được thử thách xây dựng sản phẩm ứng dụng một hoặc kết hợp các công nghệ này để giải quyết bài toán thực tế, đồng thời rèn luyện:</p>
    <ul>
      <li>Kỹ năng làm việc nhóm</li>
      <li>Tư duy sản phẩm</li>
      <li>Khả năng thuyết trình chuyên nghiệp</li>
    </ul>
  `,
}

/**
 * AboutSection — Section "Giới thiệu" trang public event.
 */
function AboutSection({ event }) {
  const shortDesc = event?.shortDesc || MOCK.shortDesc
  const detailDesc = event?.detailDesc || MOCK.detailDesc

  // Scroll reveal cho 2 cột
  const [leftRef, leftVisible] = useScrollReveal({ threshold: 0.2 })
  const [rightRef, rightVisible] = useScrollReveal({ threshold: 0.15 })

  return (
    <section id="about" className={styles.about}>
      <div className={styles.twoColLayout}>
        {/* Cột trái: Tiêu đề kéo dài xuống */}
        <div
          ref={leftRef}
          className={`${styles.leftCol} ${leftVisible ? styles.revealLeft : ''}`}
        >
          <div className={styles.bars}>
            <span />
            <span />
          </div>
          <div className={styles.headCard}>
            <div className={styles.headInner}>
              <span className={styles.eyebrow}>Giới thiệu</span>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>
                  <span className={styles.accent}>Về</span> Cuộc thi
                </h2>
                <span className={styles.flag}>
                  <FlagBanner weight="fill" />
                </span>
              </div>
              <div className={styles.uline}>
                <span />
                <span />
              </div>
              {/* Mô tả ngắn */}
              {shortDesc && (
                <p className={styles.headDesc}>{shortDesc}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Content (gồm cả banner nếu có) */}
        <div
          ref={rightRef}
          className={`${styles.rightCol} ${rightVisible ? styles.revealRight : ''}`}
        >
          <div className={styles.content}>
            {event?.bannerUrl && (
              <figure className={styles.banner}>
                <img src={event.bannerUrl} alt="Banner sự kiện" loading="lazy" />
              </figure>
            )}
            <div className={styles.contentInner}>
              {detailDesc && (
                <div
                  className={styles.richText}
                  dangerouslySetInnerHTML={{ __html: detailDesc }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection