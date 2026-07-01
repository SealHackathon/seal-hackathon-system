import { X, CheckCircle, Warning, FloppyDisk } from '@phosphor-icons/react'
import Button from '../../../shared/Button'
import SegmentedWeightBar from '../SegmentedWeightBar'
import styles from './CreateRubricFooter.module.css'

function CreateRubricFooter({
  totalWeight = 0,
  criteria = [],
  isValid = false,
  onCancel,
  onSaveDraft,
  onSave
}) {
  const remainingWeight = 100 - totalWeight;

  return (
    <div className={styles.footer}>
      <Button
        label="Hủy bỏ"
        icon={X}
        iconPosition="left"
        variant="outline"
        onClick={onCancel}
      />

      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <div className={styles.weightInfo}>
            <span className={styles.weightLabel}>Tổng trọng số:</span>
            <span className={`${styles.weightValue} ${totalWeight === 100 ? styles.validText : styles.warningText}`}>
              {totalWeight}%
            </span>
            <span className={styles.weightMax}>/ 100%</span>
          </div>

          {isValid ? (
            <span className={styles.badgeValid}>
              <CheckCircle size={14} weight="fill" /> Hợp lệ
            </span>
          ) : (
            <span className={styles.badgeWarning}>
              <Warning size={14} weight="fill" />
              {totalWeight > 100 
                ? `Vượt quá ${totalWeight - 100}%` 
                : totalWeight < 100 
                  ? `Còn thiếu ${100 - totalWeight}%` 
                  : 'Vui lòng kiểm tra lại thông tin'}
            </span>
          )}
        </div>

        <div className={styles.progressBarWrapper}>
          <SegmentedWeightBar criteria={criteria} size="small" />
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          label="Lưu nháp"
          variant="outline"
          color="blue"
          onClick={onSaveDraft}
        />
        <Button
          label="Lưu Rubric"
          icon={FloppyDisk}
          iconPosition="left"
          variant="primary"
          color="blue"
          onClick={onSave}
          disabled={!isValid}
        />
      </div>
    </div>
  )
}

export default CreateRubricFooter
