import { Clock, ClockCountdown, Warning, WarningCircle, CheckCircle, Trophy, SealCheck, FlagCheckered, ChartBar, LockKey, FileDashed, CalendarCheck, HourglassHigh, CalendarX, Info } from '@phosphor-icons/react'
import styles from './HeroCard.module.css'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import { useNavigate } from 'react-router-dom'

function HeroCard({ round, state, now }) {
  const navigate = useNavigate();
  const openAt = round.openAt;
  const closeAt = round.closeAt;

  let badge, banner = null, center = null;

  if (state === 'upcoming') {
    badge = <Badge variant="gray" icon={<LockKey weight="fill" />} label="Sắp mở" />
    center = (
      <div className={styles.centerBox}>
        <div className={styles.centerIcon}><Clock weight="fill" /></div>
        <div className={styles.centerTitle}>Chưa mở cổng nộp bài</div>
        <div className={styles.centerText}>Cổng nộp bài sẽ được kích hoạt vào lúc <b>{openAt}</b>.<br />Bạn có thể xem trước hướng dẫn và tiêu chí trong lúc chờ.</div>
      </div>
    )
  } else if (state === 'active') {
    badge = <Badge variant="green" label="Đang diễn ra" />
    banner = (
      <div className={`${styles.policy} ${styles.toneBlue}`}>
        <Info weight="fill" />
        <span>Vòng này <b>cho phép nộp trễ</b>: sau hạn bạn vẫn nộp được nhưng bài sẽ bị đánh dấu nộp trễ và trừ điểm.</span>
      </div>
    )
  } else if (state === 'late') {
    badge = <Badge variant="green" label="Đang diễn ra" />
    banner = (
      <div className={styles.lateBox}>
        <div className={styles.lateTitle}><Warning size='24' weight="fill" color='var(--color-dark-orange)' />Nộp bù sẽ bị trừ điểm</div>
        <p className={styles.lateText}>Cổng chính thức đã đóng lúc <b>{closeAt}</b>. Bài nộp bây giờ vẫn được ghi nhận nhưng sẽ mang nhãn <b>Nộp trễ</b> và bị trừ điểm theo quy định.</p>
      </div>
    )
  } else if (state === 'done_success') {
    badge = <Badge variant="green" icon={<CheckCircle weight="fill" />} label="Đã vượt qua vòng thi" />
    banner = (
      <div className={styles.successBox}>
        <div className={styles.successTitle}><Trophy size='24' weight="fill" color='var(--color-border-green)' />Chúc mừng! Đội đã vượt qua vòng thi</div>
        <p className={styles.successText}>Bạn có thể xem chi tiết nhận xét và điểm số của Ban giám khảo.</p>
        <Button label="Xem kết quả" icon={ChartBar} color='green' variant="outline" iconWeight='fill' iconColor='var(--color-border-green)' onClick={() => navigate(`/event/${localStorage.getItem('eventId')}/leaderboard`)} />
      </div>
    )
  } else if (state === 'done_eval') {
    badge = <Badge variant="blue" icon={<SealCheck weight="fill" />} label="Đã đánh giá xong" />
    banner = (
      <div className={styles.evalBox}>
        <div className={styles.evalTitle}><FlagCheckered size='24' weight="fill" color='var(--color-border-blue)' />Hành trình dừng lại ở vòng này</div>
        <p className={styles.evalText}>Cảm ơn đội đã nỗ lực! Sau khi đánh giá, đội chưa đủ điều kiện đi tiếp. Bạn có thể xem chi tiết nhận xét và điểm số của Ban giám khảo.</p>
        <Button label="Xem kết quả" icon={ChartBar} variant="outline" iconWeight='fill' onClick={() => navigate(`/event/${localStorage.getItem('eventId')}/leaderboard`)} />
      </div>
    )
  } else if (state === 'done_closed') {
    badge = <Badge variant="gray" icon={<LockKey weight="fill" />} label="Cổng đã đóng" />
    center = (
      <div className={styles.centerBox}>
        <div className={styles.centerIcon}><FileDashed weight="fill" /></div>
        <div className={styles.centerTitle}>Không có bài nộp — cổng đã đóng hoàn toàn</div>
        <div className={styles.centerText}>Vòng thi đã kết thúc và đội không nộp bài nào. Không thể nộp hoặc chỉnh sửa thêm cho vòng này.</div>
      </div>
    )
  }

  return (
    <div className={`${styles.hero} ${styles[state]}`}>
      <div className={styles.order}>{round.order} · {round.track}</div>
      <div className={styles.top}>
        <h1 className={styles.title}>{round.name}</h1>
        {badge}
      </div>
      <p className={styles.desc}>{round.desc}</p>
      {banner}
      {center}
    </div>
  )
}

export default HeroCard
