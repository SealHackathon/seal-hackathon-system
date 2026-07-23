import { useState } from 'react'
import { CrownSimple, Flag, Tag, Clock, UsersThree } from '@phosphor-icons/react'
import Badge from '../../shared/Badge'
import Button from '../../shared/Button'
import styles from './ScoringTeamHero.module.css'

// Trạng thái chấm của đội (đồng bộ với bảng bài nộp).
const STATUS = {
  unscored: { variant: 'gray', label: 'Chưa chấm' },
  draft: { variant: 'orange', label: 'Đã lưu nháp' },
  done: { variant: 'green', label: 'Đã chấm xong' },
}

function fmtDateTime(iso) {
  if (!iso) return '--'
  const x = new Date(iso)
  const hh = String(x.getHours()).padStart(2, '0')
  const mm = String(x.getMinutes()).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  const mo = String(x.getMonth() + 1).padStart(2, '0')
  return hh + ':' + mm + ' · ' + dd + '/' + mo
}

// Lấy chữ cái đầu cho avatar khi chưa có ảnh.
function initials(name) {
  const parts = (name ?? '').trim().split(/\s+/)
  const last = parts[parts.length - 1] ?? ''
  return last.charAt(0).toUpperCase()
}

/**
 * ScoringTeamHero — banner thông tin đội ở đầu trang chấm điểm.
 * Hiển thị tên đội, trạng thái, nút đánh dấu vi phạm, meta đội và danh sách thành viên.
 *
 * @param {object}   team
 * @param {function} [onToggleViolation]  — (nextFlagged) => void
 */
function ScoringTeamHero({ team, onToggleViolation }) {
  const flagged = !!team.flaggedViolation
  const status = STATUS[team.status] ?? STATUS.unscored

  const toggle = () => {
    onToggleViolation?.(!flagged)
  }

  return (
    <section className={styles.hero}>
      <div className={styles.top}>
        <div className={styles.identity}>
          <span className={styles.teamIcon}>
            <UsersThree size={32} weight="fill" />
          </span>
          <h1 className={styles.name}>{team.name}</h1>
          <Badge variant={status.variant} size="sm" label={status.label} />
          {team.submittedAt && (
            <Badge
              variant="green"
              size="sm"
              icon={<Clock size={13} weight="fill" />}
              label={`Nộp lúc ${fmtDateTime(team.submittedAt)}`}
            />
          )}

        </div>

        <Button
          label={flagged ? 'Đã đánh dấu vi phạm' : 'Đánh dấu vi phạm'}
          icon={Flag}
          iconWeight="fill"
          variant={flagged ? 'primary' : 'outline'}
          color="orange"
          onClick={toggle}
        />
      </div>

      {/* Meta đội: hạng mục · thời gian nộp (badge xanh lá) */}
      <div className={styles.metaRow}>
        {team.category && (
          <span className={styles.metaItem}>
            <Tag size={15} weight="fill" /> {team.category}
          </span>
        )}
      </div>

      {/* Thành viên */}
      <div className={styles.membersBlock}>
        <span className={styles.membersLabel}>Thành viên ({team.members.length})</span>
        <div className={styles.members}>
          {team.members.map((mbr, i) => (
            <div key={mbr.id ?? i} className={styles.memberCard}>
              <span className={styles.avatar}>
                {initials(mbr.name)}
                {mbr.isLeader && (
                  <CrownSimple size={28} weight="fill" className={styles.crown} />
                )}
              </span>
              <span className={styles.memberText}>
                <span className={styles.memberName}>{mbr.name}</span>
                <span className={styles.memberPos}>{mbr.position}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ScoringTeamHero