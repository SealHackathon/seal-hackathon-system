import { Warning, Check, LockSimple } from '@phosphor-icons/react'
import MemberRow from './MemberRow'
import EmptyMemberSlot from './EmptyMemberSlot'
import TeamStatusTag from '../shared/TeamStatusTag'
import NoticeBox from '../shared/NoticeBox'
import Button from '../shared/Button'
import styles from './TeamMemberPanel.module.css'

function TeamMemberPanel({
    members,
    maxSlots = 4,
    teamStatus,
    onKick,
    onPromote,
    onLeave,
    onLockTeam,
    rejectionReasons }) {

    const emptyCount = maxSlots - members.length


    function renderNoticeBox() {
        if (teamStatus === 'pending') {
            return (
                <NoticeBox
                    color="orange"
                    icon={Warning}
                    message="Sau khi chốt đội, danh sách thành viên sẽ bị khóa và không thể thay đổi. Hãy chắc chắn trước khi tiếp tục."
                    button={
                        <Button
                            label="Chốt đội"
                            icon={LockSimple}
                            iconPosition="right"
                            variant="primary"
                            onClick={onLockTeam}
                        />
                    }
                />
            )
        }

        if (teamStatus === 'waiting') {
            return (
                <NoticeBox
                    color="orange"
                    icon={Warning}
                    message="Sau khi chốt đội, danh sách thành viên sẽ bị khóa và không thể thay đổi. Hãy chắc chắn trước khi tiếp tục."
                    button={
                        <Button
                            label="Đang chờ BTC duyệt"
                            icon={LockSimple}
                            iconPosition="right"
                            variant="primary"
                            disabled
                        />
                    }
                />
            )
        }

        if (teamStatus === 'approved') {
            return (
                <NoticeBox
                    color="green"
                    icon={Check}
                    message="Đội của bạn đã được phê duyệt để tham gia cuộc thi."
                    button={
                        <Button
                            label="Đã chốt đội"
                            icon={LockSimple}
                            iconPosition="right"
                            iconWeight='fill'
                            variant="primary"
                            disabled
                        />
                    }
                />
            )
        }

        if (teamStatus === 'rejected') {
            return (
                <NoticeBox
                    color="orange"
                    icon={Warning}
                    message="Yêu cầu chốt đội bị từ chối"
                    button={
                        <Button
                            label="Chốt đội"
                            icon={LockSimple}
                            iconPosition="right"
                            iconWeight='fill'
                            variant="primary"
                            color='orange'
                            onClick={onLockTeam}
                        />
                    }
                    detail={
                        <div>
                            <p>
                                <strong style={{color:'var(--color-primary-orange)'}}>Ban Tổ Chức</strong> yêu cầu bạn điều chỉnh trước khi nộp lại:
                            </p>
                            
                            <p style={{ whiteSpace: 'pre-line' }}>
                                {rejectionReasons}
                            </p>

                            <p>
                                Sau khi điều chỉnh, bấm <strong style={{color:'var(--color-primary-orange)'}}>"Chốt đội"</strong> để gửi lại.
                            </p>
                        </div>
                    }
                />
            )
        }

        return null
    }

    return (
        <div className={styles.panel}>


            <div className={styles.header}>
                <span className={styles.memberCount}>
                    {members.length}/{maxSlots} thành viên
                </span>
                <TeamStatusTag status={teamStatus} />
            </div>


            <div className={styles.memberList}>
                {members.map((member, i) => (
                    <MemberRow
                        key={member.id}
                        index={i + 1}
                        name={member.name}
                        email={member.email}
                        school={member.school}
                        isLeader={member.isLeader}
                        isCurrentUser={member.isCurrentUser}
                        onKick={() => onKick?.(member.id)}
                        onPromote={() => onPromote?.(member.id)}
                        onLeave={onLeave}
                    />
                ))}


                {Array.from({ length: emptyCount }).map((_, i) => (
                    <EmptyMemberSlot key={`empty-${i}`} index={members.length + i + 1} />
                ))}
            </div>


            {renderNoticeBox()}

        </div>
    )
}

export default TeamMemberPanel