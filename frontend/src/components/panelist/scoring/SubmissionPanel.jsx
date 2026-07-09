import { useState } from 'react'
import { GithubLogo, Presentation, VideoCamera } from '@phosphor-icons/react'
import GithubRepoView from './GithubRepoView'
import EmbedPreview from './EmbedPreview'
import useGithubRepo from '../../../hooks/useGithubRepo'
import styles from './SubmissionPanel.module.css'

const TABS = [
  { key: 'github', label: 'GitHub', icon: GithubLogo },
  { key: 'slide', label: 'Slide', icon: Presentation },
  { key: 'video', label: 'Video', icon: VideoCamera },
]

// Có dữ liệu cho tab hay chưa (để hiện chấm chấm "chưa nộp").
function hasData(key, submission) {
  if (key === 'github') return !!submission.github
  const r = submission[key]
  return !!(r && (r.url || r.fileUrl))
}

/**
 * SubmissionPanel — cột trái: xem nội dung bài nộp qua các tab GitHub / Slide / Video.
 *
 * @param {object} submission  — { github, slide, video }
 */
function SubmissionPanel({ submission }) {
  const [tab, setTab] = useState('github')

  // Lấy dữ liệu GitHub thật theo link bài nộp; fallback về data có sẵn nếu chưa fetch xong.
  const { repo, loading, error } = useGithubRepo(submission.github?.url)
  const githubRepo = repo ?? submission.github

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TABS.map((t) => {
          const Icon = t.icon
          const filled = hasData(t.key, submission)
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              <Icon size={18} weight="fill" />
              {t.label}
              {!filled && <span className={styles.missingDot} title="Chưa nộp" />}
            </button>
          )
        })}
      </div>

      <div className={styles.tabBody}>
        {tab === 'github' && (
          <GithubRepoView repo={githubRepo} loading={loading} error={error} />
        )}
        {tab === 'slide' && <EmbedPreview kind="slide" resource={submission.slide} />}
        {tab === 'video' && <EmbedPreview kind="video" resource={submission.video} />}
      </div>
    </div>
  )
}

export default SubmissionPanel