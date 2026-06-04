import { useState } from 'react'
import { Textbox } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import FormInput from '../shared/FormInput'
import TeamInfoPanel from '../noTeamView/TeamInfoPanel'
import styles from './JoinByCodeStep.module.css'

const FAKE_TEAMS_BY_CODE = [
    {
        id: 1,
        inviteCode: 'ABCXYZ',
        name: 'Pixel Pioneers',
        description: 'Team mình thiên về UI/UX và frontend, mong muốn tìm hướng tiếp cận bài toán từ góc độ trải nghiệm người dùng.',
        maxSlots: 4,
        members: [         
            { id: 1, isLeader: true },
            { id: 2 },
            { id: 3 },
        ],
    },
    {
        id: 2,
        inviteCode: 'XYZFULL',
        name: 'Code Breakers',
        description: 'Nhóm mình chủ yếu làm backend.',
        maxSlots: 4,
        members: [          
            { id: 4, isLeader: true },
            { id: 5 },
            { id: 6 },
            { id: 7 },
        ],
    },
]

function checkCode(code) {
    const team = FAKE_TEAMS_BY_CODE[code.trim().toUpperCase()]

    if (!team)                                      return { type: 'invalid' }
    if (team.members.length >= team.maxSlots)       return { type: 'full', team }
    return { type: 'found', team }
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