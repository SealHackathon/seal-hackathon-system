import {
  GithubLogo,
  Star,
  GitFork,
  Eye,
  Users,
  Info,
  ArrowSquareOut,
  GitCommit,
  Code,
  FileText,
  GitBranch,
  Scales,
  Globe,
} from '@phosphor-icons/react'
import Button from '../../shared/Button'
import TagList from '../../coordinator/TagList'
import styles from './GithubRepoView.module.css'

// Màu cho biểu đồ ngôn ngữ (dùng token của design system).
const LANG_COLORS = [
  'var(--color-primary-blue)',
  'var(--color-secondary-blue)',
  'var(--color-dark-blue)',
  'var(--color-primary-green)',
  'var(--color-primary-orange)',
]

function fmtDate(d) {
  if (!d) return '—'
  const x = new Date(d)
  return (
    String(x.getDate()).padStart(2, '0') +
    '/' +
    String(x.getMonth() + 1).padStart(2, '0') +
    '/' +
    x.getFullYear()
  )
}

/**
 * GithubRepoView — thông tin repo lấy từ GitHub API cho BGK tiện xem.
 * Trọng tâm: commit gần nhất. Metadata phụ + README + từ khóa xếp bên dưới.
 *
 * @param {object}  [repo]
 * @param {boolean} [loading]
 * @param {Error}   [error]
 */
function GithubRepoView({ repo, loading = false, error = null }) {
  if (loading) {
    return <p className={styles.empty}>Đang tải thông tin repository…</p>
  }
  if (error) {
    return <p className={styles.empty}>Không tải được repository: {error.message}</p>
  }
  if (!repo) {
    return <p className={styles.empty}>Đội này chưa nộp link GitHub.</p>
  }

  const s = repo.stats ?? {}
  const fullName = (repo.owner ? repo.owner + '/' : '') + (repo.repo ?? '')
  const readmeMarkup = repo.readmeHtml ? { __html: repo.readmeHtml } : null

  // Ngôn ngữ: nhận object { ten: bytes } (từ API) hoặc mảng ten (fallback).
  const langRaw = repo.languages ?? {}
  const langEntries = Array.isArray(langRaw)
    ? langRaw.map((name) => ({ name, bytes: 0 }))
    : Object.entries(langRaw).map(([name, bytes]) => ({ name, bytes: Number(bytes) || 0 }))
  langEntries.sort((a, b) => b.bytes - a.bytes)
  const langTotal = langEntries.reduce((sum, l) => sum + l.bytes, 0)

  const statChips = [
    { key: 'contributors', icon: Users, value: s.contributors, label: 'Contributors' },
    { key: 'stars', icon: Star, value: s.stars, label: 'Stars' },
    { key: 'forks', icon: GitFork, value: s.forks, label: 'Forks' },
    { key: 'watchers', icon: Eye, value: s.watchers, label: 'Watchers' },
    { key: 'issues', icon: Info, value: s.issues, label: 'Issues' },
  ]

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.infoCircle}>
            <Info size={20} weight="fill" />
          </span>
          <h2 className={styles.title}>Thông tin repository</h2>
        </div>
        {repo.url && (
          <Button
            label="Mở trên GitHub"
            icon={ArrowSquareOut}
            iconWeight="bold"
            iconPosition="left"
            variant="outline"
            color="blue"
            onClick={() => window.open(repo.url, '_blank', 'noopener')}
          />
        )}
      </div>

      {/* Tên repo */}
      <div className={styles.repoName}>
        <GithubLogo size={22} weight="fill" />
        <span>{fullName}</span>
      </div>

      {/* Chỉ số repo */}
      <div className={styles.stats}>
        {statChips.map((c) => {
          const Icon = c.icon
          return (
            <span key={c.key} className={styles.statChip}>
              <Icon size={16} weight="fill" className={styles.statIcon} />
              <span className={styles.statNum}>{c.value ?? 0}</span>
              <span className={styles.statLabel}>{c.label}</span>
            </span>
          )
        })}
      </div>

      {/* Metadata phụ: ngày tạo + mô tả */}
      <div className={styles.metaRow}>
        <div className={styles.metaCellDate}>
          <span className={styles.metaLabel}>Ngày tạo repo</span>
          <span className={styles.metaValue}>{fmtDate(repo.createdAt)}</span>
        </div>
        <div className={styles.metaCellDesc}>
          <span className={styles.metaLabel}>Mô tả</span>
          <span className={repo.description ? styles.metaValue : styles.metaMuted}>
            {repo.description || 'Chưa có mô tả'}
          </span>
        </div>
      </div>

      {/* Commit — thông tin chính, làm nổi bật */}
      <div className={styles.commitBox}>
        <div className={styles.commitLeft}>
          <div className={styles.numBlock}>
            <span className={styles.bigNum}>{s.commits ?? 0}</span>
            <span className={styles.bigLabel}>Tổng số Commits</span>
          </div>
          <div className={styles.numBlock}>
            <span className={styles.bigNum}>{repo.lastUpdatedText ?? '—'}</span>
            <span className={styles.bigLabel}>Cập nhật gần nhất</span>
          </div>
        </div>
        <div className={styles.commitRight}>
          <div className={styles.commitHead}>
            <GitCommit size={30} weight="fill" className={styles.commitIcon} />
            <span>Commit gần nhất</span>
          </div>
          {repo.lastCommit ? (
            <>
              <p className={styles.commitMsg}>“{repo.lastCommit.message}”</p>
              <span className={styles.commitMeta}>
                {repo.lastCommit.author} · {repo.lastCommit.relativeTime}
              </span>
            </>
          ) : (
            <p className={styles.commitMuted}>Chưa có commit.</p>
          )}
        </div>
      </div>

      {/* Ngôn ngữ sử dụng + % */}
      {langEntries.length > 0 && (
        <div className={styles.langBox}>
          <span className={styles.langHead}>
            <Code size={17} weight="bold" /> Ngôn ngữ sử dụng
          </span>

          {langTotal > 0 ? (
            <>
              <div className={styles.langBar}>
                {langEntries.map((l, i) => {
                  const segStyle = {
                    width: (l.bytes / langTotal) * 100 + '%',
                    background: LANG_COLORS[i % LANG_COLORS.length],
                  }
                  return <span key={l.name} className={styles.langSeg} style={segStyle} />
                })}
              </div>
              <div className={styles.langLegend}>
                {langEntries.map((l, i) => {
                  const dotStyle = { background: LANG_COLORS[i % LANG_COLORS.length] }
                  const pct = ((l.bytes / langTotal) * 100).toFixed(1)
                  return (
                    <span key={l.name} className={styles.langLegendItem}>
                      <span className={styles.langDot} style={dotStyle} />
                      <span className={styles.langName}>{l.name}</span>
                      <span className={styles.langPct}>{pct}%</span>
                    </span>
                  )
                })}
              </div>
            </>
          ) : (
            <div className={styles.langChips}>
              {langEntries.map((l) => (
                <span key={l.name} className={styles.langChip}>{l.name}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* README — để dưới vì chiếm nhiều chỗ */}
      {readmeMarkup && (
        <div className={styles.readmeBox}>
          <span className={styles.readmeHead}>
            <FileText size={17} weight="fill" /> README.md
          </span>
          <div className={styles.readmeBody} dangerouslySetInnerHTML={readmeMarkup} />
        </div>
      )}

      {/* Thông tin phụ (đơn giản, dưới cùng) */}
      <div className={styles.footer}>
        <div className={styles.extraRow}>
          {repo.defaultBranch && (
            <span className={styles.extraItem}>
              <GitBranch size={14} weight="fill" /> {repo.defaultBranch}
            </span>
          )}
          {repo.license && (
            <span className={styles.extraItem}>
              <Scales size={14} weight="fill" /> {repo.license}
            </span>
          )}
          {repo.homepage && (
            <a className={styles.extraLink} href={repo.homepage} target="_blank" rel="noreferrer">
              <Globe size={14} weight="fill" /> Trang demo
            </a>
          )}
        </div>
        {repo.topics?.length > 0 && <TagList tags={repo.topics} maxVisible={6} />}
      </div>
    </div>
  )
}

export default GithubRepoView