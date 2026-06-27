import styles from './CreateEventSidebar.module.css'

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản' },
  { id: 2, label: 'Quy định' },
  { id: 3, label: 'Quyền lợi & Giải thưởng' },
  { id: 4, label: 'Vòng thi' },
  { id: 5, label: 'Hạng mục' },
  { id: 6, label: 'Dòng thời gian' },
  { id: 7, label: 'Mentor & Giám khảo' },
]

// visitedSteps: mảng id các step đã từng ghé qua (kể cả khi quay lại)
// errorSteps:   mảng id các step đã ghé nhưng còn field trống
function CreateEventSidebar({ currentStep = 1, visitedSteps = [], errorSteps = [], onStepClick }) {
  return (
    <div className={styles.sidebarWrapper}>
      <nav className={styles.sidebar}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep
          const isCompleted = !isActive && visitedSteps.includes(step.id)
          const hasError = !isActive && errorSteps.includes(step.id)
          const isLast = idx === STEPS.length - 1

          const stepClass = isActive ? styles.stepActive :
            hasError ? styles.stepError :
              isCompleted ? styles.stepCompleted :
                styles.stepUpcoming

          const badgeClass = isActive ? styles.badgeActive :
            hasError ? styles.badgeError :
              isCompleted ? styles.badgeCompleted :
                styles.badgeUpcoming

          return (
            <div key={step.id} className={styles.stepWrapper}>
              <button
                className={`${styles.step} ${stepClass}`}
                onClick={() => onStepClick?.(step.id)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={`${styles.badge} ${badgeClass}`}>
                  {step.id}
                </span>
                <span className={styles.label}>{step.label}</span>
              </button>

              {!isLast && (
                <div className={`${styles.connector} ${styles.connectorSolid}`} />
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default CreateEventSidebar