import { Gavel } from '@phosphor-icons/react'
import SectionHeader from '../../../shared/SectionHeader'
import styles from './GeneralRulesSection.module.css'

/**
 * GeneralRulesSection — Quy định chung
 * Backend trả về HTML từ Tiptap
 *
 * Props:
 *   html: string (HTML từ tiptap)
 */
function GeneralRulesSection({ html }) {
  if (!html) return null

  return (
    <div className={styles.container}>
      <SectionHeader icon={Gavel} title="Quy định chung" level="h1" />
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

export default GeneralRulesSection
