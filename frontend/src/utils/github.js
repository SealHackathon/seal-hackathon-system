// Repo public gọi không cần token, nhưng giới hạn 60 request/giờ/IP.
// Truyền { token } nếu muốn nâng giới hạn lên 5000/giờ.

// ── Tách owner/repo từ URL GitHub ──
export function parseRepoUrl(url) {
  if (!url) return null
  const m = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i)
  if (!m) return null
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') }
}

// ── Thời gian tương đối tiếng Việt ("2 giờ trước") ──
export function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return mins + ' phút trước'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + ' giờ trước'
  const days = Math.floor(hours / 24)
  if (days < 30) return days + ' ngày trước'
  const months = Math.floor(days / 30)
  if (months < 12) return months + ' tháng trước'
  return Math.floor(months / 12) + ' năm trước'
}

// ── Đọc số trang cuối từ header Link (để đếm tổng số item) ──
function lastPageFromLink(linkHeader) {
  if (!linkHeader) return null
  const m = linkHeader.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)
  return m ? Number(m[1]) : null
}

function buildHeaders(token, accept) {
  const headers = { Accept: accept || 'application/vnd.github+json' }
  if (token) headers.Authorization = 'Bearer ' + token
  return headers
}

async function fetchLanguages(base, headers) {
  const res = await fetch(base + '/languages', { headers })
  if (!res.ok) return {}
  return res.json() // { TypeScript: 12345, Python: 6789, ... }
}

async function fetchLastCommit(base, headers) {
  const res = await fetch(base + '/commits?per_page=1', { headers })
  if (!res.ok) return null
  const list = await res.json()
  const c = Array.isArray(list) ? list[0] : null
  if (!c) return null
  return {
    message: (c.commit?.message ?? '').split('\n')[0],
    author: c.author?.login ?? c.commit?.author?.name ?? 'unknown',
    relativeTime: timeAgo(c.commit?.author?.date),
  }
}

// Đếm tổng item qua header Link; không có phân trang thì đếm trực tiếp.
async function fetchCount(url, headers) {
  const res = await fetch(url, { headers })
  if (!res.ok) return 0
  const last = lastPageFromLink(res.headers.get('link'))
  if (last) return last
  const data = await res.json()
  return Array.isArray(data) ? data.length : 0
}

async function fetchReadmeHtml(base, token) {
  const headers = buildHeaders(token, 'application/vnd.github.html+json')
  const res = await fetch(base + '/readme', { headers })
  if (!res.ok) return null
  return res.text() // HTML đã được GitHub render sẵn
}

/**
 * Lấy toàn bộ thông tin repo, chuẩn hoá về shape mà GithubRepoView dùng.
 *
 * @param {string} rawUrl  — URL GitHub bất kỳ (vd https://github.com/owner/repo)
 * @param {object} [options] - Tùy chọn: { token } để nâng rate limit
 * @returns {Promise<object>}
 */
export async function fetchGithubRepo(rawUrl, options = {}) {
  const parsed = parseRepoUrl(rawUrl)
  if (!parsed) throw new Error('URL GitHub không hợp lệ')

  const { owner, repo } = parsed
  const { token } = options
  const base = 'https://api.github.com/repos/' + owner + '/' + repo
  const headers = buildHeaders(token)

  const repoRes = await fetch(base, { headers })
  if (!repoRes.ok) {
    throw new Error('Không lấy được repo (mã ' + repoRes.status + ')')
  }
  const info = await repoRes.json()

  const [languages, lastCommit, commits, contributors, readmeHtml] = await Promise.all([
    fetchLanguages(base, headers),
    fetchLastCommit(base, headers),
    fetchCount(base + '/commits?per_page=1', headers),
    fetchCount(base + '/contributors?per_page=1&anon=true', headers),
    fetchReadmeHtml(base, token),
  ])

  const license =
    info.license?.spdx_id && info.license.spdx_id !== 'NOASSERTION'
      ? info.license.spdx_id
      : info.license?.name ?? null

  return {
    owner,
    repo,
    url: info.html_url,
    description: info.description ?? '',
    createdAt: info.created_at,
    defaultBranch: info.default_branch,
    license,
    homepage: info.homepage || null,
    topics: info.topics ?? [],
    languages,
    stats: {
      contributors,
      stars: info.stargazers_count ?? 0,
      forks: info.forks_count ?? 0,
      watchers: info.subscribers_count ?? info.watchers_count ?? 0,
      issues: info.open_issues_count ?? 0,
      commits,
    },
    lastUpdatedText: timeAgo(info.pushed_at),
    lastCommit,
    readmeHtml,
  }
}