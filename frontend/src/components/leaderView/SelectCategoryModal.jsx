import { useState } from 'react'
import { Check, Users } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import Button from '../shared/Button'
import styles from './SelectCategoryModal.module.css'

function SelectCategoryModal({
    categories = [],
    selectedCategoryId = null,
    onSelect,
    onClose,
}) {
    const [selected, setSelected] = useState(selectedCategoryId)

    function getDisplayedCurrentTeams(category) {
        let currentTeams = category.currentTeams

        if (selected === category.id && selectedCategoryId !== category.id) {
            currentTeams += 1
        }

        if (selectedCategoryId === category.id && selected !== category.id) {
            currentTeams -= 1
        }

        return currentTeams
    }

    function toggle(category) {
        const isFull = getDisplayedCurrentTeams(category) >= category.maxTeamPerTrack
        if (isFull && category.id !== selectedCategoryId) return
        
        if (selected === category.id) {
            setSelected(null)
        } else {
            setSelected(category.id)
        }
    }

    function handleConfirm() {
        onSelect?.(selected)
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
                label="Xác nhận"
                variant="primary"
                color="blue"
                labelSize={15}
                onClick={handleConfirm}
            />
        </div>
    )

    return (
        <ModalShell onClose={onClose} size="md" footer={footer}>
            <div className={styles.wrapper}>
                <h2 className={styles.title}>Chọn Hạng mục</h2>

                <div className={styles.list}>
                    {categories.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-secondary-blue)' }}>
                            Chưa có hạng mục nào.
                        </div>
                    )}

                    {categories.map(category => {
                        const displayedCurrentTeams = getDisplayedCurrentTeams(category)
                        const isFull = displayedCurrentTeams >= category.maxTeamPerTrack
                        const isSelected = selected === category.id
                        // Nếu full thì disable, trừ khi đây chính là hạng mục đội đang chọn (để họ có thể click bỏ chọn)
                        const isDisabled = isFull && !isSelected

                        return (
                            <div
                                key={category.id}
                                className={[
                                    styles.categoryRow,
                                    isDisabled && styles.categoryRowDisabled,
                                    isSelected && styles.categoryRowSelected,
                                ].filter(Boolean).join(' ')}
                                onClick={() => toggle(category)}
                            >
                                <div className={styles.categoryInfo}>
                                    <span className={styles.categoryName}>{category.name}</span>
                                    {category.desc && <span className={styles.categoryDesc}>{category.desc}</span>}
                                    <div className={styles.categoryStats}>
                                        <Users size={16} color="var(--color-secondary-blue)" />
                                        <span className={[
                                            styles.statBadge, 
                                            isFull && styles.statBadgeFull
                                        ].filter(Boolean).join(' ')}>
                                            {displayedCurrentTeams} / {category.maxTeamPerTrack} đội
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.categoryState}>
                                    {isDisabled || getDisplayedCurrentTeams(category) === category.maxTeamPerTrack ? (
                                        <span className={styles.disabledLabel}>Đã đầy</span>
                                    ) : isSelected ? (
                                        <span className={styles.checkmark}>
                                            <Check size={20} weight="bold" />
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </ModalShell>
    )
}

export default SelectCategoryModal
