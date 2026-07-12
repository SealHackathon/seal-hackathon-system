import { useState } from 'react'
import {
  WarningCircle,
  ShieldCheck,
  ProhibitInset,
  User,
  Clock,
  UsersThree,
  Package,
  Flag,
  CaretRight,
  ChatCircleDots
} from '@phosphor-icons/react'
import ModalShell from '../../shared/ModalShell'
import Button from '../../shared/Button'
import FormTextarea from '../../shared/FormTextarea'
import RadioCardGroup from '../../shared/RadioCardGroup'
import TeamDetailModal from './TeamDetailModal'
import SubmissionModal from '../../panelist/event/mentorTeamDetail/SubmissionModal'
import styles from './ViolationHandlingModal.module.css'

const ACTIONS = [
  { 
    value: 'ignore', 
    label: 'Bỏ qua (Không vi phạm)', 
    description: 'Xóa cờ vi phạm, kết quả vẫn được tính bình thường.',
    icon: ShieldCheck
  },
  { 
    value: 'disqualify', 
    label: 'Loại đội thi', 
    description: 'Hủy toàn bộ kết quả của đội tại vòng thi này.',
    icon: ProhibitInset
  }
]

// Dữ liệu mock để truyền vào TeamDetailModal khi mở từ đây
const mockTeamForDetail = {
  rank: 5,
  score: 8.2,
  team: { id: 't-mock', name: '' }
}

// Dữ liệu mock round để truyền vào SubmissionModal
const mockRoundForSubmission = {
  name: '',
  late: false,
  submittedAt: null,
  submission: {
    github: { url: 'https://github.com' },
    slide: { url: '' },
    video: { url: '' }
  }
}

function ViolationHandlingModal({ isOpen, onClose, data, onOpenTeam, onOpenSubmission }) {
  const [action, setAction] = useState('ignore')
  const [reason, setReason] = useState('')

  // State mở modal chi tiết từ bên trong
  const [teamDetailOpen, setTeamDetailOpen] = useState(false)
  const [submissionOpen, setSubmissionOpen] = useState(false)

  if (!isOpen || !data) return null

  const handleOpenTeam = (e) => {
    e.preventDefault()
    if (onOpenTeam) {
      onOpenTeam(data.teamId)
    } else {
      setTeamDetailOpen(true)
    }
  }

  const handleOpenSubmission = (e) => {
    e.preventDefault()
    if (onOpenSubmission) {
      onOpenSubmission(data.teamId)
    } else {
      setSubmissionOpen(true)
    }
  }

  const footer = (
    <div className={styles.footerContainer}>
      <Button label="Hủy" variant="outline" color="grblueey" onClick={onClose} />
      <Button
        label="Xác nhận quyết định"
        variant="primary"
        color="blue"
        onClick={() => { onClose() }}
        disabled={!reason.trim()}
      />
    </div>
  )

  // Dữ liệu team mock dùng cho TeamDetailModal fallback
  const teamForModal = {
    ...mockTeamForDetail,
    team: { id: data.teamId || 't-mock', name: data.teamName || '' }
  }

  // Round mock cho SubmissionModal fallback
  const roundForSubmission = {
    ...mockRoundForSubmission,
    name: data.round || ''
  }

  return (
    <>
      <ModalShell
        onClose={onClose}
        title="Xử lí vi phạm"
        icon={<Flag size={24} weight="fill"/>}
        subtitle="Xem xét và đưa ra quyết định chính thức về cờ vi phạm được ghi nhận từ ban giám khảo."
        footer={footer}
        size="md"
        showBottomOverlay={true}
      >
        <div className={styles.content}>

          {/* THÔNG TIN GHI NHẬN — gộp trong 1 box */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>Thông tin ghi nhận</h4>

            <div className={styles.infoBox}>

              {/* Hàng meta: người cắm cờ + thời gian — trên cùng, nhỏ gọn */}
              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIconWrap}>
                    <User size={16} weight="fill" />
                  </span>
                  <span className={styles.metaLabel}>Người cắm cờ:</span>
                  <span className={styles.metaValue}>{data.judgeName}</span>
                </div>
                <div className={styles.metaDot} />
                <div className={styles.metaItem}>
                  <span className={styles.metaIconWrap}>
                    <Clock size={16} weight="fill" />
                  </span>
                  <span className={styles.metaLabel}>Thời gian:</span>
                  <span className={styles.metaValue}>{data.time}</span>
                </div>
              </div>

              <div className={styles.infoBoxDivider} />

              {/* 2 nút mở modal: đội thi + bài nộp */}
              <div className={styles.linkList}>
                <button type="button" className={styles.linkItem} onClick={handleOpenTeam}>
                  <div className={styles.linkItemLeft}>
                    <UsersThree size={20} weight="fill" className={styles.linkItemIcon} />
                    <span className={styles.linkItemLabel}>Đội thi bị cắm cờ</span>
                  </div>
                  <div className={styles.linkItemRight}>
                    <strong className={styles.linkItemValue}>{data.teamName}</strong>
                    <CaretRight size={20} weight="bold" className={styles.linkItemArrow} />
                  </div>
                </button>

                <button type="button" className={styles.linkItem} onClick={handleOpenSubmission}>
                  <div className={styles.linkItemLeft}>
                    <Package size={20} weight="fill" className={styles.linkItemIcon} />
                    <span className={styles.linkItemLabel}>Bài nộp liên quan</span>
                  </div>
                  <div className={styles.linkItemRight}>
                    <strong className={styles.linkItemValue}>{data.round}</strong>
                    <CaretRight size={20} weight="bold" className={styles.linkItemArrow} />
                  </div>
                </button>
              </div>

              <div className={styles.infoBoxDivider} />

              {/* Ghi chú BGK — dưới cùng, focus vào nội dung */}
              <div className={styles.noteSection}>
                <div className={styles.noteIconWrap}>
                  <ChatCircleDots size={28} weight="fill" className={styles.noteIcon} />
                  <span className={styles.noteLabel}>Ghi chú từ ban giám khảo</span>
                </div>
                <p className={styles.noteText}>{data.reason}</p>
              </div>

            </div>
          </div>

          {/* QUYẾT ĐỊNH XỬ LÍ */}
          <div className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>Quyết định xử lí</h4>
            <RadioCardGroup
              options={ACTIONS}
              value={action}
              onChange={setAction}
              columns={2}
            />
          </div>

          {action === 'disqualify' && (
            <div className={styles.alertBox}>
              <WarningCircle size={22} weight="fill" color="var(--color-primary-orange)" className={styles.alertIcon} />
              <div className={styles.alertText}>
                <strong>Lưu ý quan trọng:</strong> Khi chọn Loại đội thi, toàn bộ điểm số của đội trong vòng này sẽ bị hủy bỏ và không được tính vào bảng xếp hạng. Hành động này không thể hoàn tác một khi đã công bố kết quả.
              </div>
            </div>
          )}

          <div className={styles.reasonBox}>
            <FormTextarea
              label="Lý do & Ghi chú xử lí (Bắt buộc)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Nhập lý do cho quyết định xử lí của Ban tổ chức..."
              required
            />
          </div>
        </div>
      </ModalShell>

      {/* Modal chi tiết đội — fallback */}
      <TeamDetailModal
        open={teamDetailOpen}
        team={teamForModal}
        onClose={() => setTeamDetailOpen(false)}
      />

      {/* Modal bài nộp — fallback */}
      <SubmissionModal
        open={submissionOpen}
        round={roundForSubmission}
        onClose={() => setSubmissionOpen(false)}
      />
    </>
  )
}

export default ViolationHandlingModal
