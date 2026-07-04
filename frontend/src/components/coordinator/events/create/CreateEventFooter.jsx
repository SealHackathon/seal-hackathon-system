import { useState } from 'react'
import { FloppyDisk, ArrowLeft, ArrowRight, CheckCircle, Warning } from '@phosphor-icons/react'
import Button from '../../../shared/Button'
import styles from './CreateEventFooter.module.css'

function CreateEventFooter({
  currentStep = 1,
  totalSteps = 7,
  onCancel,
  onSaveDraft,
  onBack,
  onNext,
  requiredCount = 0,
  filledCount = 0,
}) {
  const [saveStatus, setSaveStatus] = useState('idle')
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  async function handleSaveDraft() {
    setSaveStatus('saving')
    const success = await onSaveDraft?.()
    if (success) {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('idle')
    }
  }

  const saveLabel = (
    <span className={styles.saveLabelWrapper}>
      <span className={`${styles.saveLabelInner} ${saveStatus === 'success' ? styles.success : ''}`}>
        <span className={styles.saveText}>
          {saveStatus === 'saving' ? (
            <span className={styles.loadingDots}>
              Đang lưu<span className={styles.dot}>.</span><span className={styles.dot}>.</span><span className={styles.dot}>.</span>
            </span>
          ) : 'Lưu nháp'}
        </span>
        <span className={styles.saveText}>Lưu thành công</span>
      </span>
    </span>
  )

  const progressPercent = requiredCount > 0 ? Math.round((filledCount / requiredCount) * 100) : 100;
  const isComplete = filledCount >= requiredCount && requiredCount > 0;

  return (
    <div className={styles.footer}>

      {/* ── Trái: Huỷ ── */}
      <div className={styles.leftGroup}>
        <Button
          label="Huỷ"
          labelSize={18}
          iconPosition="left"
          variant="outline"
          color='blue'
          onClick={onCancel}
        />
      </div>

      {/* ── Giữa: Progress Info ── */}
      <div className={styles.centerGroup}>
        <div className={styles.progressHeader}>
          <div className={styles.fieldInfo}>
            <span className={styles.fieldLabel}>Trang này:</span>
            <span className={`${styles.fieldValue} ${isComplete ? styles.valueComplete : styles.valueIncomplete}`}>
              {filledCount}/{requiredCount}
            </span>
            <span className={styles.fieldSuffix}>thông tin bắt buộc đã điền</span>
          </div>

          {isComplete ? (
            <span className={styles.badgeValid}>
              <CheckCircle size={14} weight="fill" /> Trang này đã đầy đủ
            </span>
          ) : (
            <span className={styles.badgeWarning}>
              <Warning size={14} weight="fill" />
              {requiredCount - filledCount} thông tin cần hoàn thiện
            </span>
          )}
        </div>

        <div className={styles.progressBarWrapper}>
          <div className={styles.progressBarBg}>
            <div
              className={`${styles.progressBarFill} ${isComplete ? styles.fillComplete : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Phải: Lưu nháp + Quay lại + Tiếp theo ── */}
      <div className={styles.rightGroup}>

        {/* Lưu nháp */}
        <div className={styles.saveDraftWrapper}>
          <Button
            label={saveLabel}
            labelSize={18}
            icon={FloppyDisk}
            iconPosition="left"
            variant="outline"
            color={saveStatus === 'success' ? 'green' : 'blue'}
            onClick={handleSaveDraft}
            disabled={saveStatus === 'saving'}
            className={`${styles.fixedWidthSaveBtn} ${saveStatus === 'success' ? styles.btnSuccess : styles.btnBlue}`}
          />
        </div>

        {/* Quay lại — disabled ở step 1 */}
        <Button
          label="Quay lại"
          labelSize={18}
          icon={ArrowLeft}
          iconPosition="left"
          variant="outline"
          onClick={() => onBack?.()}
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
          onClick={() => {
            // handleSaveDraft được CreateEventPage lo liệu trong handleNext dưới dạng background
            onNext?.()
          }}

        />

      </div>
    </div>
  )
}

export default CreateEventFooter