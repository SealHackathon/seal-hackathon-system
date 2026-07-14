import { useEffect, useMemo, useState } from 'react'
import { Users } from '@phosphor-icons/react'
import CoordinatorLayout from '../../layouts/CoordinatorLayout'
import SectionHeader from '../../components/shared/SectionHeader'
import CandidateFilterBar from '../../components/candidateApproval/CandidateFilterBar'
import CandidateTable from '../../components/candidateApproval/CandidateTable'
import CandidateDetailPanel from '../../components/candidateApproval/CandidateDetailPanel'
import { CANDIDATE_STATUS } from '../../components/candidateApproval/candidateStatus'
import axiosClient from '../../api/axiosClient' // TODO: sửa lại đúng path thực tế
import styles from './CandidateApprovalPage.module.css'

const STATUS_OPTIONS = Object.entries(CANDIDATE_STATUS)
    .map(([value, meta]) => ({ value, label: meta.label }))

const CATEGORY_OPTIONS = [
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'iot', label: 'IoT & Smart Systems' },
    { value: 'blockchain', label: 'Blockchain' },
]

// ── Map trạng thái tài khoản backend (enum UserStatus) -> status UI ──
function mapAccountStatus(accoutStatus) {
    switch (accoutStatus) {
        case 'ACCEPTED':
            return 'approved'
        case 'REJECTED':
            return 'rejected'
        case 'BANNED':
            return 'locked'
        case 'PROFILE_PENDING':
        case 'PENDING_APPROVAL':
        default:
            return 'pending'
    }
}

// ── Map 1 phần tử response backend -> object candidate dùng trong UI ──
function mapUserToCandidate(u) {
    const profile = u.userIdentityProfileResponse

    return {
        id: u.userId,
        name: u.fullName ?? '',
        email: u.email ?? '',
        phone: u.phoneNumber ?? '',
        avatarUrl: '',
        university: u.schoolName ?? '',
        team: u.teamName && u.teamName !== 'NO_TEAM' ? u.teamName : '',
        role: u.teamRole && u.teamRole !== 'NO_TEAM' ? u.teamRole : 'Thành viên',
        status: mapAccountStatus(u.accoutStatus),
        accountStatusRaw: u.accoutStatus, // giữ lại để lọc/debug nếu cần
        joinedAt: u.registeredDate ?? '',

        cccd: profile ? {
            fullName: profile.fullName ?? '',
            number: profile.cmnd ?? '',
            dob: profile.dateOfBirth ?? '',
            gender: profile.gender ?? '',
            address: profile.thuongtru ?? profile.hometown ?? '',
            frontImage: profile.frontcmnd_img ?? '',
            backImage: profile.cmndBack_img ?? '',
        } : null,

        student: {
            studentId: u.mssv ?? '',
            university: u.schoolName ?? '',
            cardImage: u.studenntCardImg ?? '',
        },

        // Backend hiện chưa trả bio/positions/techTags/topics/cvLink
        profile: {
            bio: '',
            positions: [],
            techTags: {},
            topics: [],
            cvLink: '',
        },
    }
}

function CandidateApprovalPage() {
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [status, setStatus] = useState('')
    const [selected, setSelected] = useState(null)

    // ── Gọi API lấy danh sách thí sinh ──
    useEffect(() => {
        const controller = new AbortController()

        async function fetchCandidates() {
            setLoading(true)
            setError(null)
            try {
                const res = await axiosClient.get('/user/user-info', {
                    signal: controller.signal,
                })

                // Lưu ý: backend đang bị double-wrap ResponseEntity.ok(ResponseEntity.ok(...))
                // Nên sửa ở BE để trả thẳng list, tạm thời FE cố gắng lấy đúng chỗ:
                const list = res.data?.body ?? res.data ?? []

                setCandidates(list.map(mapUserToCandidate))
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    setError(
                        err.response?.data?.message
                        || err.message
                        || 'Không thể tải danh sách thí sinh'
                    )
                }
            } finally {
                setLoading(false)
            }
        }

        fetchCandidates()
        return () => controller.abort()
    }, [])

    // ── Lọc dữ liệu hiển thị ──
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return candidates.filter(c => {
            const matchSearch = !q
                || c.name.toLowerCase().includes(q)
                || c.email.toLowerCase().includes(q)
            const matchStatus = !status || c.status === status
            return matchSearch && matchStatus
        })
    }, [candidates, search, status])

    // ── Cập nhật trạng thái 1 thí sinh qua API ──
    async function updateStatus(candidate, nextStatus) {
    setCandidates(prev =>
        prev.map(c => (c.id === candidate.id ? { ...c, status: nextStatus } : c))
    )

    try {
        await axiosClient.put(`/user/${candidate.id}/status`, {
            status: mapUIStatusToBackend(nextStatus),
        })
    } catch (err) {
        setCandidates(prev =>
            prev.map(c => (c.id === candidate.id ? { ...c, status: candidate.status } : c))
        )
        alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại')
    }
}

    // ── Map ngược: status UI -> enum UserStatus backend ──
    function mapUIStatusToBackend(uiStatus) {
        switch (uiStatus) {
            case 'approved':
                return 'ACCEPTED'
            case 'rejected':
                return 'REJECTED'
            case 'locked':
                return 'BANNED'
            case 'pending':
            default:
                return 'PENDING_APPROVAL'
        }
    }

    

    return (
        <CoordinatorLayout>
            <div className={styles.page}>
                <div className={styles.topRow}>
                    <SectionHeader
                        icon={Users}
                        title="Duyệt hồ sơ thí sinh"
                        level="h1"
                    />
                </div>

                <div className={styles.pageContainer}>
                    <div className={styles.maxWidthWrapper}>
                        <CandidateFilterBar
                            search={search}
                            onSearchChange={setSearch}
                            category={category}
                            onCategoryChange={setCategory}
                            status={status}
                            onStatusChange={setStatus}
                            categories={CATEGORY_OPTIONS}
                            statuses={STATUS_OPTIONS}
                        />

                        {loading && <p className={styles.count}>Đang tải danh sách...</p>}
                        {error && <p className={styles.count}>{error}</p>}
                        {!loading && !error && (
                            <p className={styles.count}>{filtered.length} thí sinh</p>
                        )}

                        <CandidateTable candidates={filtered} onSelect={setSelected} />

                        <CandidateDetailPanel
                            candidate={selected}
                            onClose={() => setSelected(null)}
                            onApprove={c => updateStatus(c, 'approved')}
                            onReject={c => updateStatus(c, 'rejected')}
                            onRevokeApproval={c => updateStatus(c, 'pending')}
                            onLock={c => updateStatus(c, 'locked')}
                            onDelete={c => updateStatus(c, 'rejected')}
                        />
                    </div>
                </div>
            </div>
        </CoordinatorLayout>
    )
}

export default CandidateApprovalPage