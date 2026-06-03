import { useState } from 'react'
import { Textbox } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import FormInput from '../shared/FormInput'
import TeamInfoPanel from '../noTeamView/TeamInfoPanel'
import styles from './JoinByCodeStep.module.css'

const FAKE_RESULTS = {
    'ABCXYZ': {
        type: 'found',
        team: {
            name: 'Tên đội',
            memberCount: 3,
            maxSlots: 4,
            description: 'Giới thiệu ngắn về đội của bạn và định hướng giải quyết bài toán. Giới thiệu ngắn về đội của bạn và định hướng giải quyết bài toán.',
            members: [
                { id: 1, isLeader: true },
                { id: 2 },
                { id: 3 },
            ],
        }
    },
    'FULL': { type: 'full' },
    'INVALID': { type: 'invalid' },
}

function JoinByCodeStep({ onClose, onBack, onSubmit }) {
    const [code, setCode]     = useState('')
    const [result, setResult] = useState(null)

    function handleCheck() {
        if (!code.trim()) return
        const found = FAKE_RESULTS[code.trim().toUpperCase()]
        setResult(found ?? { type: 'invalid' })
    }

    function handleCodeChange(e) {
        setCode(e.target.value)
        setResult(null)
    }

    const canConfirm = result?.type === 'found'

    return (
        <ModalShell
            onClose={onClose}
            closeOnBackdrop={false}
            footer={
                <StepFooter
                    currentStep={3}
                    totalSteps={3}
                    stepLabel="Nhập mã mời"
                    onBack={onBack}
                    onNext={() => onSubmit({ code, team: result?.team })}
                    nextLabel="Xác nhận"
                    nextDisabled={!canConfirm}
                />
            }
        >
            <h1 className={styles.title}>Tham gia bằng mã mời</h1>

            <div className={styles.banner}>
                <p>
                    Nhập mã mời do đội trưởng cung cấp. Thông tin đội sẽ
                    hiện ra để bạn xác nhận trước khi gia nhập.
                </p>
            </div>

            <FormInput
                label="Mã mời vào đội"
                required
                iconLeft={Textbox}
                placeholder="AX27KL"
                value={code}
                onChange={handleCodeChange}
                onBlur={handleCheck}
                status={
                    result?.type === 'found'   ? 'success' :
                    result?.type === 'full' ? 'error'   :
                    result?.type === 'invalid' ? 'error'   :
                    'default'
                }
                message={
                    result?.type === 'full' ? 'Đội này đã đủ thành viên.' :
                    result?.type === 'invalid' ? 'Mã mời không hợp lệ. Vui lòng kiểm tra lại.' :
                    ''
                }
            />

            {canConfirm && (
                <div className={styles.previewWrapper}>
                    <p className={styles.previewLabel}>Đội bạn sắp gia nhập</p>
                    <div className={styles.previewCard}>
                        <TeamInfoPanel team={result.team} />
                    </div>
                </div>
            )}

        </ModalShell>
    )
}

export default JoinByCodeStep