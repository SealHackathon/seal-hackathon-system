import Button from '../../../../components/shared/Button'
import { ArrowRight } from '@phosphor-icons/react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import styles from './CtaSection.module.css'

function CtaSection({ event, onRegister, showRegisterBtn = true }) {
  // Scroll reveal cho CTA block
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.3 })

  return (
    <footer className={styles.wrap}>
      {showRegisterBtn && (
        <div
          ref={ctaRef}
          className={`${styles.cta} ${ctaVisible ? styles.ctaRevealed : ''}`}
        >
          <div className={styles.ctaText}>
            <span className={styles.ctaTitle}>Sẵn sàng tranh tài?</span>
            <span className={styles.ctaSub}>
              Đăng ký {event?.name} ngay hôm nay để không bỏ lỡ cơ hội.
            </span>
          </div>
          <Button
            label="Đăng ký ngay"
            icon={ArrowRight}
            iconPosition="right"
            color="green"
            variant="primary"
            labelSize="1.05rem"
            onClick={onRegister}
          />
        </div>
      )}

      <div className={styles.footer}>
        <img 
          src="https://res.cloudinary.com/df5ismxf9/image/upload/v1784458586/Group_a8sdhs.png" 
          alt="Logo" 
          className={styles.brandImg} 
        />
        <div className={styles.footLinks}>
          <a className={styles.footLink} href="mailto:ctsv.hcm@fpt.edu.vn">Liên hệ</a>
          <a className={styles.footLink} href="https://www.facebook.com/FPTU.HCM" target="_blank" rel="noreferrer">Fanpage</a>
        </div>
        <span className={styles.copy}>© 2026 SEAL · FPT University</span>
      </div>
    </footer>
  )
}

export default CtaSection
