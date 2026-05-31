import { useState } from 'react'
import { ArrowRight, ArrowLeft, PaperPlaneTilt, X } from '@phosphor-icons/react'
import Button from '../shared/Button'
import styles from './MemberCard.module.css'

function MemberCard({ member, onInvite, onCancel }) {
    // 'view' | 'compose' | 'invited'
    const [cardState, setCardState] = useState(
        member.isInvited ? 'invited' : 'view'
    )
    const [message, setMessage] = useState(
        `Xin chào! Mình là đội trưởng của [Tên đội]. Mình thấy profile của bạn rất phù hợp và muốn mời bạn gia nhập đội. Rất mong được cùng bạn thi đấu!`
    )

    function handleSend() {
        onInvite(member.id, message)
        setCardState('invited')
    }

    function handleCancel() {
        onCancel(member.id)
        setCardState('view')
    }

    return (
        <div className={styles.cardWrapper}>

            <div
                className={styles.track}
                style={{
                    transform: cardState === 'view'
                        ? 'translateX(0%)'
                        : cardState === 'compose'
                            ? 'translateX(-100%)'
                            : 'translateX(0%)'   // invited về lại view nhưng đổi nút
                }}
            >

                {/* Panel 1: Xem thông tin */}
                <div className={styles.panel}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar} />
                        <div>
                            <p className={styles.name}>{member.name}</p>
                            <p className={styles.email}>{member.email}</p>
                            <p className={styles.school}>{member.school}</p>
                        </div>
                    </div>

                    <div className={styles.bio}>
                        <p className={styles.bioLabel}>Giới thiệu bản thân</p>
                        <p className={styles.bioText}>{member.bio}</p>
                    </div>

                    <div className={styles.buttonWrapper}>
                        {cardState === 'invited' ? (
                            <Button
                                label="Hủy yêu cầu"
                                labelSize={16}
                                variant="outline"
                                color="orange"
                                onClick={handleCancel}
                            />
                        ) : (
                            <Button
                                label="Mời vào đội"
                                labelSize={16}
                                icon={ArrowRight}
                                iconPosition="right"
                                variant="primary"
                                onClick={() => setCardState('compose')}
                            />
                        )}
                    </div>

                </div>

                {/* Panel 2: Soạn lời mời */}
                <div className={styles.panel}>
                    <h3 className={styles.composeTitle}>Gửi lời mời vào đội</h3>

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
                            label="Gửi lời mời"
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

export default MemberCard