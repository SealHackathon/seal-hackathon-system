import { CrownSimple, Tag, UsersThree, Trophy, Star, ListChecks, ChatCircleDots } from '@phosphor-icons/react'
import styles from './TeamDetailHero.module.css'

// Lấy chữ cái đầu cho avatar khi chưa có ảnh.
function initials(name) {
  const parts = (name ?? '').trim().split(/\s+/)
  const last = parts[parts.length - 1] ?? ''
  return last.charAt(0).toUpperCase()
}

/**
 * TeamDetailHero — banner đầu trang chi tiết đội (mentor).
 * Cụm tên đội + hạng mục (dọc) nằm cùng hàng với thanh KPI.
 *
 * @param {object} team  — { name, category, members, kpi }
 */
function TeamDetailHero({ team, hidePendingQuestions = false }) {
  const kpi = team.kpi ?? {}
  const pending = kpi.pendingQuestions ?? 0

  return (
    <section className={styles.hero}>
      {/* Hàng trên: cụm danh tính (dọc) | thanh KPI */}
      <div className={styles.top}>
        <div className={styles.identity}>
          <div className={styles.titleRow}>
            <UsersThree size={30} weight="fill" className={styles.teamIcon} />
            <h1 className={styles.name}>{team.name}</h1>
          </div>
          {team.category && (
            <span className={styles.category}>
              <Tag size={15} weight="fill" /> {team.category}
            </span>
          )}
        </div>

        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>
              <Trophy size={22} weight="fill" />
            </span>
            <span className={styles.kpiBody}>
              <span className={styles.kpiValue}>
                #{kpi.rank ?? '—'}<span className={styles.kpiUnit}>/{kpi.totalTeams ?? '—'}</span>
              </span>
              <span className={styles.kpiLabel}>Xếp hạng</span>
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>
              <Star size={22} weight="fill" />
            </span>
            <span className={styles.kpiBody}>
              <span className={styles.kpiValue}>
                {kpi.latestScore != null ? kpi.latestScore.toFixed(2) : '—'}<span className={styles.kpiUnit}>/10</span>
              </span>
              <span className={styles.kpiLabel}>Điểm gần nhất</span>
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>
              <ListChecks size={22} weight="fill" />
            </span>
            <span className={styles.kpiBody}>
              <span className={styles.kpiValue}>
                {kpi.roundsDone ?? 0}<span className={styles.kpiUnit}>/{kpi.roundsTotal ?? 0}</span>
              </span>
              <span className={styles.kpiLabel}>Tiến độ vòng</span>
            </span>
          </div>

          {!hidePendingQuestions && (
            <div className={styles.kpiCard}>
              <span className={styles.kpiIcon}>
                <ChatCircleDots size={22} weight="fill" />
              </span>
              <span className={styles.kpiBody}>
                {pending > 0 ? (
                  <span className={styles.kpiValue}>{pending}</span>
                ) : (
                  <span className={styles.kpiValue}>0</span>
                )}
                <span className={styles.kpiLabel}>Câu hỏi chờ</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thành viên */}
      <div className={styles.membersBlock}>
        <span className={styles.membersLabel}>Thành viên ({team.members.length})</span>
        <div className={styles.members}>
          {team.members.map((mbr, i) => (
            <div key={mbr.id ?? i} className={styles.memberCard}>
              <span className={styles.avatar}>
                {initials(mbr.name)}
                {mbr.isLeader && <CrownSimple size={28} weight="fill" className={styles.crown} />}
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

export default TeamDetailHero