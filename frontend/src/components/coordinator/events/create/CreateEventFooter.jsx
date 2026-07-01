import { useState } from 'react'
import { FloppyDisk, ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import Button from '../../../shared/Button'
import styles from './CreateEventFooter.module.css'

function CreateEventFooter({
  currentStep = 1,
  totalSteps = 7,
  onCancel,
  onSaveDraft,
  onBack,
  onNext,
}) {
  const [lastSaved, setLastSaved] = useState(null)
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  function handleSaveDraft() {
    const now = new Date()
    const time = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    setLastSaved(time)
    onSaveDraft?.()
  }

  return (
    <div className={styles.footer}>

      {/* ── Trái: Huỷ ── */}
      <Button
        label="Huỷ"
        labelSize={18}
        iconPosition="left"
        variant="outline"
        color='blue'
        onClick={onCancel}
      />

      {/* ── Phải: Lưu nháp + Quay lại + Tiếp theo ── */}
      <div className={styles.rightGroup}>

        {/* Lưu nháp + timestamp */}
        <div className={styles.saveDraftWrapper}>
          {lastSaved && (
            <span className={styles.timestamp}>{lastSaved}</span>
          )}
          <Button
            label="Lưu nháp"
            labelSize={18}
            icon={FloppyDisk}
            iconPosition="left"
            variant="outline"
            onClick={handleSaveDraft}
          />
        </div>

        {/* Quay lại — disabeld ở step 1 */}
        <Button
          label="Quay lại"
          labelSize={18}
          icon={ArrowLeft}
          iconPosition="left"
          variant="outline"
          onClick={async () => {
            await handleSaveDraft() // * chờ save xong, mới chuyển trang
            onBack?.()
          }}
          disabled={isFirstStep}
        />

        {/* Tiếp theo / Hoàn tất ở step cuối */}
        <Button
          label={isLastStep ? 'Hoàn tất' : 'Tiếp theo'}
          labelSize={18}
          icon={ArrowRight}
          iconPosition="right"
          variant="primary"
          color="blue"
          onClick={async () => {
            await handleSaveDraft() // * chờ save xong, mới chuyển trang
            onNext?.()
          }}

        />

      </div>
    </div>
  )
}

export default CreateEventFooter