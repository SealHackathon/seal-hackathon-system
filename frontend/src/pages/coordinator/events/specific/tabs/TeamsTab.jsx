import { useState, useMemo, useEffect } from 'react'
import CandidateFilterBar from '../../../../../components/candidateApproval/CandidateFilterBar'
import TeamTable from '../../../../../components/teamApproval/TeamTable'
import TeamDetailPanel from '../../../../../components/teamApproval/TeamDetailPanel'
import { TEAM_STATUS } from '../../../../../components/teamApproval/teamStatus'
import axiosClient from '../../../../../api/axiosClient'
import styles from './TeamsTab.module.css'

const STATUS_OPTIONS = Object.entries(TEAM_STATUS)
    .map(([value, meta]) => ({ value, label: meta.label }))

// Assuming categories from tracks, hardcode some or fetch if available
const CATEGORY_OPTIONS = [
    { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
    { value: 'IoT & Smart Systems', label: 'IoT & Smart Systems' },
    { value: 'Blockchain', label: 'Blockchain' },
]

function TeamsTab() {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [status, setStatus] = useState('')
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        const controller = new AbortController()

        async function fetchTeams() {
            setLoading(true)
            setError(null)
            try {
                const res = await axiosClient.get('/team/admin/all-teams', {
                    signal: controller.signal,
                })
                const list = res.data?.body ?? res.data ?? []
                setTeams(list)
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    setError(
                        err.response?.data?.message
                        || err.message
                        || 'Không thể tải danh sách đội thi'
                    )
                }
            } finally {
                setLoading(false)
            }
        }

        fetchTeams()
        return () => controller.abort()
    }, [])

    // Lọc data
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return teams.filter(t => {
            const matchSearch = !q || (t.teamName && t.teamName.toLowerCase().includes(q))
            const matchCategory = !category || t.trackName === category || t.category === category
            const matchStatus = !status || t.teamStatus === status || t.status === status
            return matchSearch && matchCategory && matchStatus
        })
    }, [teams, search, category, status])

    async function updateTeamStatus(team, approve) {
        if (!team.requestId) {
            alert('Không tìm thấy ID yêu cầu xét duyệt (requestId) cho đội này.')
            return
        }

        const nextStatus = approve ? 'APPROVED' : 'REJECTED'
        const teamId = team.teamId || team.id

        // Optimistic UI update
        setTeams(prev =>
            prev.map(t => ((t.teamId || t.id) === teamId ? { ...t, teamStatus: nextStatus, status: nextStatus } : t))
        )
        if (selected && (selected.teamId || selected.id) === teamId) {
             setSelected(prev => ({ ...prev, teamStatus: nextStatus, status: nextStatus }))
        }
        
        try {
            await axiosClient.put(`/team/submission/${team.requestId}/review`, null, {
                params: { approve }
            })
        } catch (err) {
            // Revert on error
            setTeams(prev =>
                prev.map(t => ((t.teamId || t.id) === teamId ? { ...t, teamStatus: team.teamStatus, status: team.status } : t))
            )
            if (selected && (selected.teamId || selected.id) === teamId) {
                 setSelected(prev => ({ ...prev, teamStatus: team.teamStatus, status: team.status }))
            }
            alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại')
        }
    }

    return (
        <div className={styles.tabContainer}>
            <CandidateFilterBar
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                status={status}
                onStatusChange={setStatus}
                categories={CATEGORY_OPTIONS}
                statuses={STATUS_OPTIONS}
                searchPlaceholder="Tìm kiếm tên đội ..."
            />

            <div className={styles.topRow}>
                {loading && <p className={styles.count}>Đang tải danh sách...</p>}
                {!loading && (
                    <p className={styles.count}>{filtered.length} đội thi</p>
                )}
            </div>

            <TeamTable teams={filtered} onSelect={setSelected} />

            <TeamDetailPanel
                team={selected}
                onClose={() => setSelected(null)}
                onApprove={(t) => {
                    updateTeamStatus(t, true)
                }}
                onReject={(t) => {
                    updateTeamStatus(t, false)
                }}
                onRevokeApproval={(t) => {
                    alert('Chức năng hủy xét duyệt chưa được hỗ trợ bởi API!')
                }}
            />
        </div>
    )
}

export default TeamsTab
