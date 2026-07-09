import { useState } from 'react'
import { ChatText, Trash } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../../shared/Badge'
import ScoreSlider from './ScoreSlider'
import styles from './ScoringPanel.module.css'

/**
 * CriterionRow — một dòng tiêu chí: ô nhập điểm + slider + khu vực nhận xét.
 * Dùng chung stylesheet với ScoringPanel.
 *
 * @param {object}   criterion  — { id, name, description, points, percent }
 * @param {number}   value
 * @param {string}   note
 * @param {function} onScore    — (num) => void
 * @param {function} onNote     — (text) => void
 * @param {boolean}  readOnly
 */
function CriterionRow({ criterion, value, note, onScore, onNote, readOnly }) {
  const [showNote, setShowNote] = useState(!!note)
  const c = criterion

  return (
    <div className={styles.criterion}>
      <div className={styles.critHead}>
        <div className={styles.critInfo}>
          <span className={styles.critName}>{c.name}</span>
          <span className={styles.critDesc}>{c.description}</span>
        </div>
        <Badge
          variant="blueSolid"
          size="md"
          dot={false}
          label={c.points + 'đ · ' + c.percent + '%'}
        />
      </div>

      <div className={styles.sliderAndNote}>
        <div className={styles.sliderWrap}>
          <ScoreSlider value={value} onChange={onScore} readOnly={readOnly} />
        </div>

        <div
          className={`${styles.noteWrap} ${readOnly ? styles.noteWrapReadOnly : (showNote ? styles.noteWrapExpanded : styles.noteWrapCollapsed)
            }`}
        >
          {/* Nhận xét theo tiêu chí */}
          {readOnly ? (
            note ? (
              <p className={styles.noteRead}>{note}</p>
            ) : null
          ) : showNote ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              style={{ width: '100%', position: 'relative', flexShrink: 0 }}
            >
              <textarea
                className={styles.noteAreaSingle}
                rows={1}
                placeholder="Nhận xét cho tiêu chí này..."
                value={note ?? ''}
                onChange={(e) => onNote(e.target.value)}
                data-lenis-prevent="true"
              />
              <button
                type="button"
                className={styles.noteCloseSingle}
                title="Xóa nhận xét"
                onClick={() => {
                  onNote('')
                  setShowNote(false)
                }}
              >
                <Trash size={18} weight="fill" />
              </button>
            </motion.div>
          ) : (
            <button
              type="button"
              className={styles.addNote}
              onClick={() => setShowNote(true)}
              style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <ChatText size={15} weight="fill" /> Thêm nhận xét
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CriterionRow