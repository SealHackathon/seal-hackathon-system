import { useEffect, useMemo, useState } from 'react'
import { UsersThree } from '@phosphor-icons/react'
import CoordinatorLayout from '../../layouts/CoordinatorLayout'
import SectionHeader from '../../components/shared/SectionHeader'
import TeamApprovalFilterBar from '../../components/teamApproval/TeamApprovalFilterBar'
import TeamApprovalTable from '../../components/teamApproval/TeamApprovalTable'
import TeamDetailPanel from '../../components/teamApproval/TeamDetailPanel'
import { TEAM_STATUS } from '../../components/teamApproval/teamStatus'
import axiosClient from '../../api/axiosClient'
import styles from './TeamApprovalPage.module.css'

const STATUS_OPTIONS = Object.entries(TEAM_STATUS)
    .map(([value, meta]) => ({ value, label: meta.label }))

function TeamApprovalPage() {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [selected, setSelected] = useState(null)

    // ── Gọi API lấy danh sách đội thi ──
    useEffect(() => {
        const controller = new AbortController()

        async function fetchTeams() {
            setLoading(true)
            setError(null)
            try {
                // Gọi API backend (cần được implement)
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

    // ── Lọc dữ liệu hiển thị ──
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return teams.filter(t => {
            const matchSearch = !q
                || t.teamName?.toLowerCase().includes(q)
                || t.leaderName?.toLowerCase().includes(q)
            const matchStatus = !status || t.teamStatus === status
            return matchSearch && matchStatus
        })
    }, [teams, search, status])

    // ── Cập nhật trạng thái đội thi qua API ──
    async function updateStatus(team, approved) {
        if (!team.teamId) {
            alert('Không tìm thấy ID đội thi (teamId) cho đội này.')
            return
        }

        const approve = approved? 'APPROVED' : 'REJECTED'

        // Optimistic UI update
        setTeams(prev =>
            prev.map(t => (t.teamId === team.teamId ? { ...t, teamStatus: approve } : t))
        )

        try {
            await axiosClient.put(`/team/submission/${team.teamId}/review`, null, {
                params: { approve }
            })
        } catch (err) {
            // Revert on error
            setTeams(prev =>
                prev.map(t => (t.teamId === team.teamId ? { ...t, teamStatus: team.teamStatus } : t))
            )
            alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại')
        }
    }


    const onRevokeApprove = () => {
        axiosClient.put('/team/submission/revoke-approval', null, {
            params: { teamId: selected.teamId }
        })
        .then((res) => {
        }).catch((err) => {
            console.log(err)
        })
    }

    return (
        <CoordinatorLayout>
            <div className={styles.page}>
                <div className={styles.topRow}>
                    <SectionHeader
                        icon={UsersThree}
                        title="Duyệt đội thi"
                        level="h1"
                    />
                </div>

                <div className={styles.pageContainer}>
                    <div className={styles.maxWidthWrapper}>
                        <TeamApprovalFilterBar
                            search={search}
                            onSearchChange={setSearch}
                            status={status}
                            onStatusChange={setStatus}
                            statuses={STATUS_OPTIONS}
                        />

                        {loading && <p className={styles.count}>Đang tải danh sách...</p>}
                        {error && <p className={styles.count}>{error}</p>}
                        {!loading && !error && (
                            <p className={styles.count}>{filtered.length} đội thi</p>
                        )}

                        <TeamApprovalTable teams={filtered} onSelect={setSelected} />

                        <TeamDetailPanel
                            team={selected}
                            onClose={() => setSelected(null)}
                            onApprove={t => updateStatus(t, true)}
                            onReject={t => updateStatus(t, false)}
                            // Backend hiện tại chưa có API "Revoke approval" riêng cho Team,
                            // chức năng này có thể map thành Reject nếu cần thiết hoặc ẩn đi.
                            onRevokeApproval={onRevokeApprove}
                        />
                    </div>
                </div>
            </div>
        </CoordinatorLayout>
    )
}

export default TeamApprovalPage
