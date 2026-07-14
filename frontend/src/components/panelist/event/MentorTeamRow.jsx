import { UsersThree, ChatCircle, CheckCircle, CaretRight, Warning } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../../shared/Badge'
import Button from '../../shared/Button'
import Tooltip from '../../shared/Tooltip'
import SubmissionRing from '../../shared/SubmissionRing'
import styles from './MentorTeamTable.module.css'

// Nhãn cột "Kết quả gần nhất" theo trạng thái đội.
const RESULT = {
  top:       { variant: 'orange', text: (t) => `Top ${t.rank}` },
  competing: { variant: 'blue',  text: () => 'Đang thi đấu' },
  attention: { variant: 'blue',  text: () => 'Đang thi đấu' },
  stopped:   { variant: 'gray',  text: () => 'Đã dừng bước' },
}

/**
 * MentorTeamRow — một dòng đội trong bảng MentorTeamTable.
 * Dùng chung style của bảng (MentorTeamTable.module.css).
 *
 * @param {object}   team            — xem shape trong mock assignment.mentor.teams
 * @param {function} onOpenRequests  — (team) => void, mở popup câu hỏi của đội
 */
function MentorTeamRow({ team, onOpenRequests }) {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const total = team.progress?.total ?? 0
  const done = team.progress?.done ?? 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const barStyle = { width: `${pct}%` }

  const isStopped = team.status === 'stopped'
  const result = RESULT[team.status] ?? RESULT.competing

  const submissionItems = [
    { key: 'github', label: 'GitHub repo', done: !!team.submission?.github },
    { key: 'video', label: 'Video demo', done: !!team.submission?.video },
    { key: 'slide', label: 'Slide', done: !!team.submission?.slide },
  ]

  // Nội dung cột đội (tên, trưởng nhóm, nhãn lĩnh vực)
  const teamCell = (
    <div className={styles.teamCell}>
      <span className={styles.teamName}>{team.name}</span>
      <span className={styles.teamLeader}>Trưởng nhóm: {team.leader}</span>
      <div className={styles.teamTags}>
        <Badge variant="blue" size="sm" dot={false} label={team.leaderPosition} />
      </div>
    </div>
  )

  return (
    <tr className={team.status === 'attention' ? styles.rowBehind : ''}>
      {/* Đội — hover hiện lí do cần chú ý (chỉ khi có lí do) */}
      <td className={styles.tdLeft}>
        {team.attentionReason ? (
          <Tooltip
            position="right"
            bgColor="white"
            content={
              <div className={styles.attentionTip}>
                <Badge
                  variant="orange"
                  size="sm"
                  dot={false}
                  label="Cần chú ý"
                  icon={<Warning size={12} weight="fill" />}
                />
                <span className={styles.attentionReason}>{team.attentionReason}</span>
              </div>
            }
          >
            {teamCell}
          </Tooltip>
        ) : (
          teamCell
        )}
      </td>

      {/* Thành viên */}
      <td>
        <span className={styles.dataNum}>
          <UsersThree size={17} weight="fill" className={styles.cellIcon} />
          {team.memberCount}
        </span>
      </td>

      {/* Vòng & tiến độ */}
      <td>
        <div className={styles.roundCell}>
          <div className={styles.roundTop}>

            <Badge
              variant={isStopped ? 'gray' : 'blueSolid'}
              size="sm"
              dot={false}
              label={isStopped ? (team.stoppedRound ?? 'Đã dừng') : team.currentRound}
            />

            <span className={styles.progressValue}>
              {done}/{total} vòng
            </span>
            
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={barStyle} />
          </div>
        </div>
      </td>

      {/* Bài nộp */}
      <td>
        {isStopped ? (
          <span className={styles.muted}>—</span>
        ) : (
          <div className={styles.centerCell}>
            <SubmissionRing items={submissionItems} />
          </div>
        )}
      </td>

      {/* Kết quả gần nhất — chỉ đội đã có kết quả (top) mới hiện điểm */}
      <td>
        <div className={styles.resultCell}>
          <Badge variant={result.variant} size="sm" dot={false} label={result.text(team)} />
          {team.status === 'top' ? (
            <span className={styles.resultScore}>{team.score}/10</span>
          ) : (
            <span className={styles.muted}>—</span>
          )}
        </div>
      </td>

      {/* Câu hỏi chờ */}
      <td>
        {team.questionsTotal > 0 ? (
          <button
            type="button"
            className={`${styles.questionBtn} ${team.pendingQuestions == 0 ? styles.questionBtnDone : ''}`}
            onClick={() => onOpenRequests?.(team)}
          >
            {team.pendingQuestions > 0 ? (
              <span className={styles.qPending}>
                <ChatCircle size={17} weight="fill" className={styles.qIcon} />
                {team.pendingQuestions}
              </span>
            ) : (
              <span className={styles.qDone}>
                <CheckCircle size={17} weight="fill" />
                Đã xong
              </span>
            )}
          </button>
        ) : (
          <span className={styles.muted}>—</span>
        )}
      </td>

      {/* Action */}
      <td className={styles.tdAction}>
        <Button
          label="Xem tiến độ"
          labelSize={13}
          variant="outline"
          color="blue"
          icon={CaretRight}
          iconPosition="right"
          onClick={() => navigate(`/panelist/events/${eventId}/mentor/teams/${team.id}`)}
        />
      </td>
    </tr>
  )
}

export default MentorTeamRow