import { useState } from 'react'
import ModalShell from '../../shared/ModalShell'
import Button from '../../shared/Button'
import FormTextarea from '../../shared/FormTextarea'
import { PencilSimpleLine, ChatCircleDots } from '@phosphor-icons/react'
import styles from './RequestEditModal.module.css'

function RequestEditModal({ isOpen, onClose, onSubmit, teamName }) {
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
        label="Gửi yêu cầu"
        onClick={handleSubmit}
        variant="primary"
        color="orange"
        disabled={!reason.trim()}
      />
    </div>
  )

  return (
    <ModalShell
      size="md"
      onClose={handleClose}
      title="Yêu cầu chỉnh sửa điểm"
      subtitle="Bạn đang gửi yêu cầu mở khóa chỉnh sửa điểm số cho bài nộp này lên Ban Tổ Chức."
      icon={<PencilSimpleLine size={24} weight="fill" />}
      footer={footer}
    >
      <div className={styles.container}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Đội thi:</span>
          <span className={styles.teamName}>{teamName}</span>
        </div>

        <div className={styles.textareaWrapper}>
          <FormTextarea
            label="Lý do yêu cầu mở khóa"
            placeholder="Vui lòng nhập lý do cụ thể (VD: Chấm sót phần API, cần điều chỉnh điểm do lỗi mạng...)"
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

export default RequestEditModal
