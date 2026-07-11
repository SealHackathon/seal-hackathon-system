import { Warning, SealCheck, LockSimple, Info } from '@phosphor-icons/react'
import MemberRow from './MemberRow'
import EmptyMemberSlot from './EmptyMemberSlot'
import TeamStatusTag from '../shared/TeamStatusTag'
import Banner from '../shared/Banner'
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
                <Banner
                    color="orange"
                    variant='dashed'
                    iconSize={64}
                    icon={Info}
                    title={isLeader ? "Chốt đội thi đấu" : "Chờ chốt đội thi đấu"}
                    message={isLeader 
                        ? <>Sau khi chốt đội, danh sách thành viên sẽ bị khóa và không thể thay đổi.<br/>Hãy chắc chắn kiểm tra kỹ thông tin thành viên và hạng mục trước khi xác nhận.</> 
                        : <>Đội trưởng của bạn hiện chưa chốt danh sách thành viên.<br/>Vui lòng liên hệ đội trưởng nếu cần thiết.</>}
                    buttons={isLeader
                        ?
                        <Button
                            label="Chốt đội"
                            icon={LockSimple}
                            iconWeight='fill'
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
                <Banner
                    color="orange"
                    icon={Warning}
                    iconSize={64}
                    title="Đang chờ Ban tổ chức xét duyệt"
                    message={isLeader 
                        ? <>Đội của bạn đã gửi yêu cầu chốt danh sách thành viên và đang chờ Ban tổ chức xem xét.</> 
                        : <>Đội của bạn đã gửi danh sách thành viên và đang chờ Ban tổ chức xét duyệt.<br/>Vui lòng kiên nhẫn chờ đợi.</>}
                    buttons={isLeader
                        ?
                        <Button
                            label="Đang chờ BTC duyệt"
                            icon={LockSimple}
                            iconWeight='fill'
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
                <Banner
                    color="green"
                    icon={SealCheck}
                    iconSize={64}
                    title="Đội đã được phê duyệt!"
                    message={<>Tuyệt vời, đội của bạn đã được Ban tổ chức chấp thuận hợp lệ.<br/>Chúc các bạn thi đấu thật bùng nổ!</>}
                    buttons={isLeader
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
                <Banner
                    color="orange"
                    iconSize={64}
                    icon={Warning}
                    title={isLeader ? "Yêu cầu chốt đội bị từ chối" : "Đội cần được điều chỉnh thông tin"}
                    message={isLeader 
                        ? <>Danh sách đội của bạn chưa đáp ứng yêu cầu từ Ban tổ chức.<br/>Vui lòng kiểm tra kỹ các thông tin cần điều chỉnh và nộp lại.</>
                        : <>Danh sách thành viên hiện tại chưa đáp ứng yêu cầu của Ban tổ chức.<br/>Hãy liên hệ với đội trưởng của bạn để cập nhật thêm.</>}
                    buttons={isLeader
                        ?
                        <Button
                            label="Chốt đội"
                            icon={LockSimple}
                            iconWeight='fill'
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