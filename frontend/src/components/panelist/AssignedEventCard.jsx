import {
  Pen,
  Users,
  ClipboardText,
  PushPin,
} from '@phosphor-icons/react'
import Button from '../shared/Button'
import Badge from '../shared/Badge'
import Tooltip from '../shared/Tooltip'
import TimelineHorizontal from '../shared/TimelineHorizontal'
import RoundInfoCard from './RoundInfoCard'
import styles from './AssignedEventCard.module.css'

/**
 * AssignedEventCard — card "Sự kiện được phân công" cho Panelist (Mentor/Giám khảo).
 *
 * Bố cục 2 cột:
 *  - Cột 1: Thông tin cơ bản (tên + trạng thái, timeline + giới thiệu, box phân công
 *    + cụm actions xếp dọc đứng cạnh).
 *  - Cột 2: Thông tin vòng đang diễn ra (RoundInfoCard).
 *
 * @param {object}   event
 * @param {function} [onOpenScoring]
 * @param {function} [onManageTeams]
 * @param {function} [onViewRubric]
 */
function AssignedEventCard({ event, onOpenScoring, onManageTeams, onViewRubric }) {
  const isJudge = event.roles.includes('judge')
  const isMentor = event.roles.includes('mentor')

  const judging = event.judging ?? {}
  const mentoring = event.mentoring ?? {}
  const percent = judging.total
    ? Math.round((judging.done / judging.total) * 100)
    : 0

  return (
    <article className={styles.card}>
      {/* ===== CỘT 1 — Thông tin cơ bản ===== */}
      <div className={styles.colBasic}>
        {/* Tiêu đề + trạng thái */}
        <div className={styles.header}>
          <h2 className={styles.title}>{event.name}</h2>
          <Badge variant="green" label="Đang diễn ra" size="sm" />
        </div>

        {/* Timeline + giới thiệu ngắn về cuộc thi */}
        <div className={styles.metadataWrapper}>
          <div className={styles.intro}>
            {event.theme && (
              <p className={styles.introRow}>
                <span className={styles.introLabel}>Chủ đề</span>
                <span className={styles.introTheme}>{event.theme}</span>
              </p>
            )}
            {event.description && (
              <div className={styles.introBlock}>
                <span className={styles.introLabel}>Giới thiệu</span>
                <p className={styles.introDesc}>{event.description}</p>
              </div>
            )}
          </div>

          {event.timeline?.length > 0 && (
            <div className={styles.timeline}>
              <TimelineHorizontal milestones={event.timeline} />
            </div>
          )}
        </div>

        {/* Box phân công + cụm actions (đứng cạnh nhau) */}
        <div className={styles.infoBoxes}>
          {/* Box phân công của Panelist — dạng bảng gọn */}
          <div className={styles.assignment}>
            <p className={styles.boxTitle}>
              <ClipboardText size={24} weight="fill" className={styles.boxTitleIcon} />
              Phân công của bạn
            </p>

            <div className={styles.assignList}>
              {/* Giám khảo: phụ trách theo vòng (hover để xem hạng mục) */}
              {isJudge && event.assignment?.judge && (
                <div className={styles.assignRow}>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Vai trò</span>
                    <Badge
                      variant="greenSolid"
                      dot={false}
                      label="Ban giám khảo"
                      icon={<Pen size={13} weight="fill" />}
                    />
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Vòng phụ trách</span>
                    <div className={styles.values}>
                      {(event.assignment.judge.rounds ?? []).map((r) => (
                        <Tooltip
                          key={r.name}
                          content={
                            r.allCategories
                              ? 'Tất cả hạng mục'
                              : `Hạng mục: ${(r.categories ?? []).join(', ')}`
                          }
                          position="top"
                          bgColor="blue"
                          textColor="white"
                        >
                          <span className={styles.roundValue}>{r.name}</span>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mentor: phụ trách theo hạng mục */}
              {isMentor && event.assignment?.mentor && (
                <div className={styles.assignRow}>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Vai trò</span>
                    <Badge
                      variant="orangeSolid"
                      dot={false}
                      label="Mentor chuyên môn"
                      icon={<Users size={13} weight="fill" />}
                    />
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Hạng mục phụ trách</span>
                    <div className={styles.values}>
                      {(event.assignment.mentor.categories ?? []).map((c) => (
                        <span className={styles.catValue} key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cụm actions theo vai trò — xếp dọc, thay cho box thống kê */}
          <div className={styles.actions}>
            {isJudge && (
              <div className={styles.block}>
                <div className={styles.blockLabel}>
                  <span>Tiến độ chấm điểm</span>
                  <span className={styles.count}>
                    {judging.done}/{judging.total}
                  </span>
                </div>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${percent}%` }} />
                </div>
                <Button
                  label="Vào giao diện chấm thi"
                  icon={Pen}
                  iconWeight="fill"
                  variant="primary"
                  color="green"
                  className={styles.fullBtn}
                  onClick={onOpenScoring}
                />
              </div>
            )}

            {isMentor && (
              <div className={styles.block}>
                <p className={styles.mentorText}>
                  <PushPin size={16} weight="fill" className={styles.mentorIcon} />
                  Đang quản lý <strong>{mentoring.teamCount ?? 0} đội thi</strong>
                </p>
                <Button
                  label="Quản lí đội thi của bạn"
                  icon={Users}
                  iconWeight="fill"
                  variant="outline"
                  color="orange"
                  className={styles.fullBtn}
                  onClick={onManageTeams}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== CỘT 2 — Thông tin vòng ===== */}
      <div className={styles.colRound}>
        <RoundInfoCard round={event.currentRound} onViewRubric={onViewRubric} />
      </div>
    </article>
  )
}

export default AssignedEventCard