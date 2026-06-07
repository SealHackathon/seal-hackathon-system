import { useState } from "react";
import ModalShell from "../shared/ModalShell";
import Button from "../shared/Button";
import FormTextarea from "../shared/FormTextarea";
import { Textbox, TextAlignLeft } from '@phosphor-icons/react'
import styles from "./RequestDetailModal.module.css"
import FormInput from "../shared/FormInput";
import axios from 'axios'

function EditTeamInformationModal({
    teamId,
    teamName,
    description,
    onClose,
    onEdit }) {

    const [name, setName] = useState(teamName)
    const [desc, setDesc] = useState(description)
    const [nameStatus, setNameStatus] = useState('default')
    const [nameMessage, setNameMessage] = useState('')

    const token = localStorage.getItem("accessToken")
    function handleNameBlur() {
        // ! Chỗ này cần check name đã có trong DB chưa, nhưng không check tên của chính team mình

        if (!name.trim()) return
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
            size={'sm'}
            onClose={() => { onClose() }}

            footer={
                <div className={styles.actions}>
                    <Button
                        label="Hủy"
                        variant="outline"
                        color='grey'
                        onClick={() => { onClose() }}
                    />
                    <Button
                        label="Xác nhận"
                        variant="primary"
                        onClick={() => { onEdit({ name: name, description: desc }); onClose() }}
                        disabled={!isFormValid}
                    />
                </div>
            }
        >
            <h1 className={styles.name} style={{color: 'var(--color-primary-blue)'}}>Điều chỉnh thông tin đội</h1>
            <br/>
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
            <br/>
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
        </ModalShell>
    )
}

export default EditTeamInformationModal