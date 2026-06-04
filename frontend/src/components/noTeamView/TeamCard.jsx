import { useState } from 'react'
import { ArrowRight, ArrowLeft, PaperPlaneTilt, CrownSimple, Plus, ListPlus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import FormTextarea from '../shared/FormTextarea'
import TeamInfoPanel from './TeamInfoPanel'
import styles from './TeamCard.module.css'
import memberStyles from '../leaderView/MemberRow.module.css'
import memberEmptyStyles from '../leaderView/EmptyMemberSlot.module.css'
import axios from 'axios'
function TeamCard({ 
    team, 
    onRequest, 
    onCancel    // 'view' | 'compose' | 'requested'
}) {
    const emptyCount = team.maxSlots - team.members.length

    const [cardState, setCardState] = useState(
        team.isRequested ? 'requested' : 'view'
    )
    const [message, setMessage] = useState(
        `Xin chào! Mình là Hồ Ngọc Bảo Trân. Mình rất ấn tượng với định hướng của Team bạn. Rất mong được tham gia vào Team của bạn.`
    )

    //gọi API gửi request tham gia đội, nếu thành công thì gọi onRequest để cập nhật trạng thái ở component cha, đồng thời chuyển card sang trạng thái 'requested'
    function handleSend() {
        const token = localStorage.getItem("accessToken");
        axios.post('http://localhost:8080/api/teamrequest/joinrequest',
            { teamId: team.id, message:message },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(() => {
                onRequest(team.id)
                setCardState('requested')
                //  window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            })
    }

    function handleCancel() {
        const token = localStorage.getItem("accessToken");
        axios.delete(`http://localhost:8080/api/teamrequest/member-request?teamId=${team.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(() => {
                onCancel(team.id)
                setCardState('view')
                // window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            })
        // Gọi API hủy request tham gia đội, nếu thành công thì gọi onCancel để cập nhật trạng thái ở component cha, đồng thời chuyển card sang trạng thái 'view'
    }

    const slideX = cardState === 'compose' ? '-100%' : '0%'

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.track} style={{ transform: `translateX(${slideX})` }}>

                {/* Panel 1: Xem thông tin đội */}
                <div className={styles.panel}>

                    <TeamInfoPanel team={team} />

                    <div className={styles.buttonWrapper}>
                        {cardState === 'requested' ? (
                            <Button
                                label="Hủy yêu cầu"
                                labelSize={16}
                                variant="outline"
                                color='orange'
                                onClick={handleCancel}
                            />
                        ) : (
                            <Button
                                label="Xin vào đội"
                                labelSize={16}
                                icon={ArrowRight}
                                iconPosition="right"
                                variant="primary"
                                onClick={() => setCardState('compose')}
                            />
                        )}
                    </div>

                </div>

                {/* Panel 2: Soạn yêu cầu */}
                <div className={styles.panel}>
                    <h3 className={styles.composeTitle}>Gửi yêu cầu xin vào đội</h3>

                    <FormTextarea 
                        className={styles.textarea}
                        iconLeft={ListPlus}
                        value={message}
                        maxLength={200}
                        onChange={(e) => setMessage(e.target.value)}>
                    </FormTextarea>

                    <div className={styles.composeActions}>
                        <Button
                            label="Quay lại"
                            labelSize={16}
                            icon={ArrowLeft}
                            iconPosition="left"
                            variant="outline"
                            onClick={() => setCardState('view')}
                        />
                        <Button
                            label="Gửi yêu cầu"
                            labelSize={16}
                            icon={PaperPlaneTilt}
                            iconWeight='fill'
                            iconPosition="right"
                            variant="primary"
                            onClick={handleSend}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TeamCard