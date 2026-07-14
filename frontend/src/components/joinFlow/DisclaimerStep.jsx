import { useState } from 'react'
import { WarningCircle, ArrowSquareOut } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import Button from '../shared/Button'
import styles from './DisclaimerStep.module.css'

function DisclaimerStep({ onClose, onNext, notes }) {
    const [agreed, setAgreed] = useState(false)

    return (
        <ModalShell
            size='md'
            onClose={onClose}
            closeOnBackdrop={false}
            footer={
                // <StepFooter
                //     currentStep={1}
                //     totalSteps={3}
                //     stepLabel="Lưu ý"
                //     onBack={() => {}}
                //     onNext={onNext}
                //     nextDisabled={!agreed}
                //     backDisabled={true}
                // />
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button 
                        label="Xác nhận và Tham gia" 
                        variant="primary" 
                        onClick={onNext} 
                        disabled={!agreed} 
                    />
                </div>
            }
        >
            <div className={styles.titleRow}>
                <WarningCircle size={32} weight="bold" color="var(--color-primary-blue)" />
                <h1 className={styles.title}>Lưu ý trước khi đăng ký</h1>
            </div>

            <div className={styles.banner}>
                <p>
                    Đây là lưu ý quan trọng để đảm bảo quyền lợi của bạn.<br />
                    Vui lòng <strong>đọc kỹ</strong> và <strong>xác nhận</strong> trước khi qua bước tiếp theo.
                </p>
            </div>

            <div className={styles.notesContainer}>
                {notes && notes.length > 0 ? (
                    <ol className={styles.list}>
                        {notes.map((note, idx) => (
                            <li key={note.id || idx}>
                                <p className={styles.ruleTitle}>{note.title}</p>
                                <div className={styles.rule}>
                                    <p>{note.description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p>Chưa có thông tin lưu ý từ ban tổ chức.</p>
                )}
            </div>

            <p className={styles.rulesLink}>
                Xem đầy đủ thể lệ và quy định chi tiết tại:{' '}
                <a href="#" target="_blank" rel="noopener noreferrer">
                    Thể lệ cuộc thi
                    <ArrowSquareOut size={14} />
                </a>
            </p>

            <label className={styles.agreeRow}>
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                />
                <span>Tôi đã đọc và đồng ý với các điều kiện tham gia</span>
            </label>
        </ModalShell>
    )
}

export default DisclaimerStep