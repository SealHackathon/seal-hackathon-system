import { useState } from 'react'
import { ArrowRight, ArrowLeft, PaperPlaneTilt, CrownSimple, Plus } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './TeamCard.module.css'
import memberStyles from '../leaderView/MemberRow.module.css'
import memberEmptyStyles from '../leaderView/EmptyMemberSlot.module.css'

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

    function handleSend() {
        onRequest(team.id, message)
        setCardState('requested')
    }

    function handleCancel() {
        onCancel(team.id)
        setCardState('view')
    }

    const slideX = cardState === 'compose' ? '-100%' : '0%'

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.track} style={{ transform: `translateX(${slideX})` }}>

                {/* Panel 1: Xem thông tin đội */}
                <div className={styles.panel}>

                    <h2 className={styles.teamName}>{team.name}</h2>

                    <span className={styles.memberBadge}>
                        {team.members.length}/{team.maxSlots} thành viên
                    </span>

                    {/* Avatar row */}
                    <div className={styles.avatarRow}>
                        {Array.from({ length: team.members.length }, (_, i) => (
                            <div key={i} className={memberStyles.avatar}>
                                {i === 0 && (
                                    <CrownSimple
                                        size={32}
                                        weight="fill"
                                        className={memberStyles.crownIcon}
                                    />
                                )}
                            </div>
                        ))}
                        
                        {Array.from({ length: emptyCount }, (_, i) => (
                            <div key={`empty-${i}`} className={memberEmptyStyles.avatar}>
                                <Plus size={28} color="var(--color-border-blue)" />
                            </div>
                        ))}

                    </div>


                    <div className={styles.bio}>
                        <p className={styles.bioLabel}>Mô tả</p>
                        <p className={styles.bioText}>{team.description}</p>
                    </div>

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

                    <div className={styles.messageBox}>
                        <textarea
                            className={styles.textarea}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                        />
                    </div>

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