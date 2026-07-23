import { useState } from 'react'
import ModalShell from '../../shared/ModalShell'
import Button from '../../shared/Button'
import FormTextarea from '../../shared/FormTextarea'
import { Flag, ChatCircleDots } from '@phosphor-icons/react'
import styles from './ReportViolationModal.module.css'

function ReportViolationModal({ isOpen, onClose, onSubmit, teamName }) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(reason)
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const footer = (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'right' }}>
      <Button label="Hủy" onClick={handleClose} variant="outline" color="blue" />
      <Button
        label="Xác nhận báo cáo"
        onClick={handleSubmit}
        variant="primary"
        color="blue"
        disabled={!reason.trim()}
      />
    </div>
  )

  return (
    <ModalShell
      size="md"
      onClose={handleClose}
      title="Báo cáo vi phạm"
      subtitle="Xem xét và đưa ra quyết định cắm cờ vi phạm cho bài nộp của đội thi."
      icon={<Flag size={24} weight="fill" />}
      footer={footer}
    >
      <div className={styles.container}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Đội thi bị cắm cờ:</span>
          <span className={styles.teamName}>{teamName}</span>
        </div>

        <div className={styles.textareaWrapper}>
          <FormTextarea
            label="Ghi chú từ ban giám khảo"
            placeholder="Nghi ngờ sử dụng source code được làm sẵn từ trước, không tuân thủ quy định Hackathon..."
            iconLeft={ChatCircleDots}
            iconWeight="fill"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
          />
        </div>
      </div>
    </ModalShell>
  )
}

export default ReportViolationModal
