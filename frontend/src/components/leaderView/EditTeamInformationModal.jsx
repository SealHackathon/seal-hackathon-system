import { useState } from "react";
import ModalShell from "../shared/ModalShell";
import Button from "../shared/Button";
import FormTextarea from "../shared/FormTextarea";
import { Textbox, TextAlignLeft, Pen } from '@phosphor-icons/react'
import styles from "./RequestDetailModal.module.css"
import FormInput from "../shared/FormInput";
import axios from 'axios'

function EditTeamInformationModal({
    teamId,
    teamName,
    description,
    teamStatus,
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

    const handleOnEdit = () => {
        axios
          .put('http://localhost:8080/api/team/edit-team', {
            name:name,description:desc
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // nếu có JWT
            }
          })
          .then((response) => {
            console.log(response.data);
            onClose(true, "Cập nhật thông tin đội thành công!");
          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra, không thể edit nhóm lúc này.");
          });
      }

      


    const isFormValid = name.trim().length > 0 && desc.trim().length > 0 && nameStatus !== 'error'

    return (

        <ModalShell
            size={'sm'}
            onClose={() => { onClose() }}
            title='Điều chỉnh thông tin đội'
            titleColor='var(--color-primary-blue)'
            icon={<Pen weight='fill' size='32' />}
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
                        onClick={() => { handleOnEdit(); onClose() }}
                        disabled={!isFormValid}
                    />
                </div>
            }
        >
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
                disabled={teamStatus === 'APPROVED'}
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