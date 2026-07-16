import { useState, useMemo } from 'react'
import CandidateFilterBar from '../../../../../components/candidateApproval/CandidateFilterBar'
import TeamTable from '../../../../../components/teamApproval/TeamTable'
import TeamDetailPanel from '../../../../../components/teamApproval/TeamDetailPanel'
import { TEAM_STATUS } from '../../../../../components/teamApproval/teamStatus'
import styles from './TeamsTab.module.css'

const STATUS_OPTIONS = Object.entries(TEAM_STATUS)
    .map(([value, meta]) => ({ value, label: meta.label }))

const CATEGORY_OPTIONS = [
    { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
    { value: 'IoT & Smart Systems', label: 'IoT & Smart Systems' },
    { value: 'Blockchain', label: 'Blockchain' },
]

const MOCK_TEAMS = [
    {
        id: 1,
        teamName: 'AI Pioneers',
        description: 'Đội ngũ đam mê AI, chuyên giải quyết các bài toán về Machine Learning và Computer Vision.',
        category: 'AI & Machine Learning',
        status: 'pending',
        currentMembers: 4,
        maxMembers: 5,
        members: [
            {
                id: 101,
                name: 'Nguyễn Thành Thái',
                school: 'Đại học FPT',
                isLeader: true,
                avatar: '',
                bio: 'Đam mê xây dựng sản phẩm thực tế và có kinh nghiệm với React, Spring Boot...',
                positions: ['Backend Developer'],
                techTags: ['Java', 'Spring Boot', 'MySQL'],
                topics: ['System Design', 'AI'],
                cvLink: 'https://github.com/Thaibc'
            },
            {
                id: 102,
                name: 'Hồ Ngọc Bảo Trân',
                school: 'Đại học FPT',
                isLeader: false,
                avatar: '',
                bio: 'Yêu thích sự kết hợp giữa thiết kế và công nghệ...',
                positions: ['Frontend Developer', 'UI/UX Designer'],
                techTags: ['React', 'Tailwind', 'Figma'],
                topics: ['UI/UX Design', 'Web Development'],
                cvLink: 'https://github.com/hngbtran'
            }
        ]
    },
    {
        id: 2,
        teamName: 'Crypto Knights',
        description: 'Chúng tôi xây dựng tương lai của tài chính với công nghệ chuỗi khối.',
        category: 'Blockchain',
        status: 'approved',
        currentMembers: 5,
        maxMembers: 5,
        members: [
            {
                id: 201,
                name: 'Bùi Thiên Khánh',
                school: 'Đại học FPT',
                isLeader: true,
                avatar: '',
                bio: 'Phát triển dApp và smart contracts trên Ethereum.',
                positions: ['Smart Contract Developer'],
                techTags: ['Solidity', 'Ethereum', 'Web3.js'],
                topics: ['DeFi', 'Web3'],
                cvLink: 'https://github.com/Kbuiii'
            },
            {
                id: 202,
                name: 'Phạm Khắc Đăng Khoa',
                school: 'Đại học FPT',
                isLeader: false,
                avatar: '',
                bio: 'Chuyên thiết kế giao diện cho các ứng dụng phi tập trung.',
                positions: ['Frontend Developer', 'UI/UX Designer'],
                techTags: ['React', 'Figma'],
                topics: ['Web3', 'UI/UX Design'],
                cvLink: 'https://github.com/khoa2099'
            },
            {
                id: 203,
                name: 'Mạc Minh Tùng',
                school: 'Đại học FPT',
                isLeader: false,
                avatar: '',
                bio: 'Backend Dev với kinh nghiệm quản lý hệ thống phân tán.',
                positions: ['Backend Developer'],
                techTags: ['Java', 'Spring Boot', 'Redis'],
                topics: ['Backend Architecture', 'Cloud Computing'],
                cvLink: 'https://github.com/Mtung0603'
            }
        ]
    }
]

function TeamsTab() {
    const [teams, setTeams] = useState(MOCK_TEAMS)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [status, setStatus] = useState('')
    const [selected, setSelected] = useState(null)

    // Lọc mock data
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return teams.filter(t => {
            const matchSearch = !q || t.teamName.toLowerCase().includes(q)
            const matchCategory = !category || t.category === category
            const matchStatus = !status || t.status === status
            return matchSearch && matchCategory && matchStatus
        })
    }, [teams, search, category, status])

    function updateTeamStatus(teamId, newStatus) {
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: newStatus } : t))
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
                <p className={styles.count}>{filtered.length} đội thi</p>
            </div>

            <TeamTable teams={filtered} onSelect={setSelected} />

            <TeamDetailPanel
                team={selected}
                onClose={() => setSelected(null)}
                onApprove={(t) => {
                    updateTeamStatus(t.id, 'approved')
                    setSelected(null)
                }}
                onReject={(t) => {
                    updateTeamStatus(t.id, 'rejected')
                    setSelected(null)
                }}
                onRevokeApproval={(t) => {
                    updateTeamStatus(t.id, 'pending')
                    setSelected(null)
                }}
            />
        </div>
    )
}

export default TeamsTab
