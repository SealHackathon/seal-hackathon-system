import { useState } from 'react'
import { X, MagnifyingGlass, CaretLeft, CaretRight, CaretRightIcon } from '@phosphor-icons/react'
import MemberCard from './MemberCard'
import Button from '../shared/Button'
import styles from './FindMemberModal.module.css'

const FAKE_MEMBERS = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: 'Nguyễn Thành Thái',
    email: 'ntbi533@gmail.com',
    school: 'Đại học FPT',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.',
    isInvited: false,
}))

const TOTAL_PAGES = 8

function FindMemberModal({ onClose }) {
    const [search, setSearch] = useState('')
    const [fptOnly, setFptOnly] = useState(false)
    const [invitedIds, setInvitedIds] = useState([])
    const [currentPage, setCurrentPage] = useState(1)

    function handleInvite(id) {
        setInvitedIds(prev => [...prev, id])
    }

    function handleCancel(id) {
        setInvitedIds(prev => prev.filter(i => i !== id))
    }

    const members = FAKE_MEMBERS.map(m => ({
        ...m,
        isInvited: invitedIds.includes(m.id),
    }))

    function getPageItems(currentPage, totalPages) {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const items = []
        const delta = 1 // số trang hiện thêm mỗi bên của currentPage

        const rangeStart = Math.max(2, currentPage - delta)
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

        // Luôn có trang đầu
        items.push(1)

        if (rangeStart > 2) items.push('...')

        for (let i = rangeStart; i <= rangeEnd; i++) {
            items.push(i)
        }

        if (rangeEnd < totalPages - 1) items.push('...')

        items.push(totalPages)

        return items
    }


    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} color="var(--color-text-secondary)" />
                </button>

                <h1 className={styles.title}>Tìm thành viên</h1>
                <p className={styles.subtitle}>
                    Tìm và mời thành viên vào đội của bạn. Lời mời sẽ được gửi đến và người nhận có thể chấp nhận hoặc từ chối.
                </p>

                <div className={styles.searchBar}>
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm theo tên hoặc email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <MagnifyingGlass size={20} color="var(--color-primary-blue)" />
                </div>

                <label className={styles.filter}>
                    <span>Lọc theo</span>
                    <input
                        type="checkbox"
                        checked={fptOnly}
                        onChange={(e) => setFptOnly(e.target.checked)}
                    />
                    <span>Sinh viên Đại học FPT HCMC</span>
                </label>

                <div className={styles.grid}>
                    {members.map(member => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onInvite={handleInvite}
                            onCancel={handleCancel}
                        />
                    ))}
                </div>

                {/* Pagination */}
                <div className={styles.pagination}>

                    <Button
                        label="Trước"
                        labelSize={16}
                        icon={CaretLeft}
                        iconPosition="left"
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    />

                    {getPageItems(currentPage, TOTAL_PAGES).map((item, index) =>
                        item === '...' ? (
                            <span key={`dots-${index}`} className={styles.dots}>...</span>
                        ) : (
                            <Button
                            labelSize={16}
                                key={item}
                                label={String(item)}
                                variant={currentPage === item ? 'primary' : 'outline'}
                                onClick={() => setCurrentPage(item)}
                            />
                        )
                    )}

                    <Button
                        label="Tiếp"
                        labelSize={16}
                        icon={CaretRight}
                        iconPosition="right"
                        variant="outline"
                        disabled={currentPage === TOTAL_PAGES}
                        onClick={() => setCurrentPage(p => p + 1)}
                    />

                </div>
            </div>
        </div>
    )
}

export default FindMemberModal