import { FileText, CheckCircle, WarningCircle, Info, Clock, UploadSimple, ArrowSquareOut, PencilSimple } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import Badge from '../Badge'
import Banner from '../Banner'
import Button from '../Button'
import styles from './SubmissionRoundCard.module.css'

function SubmissionRoundCard({ round, role }) {
  const navigate = useNavigate()
  const isLeader = role?.toUpperCase() === 'LEADER';

  // Determine card style based on status
  let cardClass = styles.cardUpcoming;
  let badgeVariant = 'gray';
  let badgeLabel = 'Sắp tới';

  if (round.status === 'DONE') {
    if (round.message && round.message.type === 'success') {
      cardClass = styles.cardDoneSuccess;
    } else if (round.evaluation) {
      cardClass = styles.cardDoneEval;
    } else if (round.submissionStatus === 'CLOSED_NO_SUBMISSION') {
      cardClass = styles.cardDoneClosed;
    } else {
      cardClass = styles.cardDone;
    }
    badgeVariant = 'gray';
    badgeLabel = 'Đã kết thúc';
  } else if (round.status === 'ACTIVE') {
    cardClass = styles.cardActive;
    badgeVariant = 'blueSolid';
    badgeLabel = 'Đang diễn ra';
  } else if (round.status === 'LATE') {
    cardClass = styles.cardActive;
    badgeVariant = 'blueSolid';
    badgeLabel = 'Đang diễn ra';
  }

  // Render the notice/deadline area
  const renderNotices = () => {
    return (
      <>
        {round.message && (
          <div className={styles.noticeArea}>
            <Banner 
              color={round.message.type === 'success' ? 'green' : (round.message.type === 'warning' ? 'orange' : 'blue')}
              variant='solid'
              icon={
                (round.submissionStatus === 'READY' || round.message.type === 'warning') 
                ? null 
                : (round.message.type === 'success' ? CheckCircle : Info)
              }
              title={round.message.title}
              message={round.message.content}
            />
          </div>
        )}
        
        {round.submissionDeadline && (
          <div className={styles.deadlineBox}>
            <div>
              <div className={styles.deadlineLabel}>Hạn nộp bài</div>
              <div className={styles.deadlineValue}>{round.submissionDeadline}</div>
            </div>
            {(round.daysLeft !== undefined || round.status === 'LATE') && (
              <Badge 
                variant="dashedOrange" 
                label={round.daysLeft ? `Còn ${round.daysLeft} ngày` : 'Đã quá hạn'} 
                icon={<Clock size={16} weight='fill' />} 
              />
            )}
          </div>
        )}

        {round.status === 'DONE' && round.submissionStatus === 'CLOSED_NO_SUBMISSION' && (
          <div className={styles.closedBox}>
            <FileText size={32} color="var(--color-primary-orange)" weight="fill" />
            <div className={styles.closedTitle}>Không có bài nộp</div>
            <div className={styles.closedDesc}>Cổng nộp bài đã đóng hoàn toàn.</div>
          </div>
        )}

        {round.evaluation && (
          <div className={styles.evaluationBox}>
            <div className={styles.evalLabel}>Kết quả đánh giá:</div>
            <div className={styles.evalTitle}>{round.evaluation.title}</div>
            <div className={styles.evalDesc}>{round.evaluation.content}</div>
            <div className={styles.evalAction}>
              <Button label="Xem kết quả" variant="outline" />
            </div>
          </div>
        )}
      </>
    );
  };

  const handleOpenDetail = () => {
    const eventId = localStorage.getItem('eventId')
    const roundId = round?.id ?? round?.roundId

    if (!roundId) return

    const searchParams = new URLSearchParams()
    if (eventId) searchParams.set('eventId', eventId)
    searchParams.set('roundId', String(roundId))

    navigate(`/team/submissions/detail?${searchParams.toString()}`)
  }

  // Render the footer (submission status and actions)
  const renderFooter = () => {
    if (round.submissionStatus === 'NOT_OPEN' || round.submissionStatus === 'CLOSED_NO_SUBMISSION' || round.submissionStatus === 'EVALUATED') {
        // Not showing footer for these or already handled
        return null;
    }

    let statusIcon = null;
    let statusText = '';
    let statusColor = 'var(--color-text-primary)';

    if (round.submissionStatus === 'NO_SUBMISSION') {
        statusIcon = <FileText size={24} weight="fill" color="var(--color-text-muted)" />;
        statusText = 'Chưa có bài nộp';
    } else if (round.submissionStatus === 'SUBMITTED_ON_TIME' || round.submissionStatus === 'CAN_EDIT') {
        statusIcon = <CheckCircle size={24} weight="fill" color="var(--color-primary-green)" />;
        statusText = round.submissionStatus === 'CAN_EDIT' ? 'Đã nộp (Còn hạn chỉnh sửa)' : 'Đã nộp (Đúng hạn)';
        statusColor = 'var(--color-primary-green)'; // As per screenshot, "Đã nộp" is blue text
    } else if (round.submissionStatus === 'LATE_NO_SUBMISSION') {
        statusIcon = <WarningCircle size={24} weight="fill" color="var(--color-primary-orange)" />;
        statusText = 'Chưa nộp bài (Trễ hạn)';
        statusColor = 'var(--color-primary-orange)';
    } else if (round.submissionStatus === 'READY') {
        statusIcon = <CheckCircle size={24} weight="fill" color="var(--color-primary-green)" />;
        statusText = 'Đã sẵn sàng';
        statusColor = 'var(--color-primary-green)';
    }

    return (
        <div className={styles.footer}>
            <div className={styles.submissionStatus}>
                <div className={styles.footerLabel}>Trạng thái nộp bài</div>
                <div className={styles.statusRow} style={{ color: statusColor }}>
                    {statusIcon}
                    <span className={styles.statusText}>{statusText}</span>
                </div>
            </div>
            <div className={styles.actions}>
                {round.submissionStatus === 'READY' && (
                    <Button label={`Xem lại bài ${round.name}`} variant="outline" color="blue" icon={ArrowSquareOut} onClick={handleOpenDetail} />
                )}
                {round.submissionStatus === 'NO_SUBMISSION' && isLeader && (
                    <Button label="Nộp bài" variant="primary" color="blue" icon={UploadSimple} onClick={handleOpenDetail} />
                )}
                {round.submissionStatus === 'LATE_NO_SUBMISSION' && isLeader && (
                    <Button label="Nộp bài (Muộn)" variant="outline" color="orange" icon={UploadSimple} onClick={handleOpenDetail} />
                )}
                {round.submissionStatus === 'CAN_EDIT' && (
                    <>
                        {!isLeader && <Button label="Xem bài nộp" variant="outline" color="blue" />}
                        {isLeader && <Button label="Cập nhật bài nộp" variant="outline" color="blue" icon={PencilSimple} iconWeight='fill' onClick={handleOpenDetail} />}
                    </>
                )}
                {round.submissionStatus === 'SUBMITTED_ON_TIME' && (
                    <>
                        <Button label="Xem bài nộp" variant="outline" color="grey" />
                        <Button label="Xem kết quả" variant="solid" color="green" />
                    </>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className={`${styles.card} ${cardClass}`}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.roundName}>{round.name}</h2>
          <Badge variant={badgeVariant} label={badgeLabel} dot={false} />
        </div>
        <div className={styles.dateRange}>
          <span>{round.dateRange}</span>
        </div>
      </div>
      
      {renderNotices()}

      {round.status === 'UPCOMING' && (
          <div className={styles.upcomingBox}>
              <Clock size={32} weight='fill' color="var(--color-text-muted)" />
              <div className={styles.upcomingTitle}>Chưa mở cổng nộp bài</div>
              <div className={styles.upcomingDesc}>Thông tin chi tiết sẽ được công bố khi vòng thi bắt đầu.</div>
          </div>
      )}

      {renderFooter()}
    </div>
  )
}

export default SubmissionRoundCard;
