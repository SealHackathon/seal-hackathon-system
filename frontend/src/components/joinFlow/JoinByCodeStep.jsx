import { useState } from 'react'
import { Textbox } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import FormInput from '../shared/FormInput'
import TeamInfoPanel from '../noTeamView/TeamInfoPanel'
import styles from './JoinByCodeStep.module.css'
import axios from 'axios'

function JoinByCodeStep({ onClose, onBack, onSubmit }) {
    const token = localStorage.getItem("accessToken")
    //team code
    const [code, setCode] = useState('')
    const [result, setResult] = useState(null)

    // hàm này truyền 1 code lấy từ ô input --> gửi xún backend nhận lên 1 FAKE_RESULTS
    function handleCheck() {
        if (!code.trim()) return setResult({ type: 'default' })
        axios.get(`http://localhost:8080/api/team/check-code?code=${code}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` // nếu có JWT
            }
        }).then((response) => {
            const responseData = {

                [response.data.teamCode]: {
                    type: response.data.type,
                    team: response.data.team
                    ,
                    'FULL': { type: 'full' },
                    'INVALID': { type: 'invalid' },
                }
            };
            const FAKE_RESULTS = responseData;
            const found = FAKE_RESULTS[code.trim().toUpperCase()] // truy cập thuộc tính của object bằng key
            setResult(found ?? { type: 'invalid' })
        })
 
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
                    onNext={() => onSubmit({ inviteCode: code })}
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
                    result?.type === 'found' ? 'success' :
                        result?.type === 'full' ? 'error' :
                            result?.type === 'invalid' ? 'error' :
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