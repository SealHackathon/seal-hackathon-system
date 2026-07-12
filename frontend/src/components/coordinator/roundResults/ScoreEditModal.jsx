import { useState, useMemo } from 'react'
import {
  NotePencil,
  User,
  Clock,
  UsersThree,
  Package,
  ChatCircleDots,
  CaretRight,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendUp,
  TrendDown,
  Minus,
} from '@phosphor-icons/react'
import ModalShell from '../../shared/ModalShell'
import Button from '../../shared/Button'
import FormTextarea from '../../shared/FormTextarea'
import RadioCardGroup from '../../shared/RadioCardGroup'
import TeamDetailModal from './TeamDetailModal'
import SubmissionModal from '../../panelist/event/mentorTeamDetail/SubmissionModal'
import JudgeScoreChart from './JudgeScoreChart'
import styles from './ScoreEditModal.module.css'

// Hai lựa chọn quyết định của BTC
const ACTIONS = [
  {
    value: 'approve',
    label: 'Duyệt yêu cầu',
    description: 'Chấp nhận chỉnh điểm, hệ thống tự tính lại xếp hạng.',
    icon: CheckCircle,
  },
  {
    value: 'reject',
    label: 'Từ chối',
    description: 'Giữ nguyên điểm hiện tại, ghi nhận lý do từ chối.',
    icon: XCircle,
  },
]

// Mock round data để truyền vào SubmissionModal
const mockRound = {
  name: '',
  late: false,
  submittedAt: null,
  submission: { github: { url: 'https://github.com' }, slide: { url: '' }, video: { url: '' } },
}

// Mock team data để truyền vào TeamDetailModal
const mockTeam = { rank: 0, score: 0, team: { id: '', name: '' } }

/**
 * ScoreEditModal — BTC xem xét yêu cầu chỉnh điểm từ BGK.
 *
 * Props:
 *   isOpen          : boolean
 *   onClose         : () => void
 *   data            : object (shape như mockScoreEditData)
 *   onOpenTeam      : (teamId) => void  (optional)
 *   onOpenSubmission: (teamId) => void  (optional)
 */
function ScoreEditModal({ isOpen, onClose, data, onOpenTeam, onOpenSubmission }) {
  const [action, setAction] = useState('approve')
  const [note, setNote] = useState('')
  const [teamDetailOpen, setTeamDetailOpen] = useState(false)
  const [submissionOpen, setSubmissionOpen] = useState(false)

  if (!isOpen || !data) return null

  const { criteria, judges, affectedCriteriaId, impact } = data
  const sender = judges.find((j) => j.isSender)
  const affectedCriteria = criteria.find((c) => c.id === affectedCriteriaId)

  // Tính điểm trung bình tất cả BGK cho tiêu chí bị chỉnh
  const allScoresForAffected = judges.map((j) => j.scores[affectedCriteriaId])
  const meanAffected =
    allScoresForAffected.reduce((a, b) => a + b, 0) / allScoresForAffected.length

  // Bảng tiêu chí: tính weighted score của BGK gửi (hiện tại vs đề xuất)
  const criteriaRows = useMemo(() =>
    criteria.map((c) => {
      const current = sender?.scores[c.id] ?? 0
      const proposed = sender?.proposedScores?.[c.id] ?? null
      const isAffected = c.id === affectedCriteriaId
      // Điểm trung bình tất cả BGK cho tiêu chí này
      const scores = judges.map((j) => j.scores[c.id])
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length
      const delta = proposed !== null ? proposed - current : null
      return { ...c, current, proposed, isAffected, mean, delta }
    }), [criteria, judges, sender, affectedCriteriaId])

  const handleOpenTeam = () => {
    if (onOpenTeam) onOpenTeam(data.teamId)
    else setTeamDetailOpen(true)
  }
  const handleOpenSubmission = () => {
    if (onOpenSubmission) onOpenSubmission(data.teamId)
    else setSubmissionOpen(true)
  }

  const footer = (
    <div className={styles.footerContainer}>
      <Button label="Hủy" variant="outline" color="blue" onClick={onClose} />
      <Button
        label="Xác nhận quyết định"
        variant="primary"
        color="blue"
        onClick={onClose}
        disabled={!note.trim()}
      />
    </div>
  )

  // Render icon xu hướng xếp hạng
  const RankIcon =
    impact.after.teamRank < impact.before.teamRank
      ? TrendUp
      : impact.after.teamRank > impact.before.teamRank
      ? TrendDown
      : Minus

  const rankChanged = impact.after.teamRank !== impact.before.teamRank
  const rankBetter = impact.after.teamRank < impact.before.teamRank

  return (
    <>
      <ModalShell
        onClose={onClose}
        title="Xem xét yêu cầu chỉnh điểm"
        icon={<NotePencil size={24} weight="fill" />}
        subtitle="Kiểm tra độ chênh lệch điểm số trước khi đưa ra quyết định duyệt hoặc từ chối."
        footer={footer}
        size="lg"
        showBottomOverlay
      >
        <div className={styles.content}>

          {/* ===================== SECTION 1: NGỮ CẢNH ===================== */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>Thông tin yêu cầu</h4>

            <div className={styles.infoBox}>
              {/* Meta row: BGK gửi + thời gian + trạng thái */}
              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIconWrap}>
                    <User size={16} weight="fill" />
                  </span>
                  <span className={styles.metaLabel}>Người yêu cầu:</span>
                  <span className={styles.metaValue}>{sender?.name}</span>
                </div>
                <div className={styles.metaDot} />
                <div className={styles.metaItem}>
                  <span className={styles.metaIconWrap}>
                    <Clock size={16} weight="fill" />
                  </span>
                  <span className={styles.metaLabel}>Thời gian:</span>
                  <span className={styles.metaValue}>{data.time}</span>
                </div>
                <div className={styles.metaDot} />
                <span className={styles.statusBadge}>Đang chờ xử lí</span>
              </div>

              <div className={styles.infoBoxDivider} />

              {/* Link: đội thi + bài nộp */}
              <div className={styles.linkList}>
                <button type="button" className={styles.linkItem} onClick={handleOpenTeam}>
                  <div className={styles.linkItemLeft}>
                    <UsersThree size={20} weight="fill" className={styles.linkItemIcon} />
                    <span className={styles.linkItemLabel}>Đội thi</span>
                  </div>
                  <div className={styles.linkItemRight}>
                    <strong className={styles.linkItemValue}>{data.teamName}</strong>
                    <CaretRight size={20} weight="bold" className={styles.linkItemArrow} />
                  </div>
                </button>

                <button type="button" className={styles.linkItem} onClick={handleOpenSubmission}>
                  <div className={styles.linkItemLeft}>
                    <Package size={20} weight="fill" className={styles.linkItemIcon} />
                    <span className={styles.linkItemLabel}>Bài nộp</span>
                  </div>
                  <div className={styles.linkItemRight}>
                    <strong className={styles.linkItemValue}>{data.round}</strong>
                    <CaretRight size={20} weight="bold" className={styles.linkItemArrow} />
                  </div>
                </button>
              </div>

              <div className={styles.infoBoxDivider} />

              {/* Lý do BGK ghi */}
              <div className={styles.noteSection}>
                <div className={styles.noteIconWrap}>
                  <ChatCircleDots size={28} weight="fill" className={styles.noteIcon} />
                  <span className={styles.noteLabel}>Lý do yêu cầu từ ban giám khảo</span>
                </div>
                <p className={styles.noteText}>{data.reason}</p>
              </div>
            </div>
          </div>

          {/* ===================== SECTION 2: PHÂN TÍCH ĐIỂM ===================== */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>Phân tích điểm số</h4>

            {/* Bảng tiêu chí */}
            <div className={styles.criteriaTable}>
              <div className={styles.tableHead}>
                <span>Tiêu chí</span>
                <span>Trọng số</span>
                <span>TB các BGK</span>
                <span>Hiện tại</span>
                <span>Đề xuất</span>
                <span>Chênh lệch</span>
              </div>
              {criteriaRows.map((row) => (
                <div
                  key={row.id}
                  className={`${styles.tableRow} ${row.isAffected ? styles.tableRowHighlight : ''}`}
                >
                  <span className={styles.criteriaName}>
                    {row.isAffected && <span className={styles.affectedDot} />}
                    {row.name}
                  </span>
                  <span className={styles.weightBadge}>{row.weight}%</span>
                  <span className={styles.cellMean}>{row.mean.toFixed(1)}</span>
                  <span className={styles.cellCurrent}>{row.current.toFixed(1)}</span>
                  <span className={styles.cellProposed}>
                    {row.proposed !== null ? (
                      <strong>{row.proposed.toFixed(1)}</strong>
                    ) : (
                      <span className={styles.cellNA}>—</span>
                    )}
                  </span>
                  <span
                    className={`${styles.cellDelta} ${
                      row.delta === null
                        ? styles.deltaNone
                        : row.delta > 0
                        ? styles.deltaPos
                        : styles.deltaNeg
                    }`}
                  >
                    {row.delta === null
                      ? '—'
                      : row.delta > 0
                      ? `+${row.delta.toFixed(1)}`
                      : row.delta.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart: Individual Value Plot */}
            <div className={styles.chartBlock}>
              <div className={styles.chartHeader}>
                <span className={styles.chartTitle}>Phân tán điểm theo tiêu chí</span>
                <div className={styles.chartLegend}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotNormal} /> BGK khác
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotSender} /> {sender?.name}
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotProposed} /> Đề xuất
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendBand} /> ±1σ
                  </span>
                </div>
              </div>
              <JudgeScoreChart
                criteria={criteria}
                judges={judges}
                affectedId={affectedCriteriaId}
              />
            </div>

            {/* Impact: Before / After */}
            <div className={styles.impactRow}>
              {/* Trước */}
              <div className={styles.impactCard}>
                <span className={styles.impactCardLabel}>Trước khi chỉnh</span>
                <div className={styles.impactScores}>
                  <div className={styles.impactScore}>
                    <span className={styles.impactScoreNum}>{impact.before.judgeTotal.toFixed(2)}</span>
                    <span className={styles.impactScoreDesc}>Điểm BGK</span>
                  </div>
                  <div className={styles.impactDivider} />
                  <div className={styles.impactScore}>
                    <span className={styles.impactScoreNum}>{impact.before.teamScore.toFixed(2)}</span>
                    <span className={styles.impactScoreDesc}>Điểm đội</span>
                  </div>
                  <div className={styles.impactDivider} />
                  <div className={styles.impactScore}>
                    <span className={styles.impactScoreNum}>#{impact.before.teamRank}</span>
                    <span className={styles.impactScoreDesc}>Xếp hạng</span>
                  </div>
                </div>
              </div>

              <ArrowRight size={20} weight="bold" className={styles.impactArrow} />

              {/* Sau */}
              <div className={`${styles.impactCard} ${styles.impactCardAfter}`}>
                <span className={styles.impactCardLabel}>Sau khi duyệt</span>
                <div className={styles.impactScores}>
                  <div className={styles.impactScore}>
                    <span className={`${styles.impactScoreNum} ${styles.impactNumGreen}`}>
                      {impact.after.judgeTotal.toFixed(2)}
                    </span>
                    <span className={styles.impactScoreDesc}>Điểm BGK</span>
                  </div>
                  <div className={styles.impactDivider} />
                  <div className={styles.impactScore}>
                    <span className={`${styles.impactScoreNum} ${styles.impactNumGreen}`}>
                      {impact.after.teamScore.toFixed(2)}
                    </span>
                    <span className={styles.impactScoreDesc}>Điểm đội</span>
                  </div>
                  <div className={styles.impactDivider} />
                  <div className={styles.impactScore}>
                    <span
                      className={`${styles.impactScoreNum} ${
                        rankBetter ? styles.impactNumGreen : styles.impactNumOrange
                      }`}
                    >
                      #{impact.after.teamRank}
                      {rankChanged && (
                        <RankIcon size={16} weight="bold" style={{ marginLeft: '0.2em' }} />
                      )}
                    </span>
                    <span className={styles.impactScoreDesc}>Xếp hạng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== SECTION 3: QUYẾT ĐỊNH ===================== */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>Quyết định của ban tổ chức</h4>
            <RadioCardGroup
              options={ACTIONS}
              value={action}
              onChange={setAction}
              columns={2}
            />
          </div>

          <div className={styles.reasonBox}>
            <FormTextarea
              label="Ghi chú quyết định (Bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'Ghi chú lý do duyệt yêu cầu...'
                  : 'Ghi rõ lý do từ chối để thông báo lại cho ban giám khảo...'
              }
              required
            />
          </div>
        </div>
      </ModalShell>

      {/* Modal chi tiết đội — fallback */}
      <TeamDetailModal
        open={teamDetailOpen}
        team={{ ...mockTeam, team: { id: data.teamId, name: data.teamName } }}
        onClose={() => setTeamDetailOpen(false)}
      />

      {/* Modal bài nộp — fallback */}
      <SubmissionModal
        open={submissionOpen}
        round={{ ...mockRound, name: data.round }}
        onClose={() => setSubmissionOpen(false)}
      />
    </>
  )
}

export default ScoreEditModal
