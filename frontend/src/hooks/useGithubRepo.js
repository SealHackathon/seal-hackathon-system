import { useEffect, useState } from 'react'
import { fetchGithubRepo } from '../utils/github'

/**
 * useGithubRepo — hook lấy dữ liệu repo GitHub từ URL.
 *
 * @param {string} url                 — URL GitHub của bài nộp
 * @param {object} [options] - Tùy chọn: { token } để nâng rate limit
 * @returns {object} { repo, loading, error }
 *
 * @example
 * const { repo, loading, error } = useGithubRepo(submission.github?.url)
 * <GithubRepoView repo={repo} loading={loading} error={error} />
 */
function useGithubRepo(url, options = {}) {
  const [repo, setRepo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = options.token

  useEffect(() => {
    if (!url) {
      setRepo(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchGithubRepo(url, { token })
      .then((data) => {
        if (!cancelled) setRepo(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [url, token])

  return { repo, loading, error }
}

export default useGithubRepo