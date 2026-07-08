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
    minSlots = 3,
    teamStatus,
    isLeader,
    onKick,
    onPromote,
    onLeave,
    onLockTeam,
    onApproveLeave,
    onCancelLeave,
    onMoveToOfficial,
    onMoveToReserve,
    rejectionReasons,
    leaveRequests = [],
    hasSelectedCategory = true,
}) {

    const officialMembers = members.filter(m => m.memberStatus !== 'RESERVE')
    const reserveMembers  = members.filter(m => m.memberStatus === 'RESERVE')
    const emptyCount = Math.max(0, maxSlots - officialMembers.length)


    function renderNoticeBox() {
        if (teamStatus === 'OPEN') {
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
                            disabled={officialMembers.length < minSlots || !hasSelectedCategory}
                        />
                        : undefined
                    }
                />
            )
        }

        if (teamStatus === 'PENDING_APPROVAL') {
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

        if (teamStatus === 'APPROVED') {
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

        if (teamStatus === 'REJECTED') {
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
                            disabled={!hasSelectedCategory}
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
                    {officialMembers.length}/{maxSlots} thành viên
                </span>
                <TeamStatusTag status={teamStatus} />
            </div>


            {/* ── Hàng chính thức ── */}
            <div className={styles.section}>
                <span className={styles.sectionLabel}>Hàng chính thức</span>

                <div className={styles.memberList}>
                    {officialMembers.map((member, i) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            teamStatus={teamStatus}
                            index={i + 1}
                            name={member.name}
                            email={member.email}
                            school={member.school}
                            isLeader={member.isLeader}
                            isCurrentUser={member.isCurrentUser}
                            memberStatus={member.memberStatus ?? 'OFFICAL'}
                            joinMethod={member.joinMethod}
                            onKick={onKick ? () => onKick(member.id) : undefined}
                            onPromote={onPromote ? () => onPromote(member.id) : undefined}
                            onMoveToReserve={(!member.isLeader && isLeader && onMoveToReserve)
                                ? () => onMoveToReserve(member.id)
                                : undefined
                            }
                            onApproveLeave={onApproveLeave ? () => onApproveLeave(member.id) : undefined}
                            onCancelLeave={onCancelLeave ? () => onCancelLeave(member.id) : undefined}
                            onLeave={onLeave}
                            leaveRequest={leaveRequests.find(r => r.name === member.name) ?? null}
                        />
                    ))}

                    {Array.from({ length: emptyCount }).map((_, i) => (
                        <EmptyMemberSlot key={`empty-${i}`} index={officialMembers.length + i + 1} />
                    ))}
                </div>
            </div>


            {/* ── Hàng dự bị ── */}
            {reserveMembers.length > 0 && (
                <div className={styles.section}>
                    <span className={styles.sectionLabel}>Hàng dự bị</span>

                    <div className={styles.memberList}>
                        {reserveMembers.map((member, i) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                teamStatus={teamStatus}
                                index={i + 1}
                                name={member.name}
                                email={member.email}
                                school={member.school}
                                isLeader={false}
                                isCurrentUser={member.isCurrentUser}
                                memberStatus="RESERVE"
                                joinMethod={member.joinMethod}
                                onKick={onKick ? () => onKick(member.id) : undefined}
                                onMoveToOfficial={(isLeader && onMoveToOfficial)
                                    ? () => onMoveToOfficial(member.id)
                                    : undefined
                                }
                                onApproveLeave={onApproveLeave ? () => onApproveLeave(member.id) : undefined}
                                onCancelLeave={onCancelLeave ? () => onCancelLeave(member.id) : undefined}
                                onLeave={onLeave}
                                leaveRequest={leaveRequests.find(r => r.name === member.name) ?? null}
                            />
                        ))}
                    </div>
                </div>
            )}


            {renderNoticeBox()}

        </div>
    )
}

export default TeamMemberPanel