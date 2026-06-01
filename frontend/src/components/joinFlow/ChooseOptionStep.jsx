import { useState } from 'react'
import { UserPlus, Table, MagnifyingGlass, ArrowRight } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import styles from './ChooseOptionStep.module.css'
import disclaimerStepStyles from './DisclaimerStep.module.css'

const OPTIONS = [
  {
    value: 'create',
    icon: UserPlus,
    title: 'Tạo đội mới',
    desc: 'Bắt đầu với tư cách đội trưởng, mời bạn bè cùng tham gia',
  },
  {
    value: 'code',
    icon: Table,
    title: 'Tham gia bằng mã mời',
    desc: 'Đã nhận mã từ đội trưởng? Nhập vào để vào đội ngay',
  },
  {
    value: 'search',
    icon: MagnifyingGlass,
    title: 'Xin vào đội',
    desc: 'Chưa có nhóm? Khám phá đội đang tìm thêm thành viên',
  },
]

function ChooseOptionStep({ onClose, onBack, onNext }) {
  const [selected, setSelected] = useState(null)

  return (
    <ModalShell
      onClose={onClose}
      closeOnBackdrop={false}
      footer={
        <StepFooter
          currentStep={2}
          totalSteps={3}
          stepLabel="Hình thức tham gia"
          onBack={onBack}
          onNext={() => onNext(selected)}
          nextDisabled={!selected}
        />
      }
    >
      <h1 className={disclaimerStepStyles.title}>Chọn hình thức tham gia</h1>

      <div className={disclaimerStepStyles.banner}>
        <p>
          Chưa có đội? Hãy tạo mới hoặc tìm đội phù hợp.<br />
          Đã được mời? Nhập mã để vào đội ngay.
        </p>
      </div>

      <div className={styles.options}>
        {OPTIONS.map(opt => {
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              className={`${styles.option} ${selected === opt.value ? styles.selected : ''}`}
              onClick={() => setSelected(opt.value)}
            >
              <Icon size={32} weight="regular" className={styles.optionIcon} />
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{opt.title}</span>
                <span className={styles.optionDesc}>{opt.desc}</span>
              </div>
              <ArrowRight size={24} className={styles.arrow} />
            </button>
          )
        })}
      </div>
    </ModalShell>
  )
}

export default ChooseOptionStep