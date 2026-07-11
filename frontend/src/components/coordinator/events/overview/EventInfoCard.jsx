import {
  UsersThree, Trophy, MapPin, Info,
  Envelope, EnvelopeOpen, ArrowRight, User
} from '@phosphor-icons/react'
import SectionHeader from '../../../shared/SectionHeader'
import TagList from '../../TagList'
import MetaChip from '../../MetaChip'
import styles from './EventInfoCard.module.css'

function formatCash(amount) {
  if (!amount && amount !== 0) return null
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
}

function EventInfoCard({ event = {}, totalCash = 0 }) {
  const {
    topic,
    introHtml,
    descriptionHtml,
    registerStart,
    registerEnd,
    participantCount = 0,
    teamCount = 0,
    teamLimit = 0,
    tags = [],
  } = event

  return (
    <div className={styles.container}>
      <SectionHeader icon={Info} title="Thông tin chung" level="h1" />

      {/* Box tổng hợp — 3 cột phân tách rõ ràng */}
      <div className={styles.infoBox}>

        {/* ── Cột trái: MetaChip ngang + Tags bên dưới ── */}
        <div className={styles.leftCol}>
          <div className={styles.metaRow}>
            <MetaChip
              icon={<UsersThree size={22} weight="fill" />}
              label="Thành viên"
              value="3 – 5 người / đội"
            />
            <MetaChip
              icon={<Trophy size={22} weight="fill" />}
              label="Tổng giải thưởng"
              value={formatCash(totalCash) ?? '—'}
            />
            <MetaChip
              icon={<MapPin size={22} weight="fill" />}
              label="Địa điểm"
              value="Đại học FPT"
            />
          </div>

          {/* Tags cùng nhóm với meta, phân tách bằng border-top */}
          {tags.length > 0 && (
            <div className={styles.tagsRow}>
              <TagList tags={tags} maxVisible={6} showLabel={true} />
            </div>
          )}
        </div>

        <div className={styles.colDivider} />

        {/* ── Cột giữa: Ngày đăng ký — ngang, mũi tên phải ── */}
        <div className={styles.datesCol}>
          <div className={styles.dateItem}>
            <div className={styles.dateIconWrap}>
              <Envelope size={32} weight="fill" />
            </div>
            <div className={styles.dateText}>
              <span className={styles.dateLabel}>Mở đơn đăng ký</span>
              <span className={styles.dateValue}>{registerStart ?? '—'}</span>
            </div>
          </div>

          {/* Mũi tên chỉa sang phải */}
          <ArrowRight size={15} weight="bold" className={styles.dateArrow} />

          <div className={styles.dateItem}>
            <div className={styles.dateIconWrap}>
              <EnvelopeOpen size={32} weight="fill" />
            </div>
            <div className={styles.dateText}>
              <span className={styles.dateLabel}>Đóng đơn đăng ký</span>
              <span className={styles.dateValue}>{registerEnd ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className={styles.colDivider} />

        {/* ── Cột phải: Thống kê — số to, nổi bật nhất ── */}
        <div className={styles.statsCol}>
          <div className={styles.statItem}>
            <User size={28} weight="fill" className={styles.statIcon} />
            <span className={styles.statNumber}>{participantCount}</span>
            <span className={styles.statLabel}>Thí sinh đăng ký</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <UsersThree size={28} weight="fill" className={styles.statIcon} />
            <span className={styles.statNumber}>
              {teamCount}
              <span className={styles.statLimit}> / {teamLimit}</span>
            </span>
            <span className={styles.statLabel}>Đội thi</span>
          </div>
        </div>

      </div>

      {/* Box nội dung */}
      <div className={styles.mainBox}>
        {topic && (
          <div className={styles.topicRow}>
            <span className={styles.topicLabel}>Chủ đề</span>
            <span className={styles.topicValue}>{topic}</span>
          </div>
        )}
        {introHtml && (
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Giới thiệu</span>
            <div className={styles.tiptapContent} dangerouslySetInnerHTML={{ __html: introHtml }} />
          </div>
        )}
        {descriptionHtml && (
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Mô tả chi tiết</span>
            <div className={styles.tiptapContent} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EventInfoCard
