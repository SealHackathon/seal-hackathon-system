import { useState } from 'react'
import { Check, Trophy } from '@phosphor-icons/react'
import ModalShell from '../../shared/ModalShell'
import Button from '../../shared/Button'
import styles from './AssignAwardModal.module.css'

function AssignAwardModal({ open, award, teams = [], onClose, onAssign }) {
    if (!open || !award) return null

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState(award.team?.id || null)

    function handleConfirm() {
        if (!selected) return
        const selectedTeam = teams.find(t => t.id === selected)
        if (selectedTeam) {
            onAssign(award.id, selectedTeam)
        }
        onClose()
    }

    const footer = (
        <div className={styles.footer}>
            <Button label="Hủy" variant="outline" color="blue" onClick={onClose} />
            <Button label="Xác nhận" variant="primary" color="blue" onClick={handleConfirm} disabled={!selected} />
        </div>
    )

    return (
        <ModalShell
            onClose={onClose}
            size="md"
            footer={footer}
            title="Gán giải phụ"
            subtitle={`Giải: ${award.label}`}
            icon={<Trophy size={26} weight="fill" />}
        >
            <div className={styles.list}>
                {teams.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-secondary-blue)' }}>
                        Không có đội thi nào để gán.
                    </div>
                )}
                {teams.map(team => {
                    const isSelected = selected === team.id
                    return (
                        <div
                            key={team.id}
                            className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
                            onClick={() => setSelected(isSelected ? null : team.id)}
                        >
                            <div className={styles.info}>
                                <span className={styles.name}>{team.name}</span>
                                {team.category && <span className={styles.desc}>{team.category}</span>}
                            </div>
                            <div className={styles.state}>
                                {isSelected && (
                                    <span className={styles.checkmark}>
                                        <Check size={20} weight="bold" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </ModalShell>
    )
}

export default AssignAwardModal
