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
    isLeader,
    onKick,
    onPromote,
    onLeave,
    onLockTeam,
    onApproveLeave,
    onCancelLeave,
    rejectionReasons }) {

    const emptyCount = maxSlots - members.length


    function renderNoticeBox() {
        if (teamStatus === 'pending') {
            return (
                <NoticeBox
                    color="orange"
                    icon={Warning}
                    message= {(isLeader) 
                        ? "Sau khi chốt đội, danh sách thành viên sẽ bị khóa và không thể thay đổi. Hãy chắc chắn trước khi tiếp tục." 
                        : "Đội chưa được chốt. Vui lòng chờ đội trưởng xác nhận danh sách thành viên."}
                    button={isLeader
                        ?
                        <Button
                            label="Chốt đội"
                            icon={LockSimple}
                            iconPosition="right"    
                            variant="primary"
                            color='orange'
                            onClick={onLockTeam}
                        />
                        : undefined
                    }
                />
            )
        }

        if (teamStatus === 'waiting') {
            return (
                <NoticeBox
                    color="orange"
                    icon={Warning}
                    message= {(isLeader) 
                        ? "Đội đã được yêu cầu chốt và đang chờ BTC xét duyệt. Bạn sẽ nhận thông báo khi có kết quả." 
                        : "Đội đang chờ BTC xét duyệt. Bạn sẽ nhận thông báo khi có kết quả."}
                    button={isLeader
                        ?
                        <Button
                            label="Đang chờ BTC duyệt"
                            icon={LockSimple}
                            iconPosition="right"
                            variant="primary"
                            disabled
                        />
                        : undefined
                    }
                />
            )
        }

        if (teamStatus === 'approved') {
            return (
                <NoticeBox
                    color="green"
                    icon={Check}
                    message="Đội đã được BTC chấp thuận. Chúc bạn thi đấu tốt!"
                    button={isLeader
                        ?
                        <Button
                            label="Đã chốt đội"
                            icon={LockSimple}
                            iconPosition="right"
                            iconWeight='fill'
                            variant="primary"
                            disabled
                        />
                        : undefined
                    }
                />
            )
        }

        if (teamStatus === 'rejected') {
            return (
                <NoticeBox
                    color="orange"
                    icon={Warning}
                    message= {(isLeader) 
                        ? "Đội chưa đáp ứng yêu cầu. Vui lòng kiểm tra lại thông tin và nộp lại." 
                        : "Đội chưa đáp ứng yêu cầu của BTC. Hãy liên hệ đội trưởng để biết thêm chi tiết."}
                    button={isLeader
                        ?
                        <Button
                            label="Chốt đội"
                            icon={LockSimple}
                            iconPosition="right"
                            iconWeight='fill'
                            variant="primary"
                            color='orange'
                            onClick={onLockTeam}
                        />
                        : undefined
                    }
                    detail={
                        <div>
                            <p>
                                <strong style={{ color: 'var(--color-primary-orange)' }}>Ban Tổ Chức</strong> yêu cầu bạn điều chỉnh trước khi nộp lại:
                            </p>

                            <p style={{ whiteSpace: 'pre-line' }}>
                                {rejectionReasons}
                            </p>

                            <p>
                                Sau khi điều chỉnh, bấm <strong style={{ color: 'var(--color-primary-orange)' }}>"Chốt đội"</strong> để gửi lại.
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
                        onKick={onKick ? () => onKick(member.id) : undefined}
                        onPromote={onPromote ? () => onPromote(member.id) : undefined}
                        onApproveLeave={onApproveLeave ? () => onApproveLeave(member.id) : undefined}
                        onCancelLeave={onCancelLeave ? () => onCancelLeave(member.id) : undefined}
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