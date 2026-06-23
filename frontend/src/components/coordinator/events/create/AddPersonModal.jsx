import { useState } from 'react'
import { MagnifyingGlass, User, Check } from '@phosphor-icons/react'
import ModalShell from '../../../shared/ModalShell'
import Button from '../../../shared/Button'
import styles from './AddPersonModal.module.css'
/**
 * AddPersonModal
 *
 * Props:
 *   role         : 'mentor' | 'judge'
 *   persons      : Array<{ id, name, title, org, avatar? }>
 *   alreadyAdded : string[]  — danh sách userId đã thêm
 *   loading      : boolean
 *   onSearch     : (query: string) => void
 *   onAdd        : (selected: person[]) => void
 *   onClose      : () => void
 */
function AddPersonModal({
    role = 'mentor',
    persons = [],
    alreadyAdded = [],
    loading = false,
    onSearch,
    onAdd,
    onClose,
}) {
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState([])

    const title = role === 'judge' ? 'Thêm Giám khảo' : 'Thêm Mentor'

    function handleSearch(e) {
        setQuery(e.target.value)
        onSearch?.(e.target.value)
    }

    function toggle(person) {
        if (alreadyAdded.includes(person.id)) return
        setSelected(prev =>
            prev.find(p => p.id === person.id)
                ? prev.filter(p => p.id !== person.id)
                : [...prev, person]
        )
    }

    function handleAdd() {
        if (selected.length === 0) return
        onAdd?.(selected)
        onClose?.()
    }

    const footer = (
        <div className={styles.footer}>
            <Button
                label="Hủy"
                variant="outline"
                color="blue"
                labelSize={15}
                onClick={onClose}
            />
            <Button
                label={selected.length > 0 ? `Thêm ${selected.length} người` : 'Thêm'}
                variant="primary"
                color="blue"
                labelSize={15}
                disabled={selected.length === 0}
                onClick={handleAdd}
            />
        </div>
    )

    return (
        <ModalShell onClose={onClose} size="md" footer={footer}>
            <div className={styles.wrapper}>
                <h2 className={styles.title}>{title}</h2>

                {/* Search */}
                <div className={styles.searchBox}>
                    <MagnifyingGlass size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Tìm theo tên hoặc email..."
                        value={query}
                        onChange={handleSearch}
                        autoFocus
                    />
                </div>

                {/* Selected chips */}
                {selected.length > 0 && (
                    <div className={styles.selectedChips}>
                        {selected.map(p => (
                            <span key={p.id} className={styles.chip}>
                                {p.name}
                                <button type="button" className={styles.chipRemove}
                                    onClick={() => toggle(p)}>&#x2715;</button>
                            </span>
                        ))}
                    </div>
                )}

                {/* List */}
                <div className={styles.list}>
                    {loading && (
                        <div className={styles.loadingState}>Đang tìm kiếm...</div>
                    )}

                    {!loading && persons.length === 0 && (
                        <div className={styles.emptyState}>
                            <User size={32} className={styles.emptyIcon} />
                            <p>{query ? 'Không tìm thấy kết quả phù hợp.' : 'Nhập tên để tìm kiếm giảng viên.'}</p>
                        </div>
                    )}

                    {!loading && persons.map(person => {
                        const isAdded    = alreadyAdded.includes(person.id)
                        const isSelected = selected.find(p => p.id === person.id)

                        return (
                            <div
                                key={person.id}
                                className={[
                                    styles.personRow,
                                    isAdded    && styles.personRowAdded,
                                    isSelected && styles.personRowSelected,
                                ].filter(Boolean).join(' ')}
                                onClick={() => toggle(person)}
                            >
                                {/* Avatar */}
                                <div className={styles.avatar}>
                                    {person.avatar
                                        ? <img src={person.avatar} alt={person.name} className={styles.avatarImg} />
                                        : <span className={styles.avatarFallback}>
                                            {person.name?.charAt(0).toUpperCase()}
                                          </span>
                                    }
                                </div>

                                {/* Info */}
                                <div className={styles.personInfo}>
                                    <span className={styles.personName}>{person.name}</span>
                                    <span className={styles.personSub}>
                                        {[person.title, person.org].filter(Boolean).join(' · ')}
                                    </span>
                                </div>

                                {/* State */}
                                <div className={styles.personState}>
                                    {isAdded ? (
                                        <span className={styles.addedLabel}>Đã thêm</span>
                                    ) : isSelected ? (
                                        <span className={styles.checkmark}>
                                            <Check size={14} weight="bold" />
                                        </span>
                                    ) : (
                                        <span className={styles.addPlus}>+</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </ModalShell>
    )
}

export default AddPersonModal
