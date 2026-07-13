import { useMemo, useState } from 'react'
import { Users } from '@phosphor-icons/react'
import CoordinatorLayout from '../../layouts/CoordinatorLayout'
import SectionHeader from '../../components/shared/SectionHeader'
import CandidateFilterBar from '../../components/candidateApproval/CandidateFilterBar'
import CandidateTable from '../../components/candidateApproval/CandidateTable'
import CandidateDetailPanel from '../../components/candidateApproval/CandidateDetailPanel'
import { CANDIDATE_STATUS } from '../../components/candidateApproval/candidateStatus'
import styles from './CandidateApprovalPage.module.css'

// ── Dữ liệu mẫu — thay bằng API thực tế ──
const MOCK_CANDIDATES = [
    {
        id: 1,
        name: 'Nguyễn Văn An',
        email: 'example@gmail.com',
        phone: '0987654321',
        avatarUrl: '',
        university: 'Đại học FPT (TP.HCM)',
        team: 'PayFlow',
        role: 'Thành viên',
        status: 'approved',
        joinedAt: '12/04/2026',
        cccd: {
            fullName: 'Nguyễn Văn A',
            number: '075300000000',
            dob: '19/10/2005',
            gender: 'Nam',
            address: 'Thủ Đức, TP. Hồ Chí Minh',
            frontImage: '',
            backImage: '',
        },
        student: {
            studentId: 'SE180000',
            university: 'Đại học FPT (TP.HCM)',
            cardImage: '',
        },
        profile: {
            bio: 'Mình là sinh viên năm 3 CNTT, đam mê xây dựng sản phẩm thực tế và có kinh nghiệm với React, Spring Boot...',
            positions: ['Backend Developer', 'Frontend Developer'],
            techTags: { 'frontend': ['React', 'Vue'], 'backend': ['Node.js', 'Java'] },
            topics: ['AI & Machine Learning', 'Blockchain'],
            cvLink: 'https://github.com/example',
        },
    },
    {
        id: 2,
        name: 'Trần Thị Bình',
        email: 'binh.tran@gmail.com',
        phone: '0912345678',
        avatarUrl: '',
        university: 'Đại học Bách Khoa (TP.HCM)',
        team: 'DataMinds',
        role: 'Đội trưởng',
        status: 'pending',
        joinedAt: '13/04/2026',
        cccd: { fullName: 'Trần Thị Bình', number: '079305000111', dob: '02/03/2004', gender: 'Nữ', address: 'Quận 10, TP. Hồ Chí Minh' },
        student: { studentId: 'BK190111', university: 'Đại học Bách Khoa (TP.HCM)' },
    },
    {
        id: 3,
        name: 'Lê Hoàng Cường',
        email: 'cuong.le@gmail.com',
        phone: '0909112233',
        avatarUrl: '',
        university: 'Đại học Khoa học Tự nhiên',
        team: '',
        role: 'Thành viên',
        status: 'rejected',
        joinedAt: '14/04/2026',
        cccd: { fullName: 'Lê Hoàng Cường', number: '079204000222', dob: '25/12/2003', gender: 'Nam', address: 'Quận 5, TP. Hồ Chí Minh' },
        student: { studentId: 'KHTN200222', university: 'Đại học Khoa học Tự nhiên' },
    },
]

const STATUS_OPTIONS = Object.entries(CANDIDATE_STATUS)
    .map(([value, meta]) => ({ value, label: meta.label }))

const CATEGORY_OPTIONS = [
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'iot', label: 'IoT & Smart Systems' },
    { value: 'blockchain', label: 'Blockchain' },
]

function CandidateApprovalPage() {
    const [candidates, setCandidates] = useState(MOCK_CANDIDATES)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [status, setStatus] = useState('')
    const [selected, setSelected] = useState(null)

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

    // ── Cập nhật trạng thái 1 thí sinh ──
    function updateStatus(candidate, nextStatus) {
        setCandidates(prev =>
            prev.map(c => (c.id === candidate.id ? { ...c, status: nextStatus } : c))
        )
    }

    function removeCandidate(candidate) {
        setCandidates(prev => prev.filter(c => c.id !== candidate.id))
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

                        <p className={styles.count}>{filtered.length} thí sinh</p>

                        <CandidateTable candidates={filtered} onSelect={setSelected} />

                        <CandidateDetailPanel
                            candidate={selected}
                            onClose={() => setSelected(null)}
                            onApprove={c => updateStatus(c, 'approved')}
                            onReject={c => updateStatus(c, 'rejected')}
                            onRevokeApproval={c => updateStatus(c, 'pending')}
                            onLock={c => updateStatus(c, 'locked')}
                            onDelete={removeCandidate}
                        />
                    </div>
                </div>
            </div>
        </CoordinatorLayout>
    )
}

export default CandidateApprovalPage
