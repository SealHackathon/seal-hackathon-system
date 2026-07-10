import Button from '../../shared/Button'
import { Star, Plus, Trophy, WarningCircle } from '@phosphor-icons/react'
import styles from './AwardsSection.module.css'

// -- Section trao giai (chi hien o vong cuoi, day len dau trang) --
// props: main[{key,team,score}], extended[{id,label,team}], onAssignExtended

const MAIN_CFG = {
  first: { label: 'Giải Nhất', rankNum: '1', cls: 'first' },
  second: { label: 'Giải Nhì', rankNum: '2', cls: 'second' },
  third: { label: 'Giải Ba', rankNum: '3', cls: 'third' },
}

function AwardsSection({ main = [], extended = [], onAssignExtended }) {
  const emptyMain = main.filter((m) => !m.team).length
  const emptyExt = extended.filter((e) => !e.team).length
  const totalEmpty = emptyMain + emptyExt
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div className={styles.headTitle}>
          <Trophy size={32} weight="fill" />
          <div>
            <h3 className={styles.title}>Trao giải Vòng chung kết</h3>
            <span className={styles.subtitle}>Giải chính tự gán theo xếp hạng; giải mở rộng gán thủ công</span>
          </div>
        </div>
      </div>


      <div className={styles.podium}>
        {/* Render theo thứ tự: hạng 2, hạng 1, hạng 3 */}
        {[
          main.find((m) => m.key === 'second'),
          main.find((m) => m.key === 'first'),
          main.find((m) => m.key === 'third'),
        ].filter(Boolean).map((m) => {
          const cfg = MAIN_CFG[m.key]
          return (
            <div className={`${styles.podCard} ${styles['pod_' + cfg.cls]}`} key={m.key}>
              <div className={styles.podTop}>
                <div className={styles.podIcon}><Star size={28} weight="fill" /></div>
                <span className={styles.podLabel}>{cfg.label}</span>
                {m.team ? (
                  <>
                    <span className={styles.podTeam}>{m.team.name}</span>
                    <span className={styles.podScore}>{m.score != null ? m.score.toFixed(2) + ' điểm' : ''}</span>
                  </>
                ) : (
                  <span className={styles.podEmpty}>Chưa có đội</span>
                )}
              </div>
              <div className={styles.podBottom}>{cfg.rankNum}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.extWrap}>
        <span className={styles.extTitle}>Giải mở rộng</span>
        <div className={styles.extGrid}>
          {extended.map((e) => (
            <div className={styles.extCard} key={e.id}>
              <span className={styles.extLabel}>{e.label}</span>
              {e.team ? (
                <span className={styles.extTeam}>{e.team.name}</span>
              ) : (
                <button type="button" className={styles.assignBtn} onClick={() => onAssignExtended(e)}>
                  <Plus size={16} weight="bold" /> Gán đội
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {totalEmpty > 0 && (
        <div className={styles.warn}>
          <WarningCircle size={18} weight="fill" />
          <span>Còn {totalEmpty} giải chưa có đội — hãy gán hoặc xác nhận bỏ trống trước khi công bố.</span>
        </div>
      )}
    </section>
  )
}

export default AwardsSection
