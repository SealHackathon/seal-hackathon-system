import { useState } from 'react'
import { Textbox, TextAlignLeft, Plus, Backspace } from '@phosphor-icons/react'
import ModalShell from '../shared/ModalShell'
import StepFooter from '../shared/StepFooter'
import FormInput from '../shared/FormInput'
import FormTextarea from '../shared/FormTextarea'
import styles from './CreateTeamStep.module.css'
import axios from 'axios'

// thêm tạm xóa sau
import Button from '../shared/Button'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'


const MAX_MEMBERS = 4   // kể cả bản thân

function CreateTeamStep({ onClose, onBack, onSubmit, currentUserEmail = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).email : 'Email không xác định',
    emailStatus, emailMessage

}) {
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [emails, setEmails] = useState([''])  // danh sách email mời (không kể bản thân)
    const [nameStatus, setNameStatus] = useState('default')
    const [nameMessage, setNameMessage] = useState('')


    // Thêm ô email mới
    function handleAddEmail() {
        if (emails.length < MAX_MEMBERS - 1) {
            setEmails(prev => [...prev, ''])
        }
    }

    // Xóa ô email
    function handleRemoveEmail(index) {
        setEmails(prev => prev.filter((_, i) => i !== index))
    }

    // Đổi email tại index
    function handleEmailChange(index, value) {
        setEmails(prev => prev.map((e, i) => i === index ? value : e))
    }

    // Sau này gọi API check tên trùng ở đây
    // Nếu trùng thì setNameStatus('error') và setNameMessage('Tên đội đã tồn tại')
    const token = localStorage.getItem("accessToken")
    function handleNameBlur() {
        if (!name.trim()) return setNameMessage(''), setNameStatus('default')
        // TODO: GET /api/teams/check-name?name=...
        axios.get(`http://localhost:8080/api/team/check-name?name=${name}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            if (response.data == false) {
                setNameStatus('error')
                setNameMessage('Tên đội đã tồn tại')
            } else {
                setNameStatus('success')
                setNameMessage('Tên đội hợp lệ')
            }
        }).catch((error) => {
            console.log(error)
        })

    }




    const isFormValid = name.trim().length > 0 && desc.trim().length > 0 && nameStatus !== 'error'

    return (
        <ModalShell
            onClose={onClose}
            closeOnBackdrop={false}
            footer={
                // <StepFooter
                //     currentStep={3}
                //     totalSteps={3}
                //     stepLabel="Tạo đội mới"
                //     onBack={onBack}
                //     onNext={() => onSubmit({ name: name, description: desc, inviteEmails: emails.filter(e => e.trim()) })}
                //     //    onNext={() => onSubmit({ name, description: desc, inviteEmails: emails.filter(e => e.trim()) })}
                //     nextLabel="Xác nhận"
                //     nextDisabled={!isFormValid}
                // />
                <div className={styles.btns}>

                    <Button
                        className={styles.btn}
                        label="Hủy"
                        labelSize={16}
                        iconPosition="left"
                        variant="outline"
                        onClick={onClose}
                    />

                    <Button
                        className={styles.btn}
                        label='Xác nhận'
                        labelSize={16}
                        iconPosition="right"
                        variant="primary"
                        disabled={!isFormValid}
                        onClick={() => onSubmit({ name: name, description: desc, inviteEmails: emails.filter(e => e.trim()) })}
                    />

                </div>
            }
        >
            <h1 className={styles.title}>Tạo đội mới</h1>

            <div className={styles.banner}>
                <p>
                    Bạn sẽ là đội trưởng. Sau khi tạo đội, bạn có thể chia sẻ<br />
                    mã mời cho các thành viên muốn gia nhập.
                </p>
            </div>

            {/* Tên đội */}
            <FormInput
                label="Tên đội"
                required
                iconLeft={Textbox}
                placeholder="SEAL Hacker"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={handleNameBlur}
                maxLength={30}
                status={nameStatus}
                message={nameMessage}
            />

            {/* Mô tả */}
            <FormTextarea
                label="Mô tả"
                required
                iconLeft={TextAlignLeft}
                placeholder="Giới thiệu ngắn về đội của bạn và định hướng giải quyết bài toán..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={200}
                rows={4}
            />

            {/* Mời thành viên */}
            <div className={styles.inviteSection}>
                <div className={styles.inviteHeader}>
                    <span className={styles.inviteLabel}>Mời thành viên</span>
                    <span className={styles.inviteHint}>(tối đa {MAX_MEMBERS} người, có thể bỏ qua bước này)</span>
                </div>

                <div className={styles.memberRow}>
                    <span className={styles.memberLabel}>Thành viên 1 (Bạn)</span>
                    <div className={styles.disabledInput}>
                        {currentUserEmail}
                    </div>
                </div>

                {/* Thành viên 2, 3, 4 */}
                {emails.map((email, index) => (
                    <div key={index} className={styles.memberRow}>
                        <span className={styles.memberLabel}>Thành viên {index + 2}</span>
                        <FormInput
                            type="email"
                            placeholder="member@gmail.com"
                            value={email}
                            onChange={e => handleEmailChange(index, e.target.value)}
                            actionIcon={Backspace}                          // ← icon ngoài input
                            onActionIconClick={() => handleRemoveEmail(index)}
                            status={emailStatus}
                            message={emailMessage}
                        />
                    </div>
                ))}


                {/* Nút thêm thành viên */}
                {emails.length < MAX_MEMBERS - 1 && (
                    <button className={styles.addBtn} type="button" onClick={handleAddEmail}>
                        <Plus size={16} weight="bold" />
                        Thêm thành viên
                    </button>
                )}
            </div>
        </ModalShell>
    )
}

export default CreateTeamStep