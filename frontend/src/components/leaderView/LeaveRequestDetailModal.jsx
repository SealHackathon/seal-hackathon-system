import { useState } from 'react'
import { X, ListPlus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import ModalShell from '../shared/ModalShell'
import FormTextarea from '../shared/FormTextarea'
import TeamInfoPanel from '../noTeamView/TeamInfoPanel'
import styles from './LeaveRequestDetailModal.module.css'

function LeaveRequestDetailModal({
    request,
    onAccept,
    onCancel,
    onLeave,
    onClose,
}) {
    const [message, setMessage] = useState('')

    if (!request) return null

    const isFormValid = message.trim().length > 0

    return (

        <ModalShell
            size={'sm'}
            onClose={() => { onClose() }}

            footer={
                <div className={styles.actions}>
                    <Button
                        label={request.compose ? "Hủy" : "Từ chối"}
                        variant="outline"
                        color='grey'
                        onClick={() => { 
                            !request.compose 
                            ? onCancel(request.id) 
                            : () => {};
                            onClose()
                             }
                        }
                    />
                    <Button
                        label={request.compose ? "Xác nhận" : "Đồng ý"}
                        variant="primary"
                        color='blue'
                        onClick={() => {
                            if (request.compose) {
                                onLeave(message);
                            } else {
                                onAccept(request.id);
                            }
                            onClose();
                        }}
                            disabled={!isFormValid && request.compose}
                    />
                </div>
            }
        >
            <div className={styles.content}>
                <p className={styles.title}>{request.compose ? "Gửi yêu cầu rời đội" : "Xử lý yêu cầu rời đội"}</p>
                {!request.compose && (
                    <div className={styles.guide}>
                        <div>
                            Bạn <span className={styles.name}>{request.name}</span> muốn rời khỏi đội. Hãy xem lý do bên dưới và đưa ra quyết định nhé.
                        </div>
                    </div>
                )}

                <div>
                    <p className={styles.label}>Lí do xin rời đội</p>

                    <FormTextarea
                        className={request.compose ? null : styles.message}
                        required
                        iconLeft={ListPlus}
                        placeholder='Mình không thể sắp xếp thời gian tham gia cuộc thi ...'
                        value={request.compose ? message : request.message}
                        disabled={!request.compose}
                        onChange={(e) => { setMessage(e.target.value) }}
                        maxLength={200}
                        rows={4}
                    />
                </div>

            </div>
        </ModalShell>

    )
}

export default LeaveRequestDetailModal