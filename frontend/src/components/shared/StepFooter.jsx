import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import Button from './Button'
import styles from './StepFooter.module.css'

function StepFooter({
  currentStep,      // số bước hiện tại, ví dụ 1
  totalSteps,       // tổng số bước, ví dụ 3
  stepLabel,        // 'Lưu ý' | 'Hình thức tham gia' | 'Tạo đội mới' | ...
    
  onBack,           // null → ẩn nút Quay lại
  onNext,           // null → ẩn nút Tiếp tục
  nextLabel,        // mặc định 'Tiếp tục', có thể đổi thành 'Xác nhận'
  nextDisabled,     // true → nút tiếp tục bị disabled
  nextLoading,      // true → nút đang loading
  backDisabled,
}) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={styles.footer}>

      <div className={styles.progressGroup}>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.stepLabel}>
          Bước {currentStep}/{totalSteps}: {stepLabel}
        </span>
      </div>

      <div className={styles.buttons}>
        {onBack && (
          <Button
            label="Quay lại"
            labelSize={16}
            icon={ArrowLeft}
            iconPosition="left"
            variant="outline"
            disabled={backDisabled}
            onClick={onBack}
          />
        )}

        {onNext && (
          <Button
            label={nextLabel ?? 'Tiếp tục'}
            labelSize={16}
            icon={ArrowRight}
            iconPosition="right"
            variant="primary"
            disabled={nextDisabled || nextLoading}
            onClick={onNext}
          />
        )}
      </div>

    </div>
  )
}

export default StepFooter