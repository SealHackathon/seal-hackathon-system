import { useState } from 'react'
import { FloppyDisk, ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import Button from '../../../shared/Button'
import styles from './CreateEventFooter.module.css'

function CreateEventFooter({
  currentStep = 1,
  totalSteps  = 7,
  onCancel,
  onSaveDraft,
  onBack,
  onNext,
}) {
  const [lastSaved, setLastSaved] = useState(null)
  const isFirstStep = currentStep === 1
  const isLastStep  = currentStep === totalSteps

  function handleSaveDraft() {
    const now = new Date()
    const time = now.toLocaleTimeString('vi-VN', {
      hour:   '2-digit',
      minute: '2-digit',
      day:    '2-digit',
      month:  '2-digit',
      year:   'numeric',
    })
    setLastSaved(time)
    onSaveDraft?.()
  }

  return (
    <div className={styles.footer}>

      {/* ── Trái: Huỷ ── */}
      <Button
        label="Huỷ"
        iconPosition="left"
        variant="outline"
        color='grey'
        onClick={onCancel}
      />

      {/* ── Phải: Lưu nháp + Quay lại + Tiếp theo ── */}
      <div className={styles.rightGroup}>

        {/* Lưu nháp + timestamp */}
        <div className={styles.saveDraftWrapper}>
          <Button
            label="Lưu nháp"
            icon={FloppyDisk}
            iconPosition="left"
            variant="outline"
            onClick={handleSaveDraft}
          />
          {lastSaved && (
            <span className={styles.timestamp}>{lastSaved}</span>
          )}
        </div>

        {/* Quay lại — disabeld ở step 1 */}
          <Button
            label="Quay lại"
            icon={ArrowLeft}
            iconPosition="left"
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep}
          />

        {/* Tiếp theo / Hoàn tất ở step cuối */}
        <Button
          label={isLastStep ? 'Hoàn tất' : 'Tiếp theo'}
          icon={ArrowRight}
          iconPosition="right"
          variant="primary"
          color="blue"
          onClick={onNext}
        />

      </div>
    </div>
  )
}

export default CreateEventFooter