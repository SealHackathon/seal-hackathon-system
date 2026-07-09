import { useState } from 'react'
import { SquaresFour, Plus, Trash } from '@phosphor-icons/react'
import SelectCategoryModal from './SelectCategoryModal'
import styles from './TeamCategoryPanel.module.css'

function TeamCategoryPanel({
    categories = [],
    selectedCategoryId = null,
    isLeader = false,
    onCategoryChange
}) {
    const [showModal, setShowModal] = useState(false)

    const selectedCategory = categories.find(c => c.id === selectedCategoryId)

    return (
        <div className={styles.wrapper}>
            <div className={styles.leftCol}>
                <div className={styles.titleRow}>
                    <SquaresFour size={24} color="var(--color-border-blue)" weight="fill" />
                    <p className={styles.title}>
                        Hạng mục thi đấu <span className={styles.required}>*</span>
                    </p>
                </div>
                
                <p className={styles.desc}>
                    Hạng mục bài toán mà đội của bạn sẽ giải quyết trong cuộc thi.
                </p>
            </div>

            <div className={styles.rightCol}>
                {selectedCategory ? (
                <div className={styles.rubricSelected}>
                    <div className={styles.rubricInfo}>
                        <span className={styles.rubricLabel}>{selectedCategory.name}</span>
                    </div>
                    {isLeader && (
                        <div className={styles.rubricActions}>
                            <button className={styles.rubricChangeBtn} onClick={() => setShowModal(true)}>
                                Thay đổi
                            </button>
                            <button className={styles.rubricRemoveBtn} onClick={() => onCategoryChange(null)}>
                                <Trash size={20} weight='fill' />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                isLeader ? (
                    <div className={styles.rubricPlaceholder} onClick={() => setShowModal(true)}>
                        <Plus size={20} />
                        <span>Chọn hạng mục</span>
                    </div>
                ) : (
                    <div className={styles.rubricSelected} style={{ opacity: 0.6 }}>
                        <div className={styles.rubricInfo}>
                            <span className={styles.rubricLabel} style={{ color: 'var(--color-secondary-blue)' }}>Đội chưa chọn hạng mục</span>
                        </div>
                    </div>
                )
            )}
            </div>

            {showModal && (
                <SelectCategoryModal
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelect={(id) => onCategoryChange(id)}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}

export default TeamCategoryPanel
