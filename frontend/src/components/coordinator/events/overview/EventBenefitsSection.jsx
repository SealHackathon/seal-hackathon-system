import { Gift } from '@phosphor-icons/react'
import SectionHeader from '../../../shared/SectionHeader'
import styles from './EventBenefitsSection.module.css'

/**
 * EventBenefitsSection — Quyền lợi tham dự
 * Backend trả về HTML từ Tiptap → render dangerouslySetInnerHTML
 *
 * Props:
 *   html: string (HTML từ tiptap)
 */
function EventBenefitsSection({ html }) {
  if (!html) return null

  return (
    <div className={styles.container}>
      <SectionHeader icon={Gift} title="Quyền lợi tham dự" level="h1" />
      <div className={styles.card}>
        <div className={styles.body}>
          <div
            className={styles.tiptapContent}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}

export default EventBenefitsSection
