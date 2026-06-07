import { useState } from 'react'
import { WarningCircle, ArrowSquareOut } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import styles from './DisclaimerStep.module.css'

function DisclaimerStep({ onClose, onNext }) {
    const [agreed, setAgreed] = useState(false)

    return (
        <ModalShell
            size='md'
            onClose={onClose}
            closeOnBackdrop={false}
            footer={
                <StepFooter
                    currentStep={1}
                    totalSteps={3}
                    stepLabel="Lưu ý"
                    onBack={() => {}}
                    onNext={onNext}
                    nextDisabled={!agreed}
                    backDisabled={true}
                />
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

            <ol className={styles.list}>
                <li>
                    <p className={styles.ruleTitle}>[Thí sinh trường ngoài] Điều kiện đội thi</p>
                    <div className={styles.rule}>
                        <p>
                            Nếu bạn <strong>không phải sinh viên trường FPT</strong> hoặc{' '}
                            <strong>trường đối tác</strong>, đội của bạn bắt buộc phải{' '}
                            <strong>có ít nhất một thành viên là sinh viên FPT</strong>.
                            Đội không đáp ứng điều kiện này sẽ bị loại khỏi vòng xét duyệt.
                        </p>
                    </div>
                </li>

                <li>
                    <p className={styles.ruleTitle}>Thông tin đăng ký không thể thay đổi sau khi nộp</p>
                    <div className={styles.rule}>
                        <p>
                            Một số thông tin (tên đội, thành viên chính) sẽ <strong>bị khóa</strong> sau
                            khi đăng ký thành công. Hãy kiểm tra kỹ trước khi xác nhận.
                        </p>
                    </div>
                </li>
            </ol>

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