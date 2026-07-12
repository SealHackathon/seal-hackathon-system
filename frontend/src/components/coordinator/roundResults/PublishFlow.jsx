import Button from '../../shared/Button'
import {
  MegaphoneSimple, LockKey, Gavel, UsersThree, CheckFat,
  SealCheck, WarningCircle, Clock, CheckCircle,
  ArrowRight, ArrowArcLeft,
} from '@phosphor-icons/react'
import styles from './PublishFlow.module.css'

// -- Công bố kết quả theo 3 giai đoạn, có ràng buộc --
// props: stage(1..3), review{remainingSec,pendingRequests,judgesAgreed,judgesTotal},
//        allResultsReady, blockers[], onAdvance, onRollback

const STAGES = [
  { n: 1, label: 'Chỉ BTC xem', sub: 'Kết quả nội bộ', icon: LockKey },
  { n: 2, label: 'Giám khảo xem', sub: 'Cửa sổ phản hồi', icon: Gavel },
  { n: 3, label: 'Thí sinh xem', sub: 'Công bố công khai', icon: UsersThree },
]

function fmtCountdown(sec) {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0')
}

function PublishFlow({ stage, review, allResultsReady, blockers = [], unassignedAwardsCount = 0, onAdvance, onRollback }) {
  const timeUp = review ? review.remainingSec <= 0 : false
  const noReq = review ? review.pendingRequests === 0 : false
  const canPublish = timeUp && noReq && unassignedAwardsCount === 0

  const canAdvance = stage === 1 ? allResultsReady : stage === 2 ? canPublish : false
  const advanceLabel = stage === 1 ? 'Mở cho giám khảo' : stage === 2 ? 'Công bố kết quả' : 'Đã công bố'
  const advanceColor = stage === 2 ? 'green' : 'blue'

  // Thông báo đơn giản dưới nút
  let statusText = null
  if (stage === 1) {
    statusText = allResultsReady ? (
      <span className={styles.msgSuccess}>
        <SealCheck weight="fill" size={18} /> Đã đủ kết quả, sẵn sàng mở cho giám khảo
      </span>
    ) : (
      <span className={styles.msgWarning}>
        <WarningCircle weight="fill" size={18} /> Cần hoàn tất xếp hạng {blockers.length ? `(${blockers.length} đội chưa đủ điểm)` : ''}
      </span>
    )
  } else if (stage === 2 && review) {
    statusText = (
      <span className={styles.msgWarning} style={{ alignItems: 'center', textAlign: 'left' }}>
        <Clock weight="fill" size={18} /> 
        <span>
          Còn lại <strong>{fmtCountdown(review.remainingSec)}</strong> · <strong>{review.pendingRequests}</strong> yêu cầu đổi điểm
          {unassignedAwardsCount > 0 && (
            <>
              {' '}· Cần gán <strong>{unassignedAwardsCount}</strong> giải thưởng
            </>
          )}
        </span>
      </span>
    )
  } else if (stage === 3) {
    statusText = (
      <span className={styles.msgSuccess}>
        <CheckCircle weight="fill" size={18} /> Đã công bố công khai cho thí sinh
      </span>
    )
  }

  return (
    <section className={styles.section}>
      {/* Cột 1: Title */}
      <div className={styles.headText}>
        <div className={styles.titleRow}>
          <MegaphoneSimple size={32} weight="fill" className={styles.titleIcon} />
          <h3 className={styles.title}>Công bố kết quả</h3>
        </div>
        <span className={styles.subtitle}>Mở kết quả theo 3 giai đoạn.</span>
      </div>

      {/* Cột 2: Timeline */}
      <div className={styles.timeline}>
        {STAGES.map((st, i) => {
          const done = st.n < stage
          const active = st.n === stage
          const Icon = st.icon
          const nodeCls = [styles.node, done ? styles.nodeDone : active ? styles.nodeActive : styles.nodeTodo].join(' ')
          return (
            <div className={styles.stageItem} key={st.n}>
              <div className={styles.stageTop}>
                <div className={nodeCls}>
                  {done ? <CheckFat size={20} weight="fill" /> : <Icon size={20} weight="fill" />}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={st.n < stage ? styles.line + ' ' + styles.lineDone : styles.line} />
                )}
              </div>
              <div className={styles.stageLabel}>
                <span className={[styles.stageName, active ? styles.stageNameActive : ''].join(' ')}>{st.label}</span>
                <span className={styles.stageSub}>{st.sub}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cột 3: Controls + Status Text */}
      <div className={styles.actionArea}>
        <div className={styles.controls}>
          <Button
            className={styles.ctrlBtn}
            label="Lùi giai đoạn"
            icon={ArrowArcLeft}
            variant="outline"
            color="blue"
            labelSize="1rem"
            disabled={stage === 1}
            onClick={onRollback}
          />
          <Button
            className={styles.ctrlBtn}
            label={advanceLabel}
            icon={ArrowRight}
            iconPosition="right"
            color={advanceColor}
            labelSize="1rem"
            disabled={!canAdvance}
            onClick={onAdvance}
          />
        </div>
        <div className={styles.statusWrapper}>
          {statusText}
        </div>
      </div>
    </section>
  )
}

export default PublishFlow