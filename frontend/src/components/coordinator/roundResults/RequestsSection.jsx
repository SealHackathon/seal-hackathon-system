import { useState } from 'react'
import { NotePencil, Flag } from '@phosphor-icons/react'
import Button from '../../shared/Button'
import styles from './RequestsSection.module.css'
import ViolationHandlingModal from './ViolationHandlingModal'
import ScoreEditModal from './ScoreEditModal'
import { mockScoreEditData } from './scoreEditMock'

function RequestsSection({ onOpenTeam, onOpenSubmission }) {
  const [violationModalOpen, setViolationModalOpen] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState(null)
  const [scoreEditModalOpen, setScoreEditModalOpen] = useState(false)
  const [selectedScoreEdit, setSelectedScoreEdit] = useState(null)

  // Dữ liệu mock (tạm thời)
  const mockViolations = [
    {
      id: 1,
      teamName: 'FPT.O-H',
      round: 'Vòng sơ loại',
      judgeName: 'Nguyễn Văn A',
      time: '14:30 10/07/2026',
      reason: 'Nghi ngờ sử dụng source code được làm sẵn từ trước, không tuân thủ quy định Hackathon. Cần kiểm tra lại source code của đội này ngay lập tức để đảm bảo công bằng.'
    }
  ]

  const mockScoreEdits = [
    {
      id: 1,
      teamName: 'TechTitans',
      judgeName: 'Lê Hoàng B',
      time: '15:45 10/07/2026',
      reason: 'Chấm nhầm điểm phần giao diện do lag mạng lúc submit. Vui lòng cho phép sửa lại điểm.'
    }
  ]

  const openViolation = (v) => {
    setSelectedViolation(v)
    setViolationModalOpen(true)
  }

  const openScoreEdit = (req) => {
    // Dùng mock data có sẵn (sau thay bằng data thực tế)
    setSelectedScoreEdit({ ...mockScoreEditData, ...req })
    setScoreEditModalOpen(true)
  }

  return (
    <div className={styles.section}>
      {/* Box Yêu cầu chỉnh sửa điểm */}
      {/* 
      <div className={styles.boxGreen}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <NotePencil size={24} color="var(--color-primary-green)" weight="fill" />
            <h3 className={styles.titleGreen}>Yêu cầu chỉnh sửa</h3>
            <span className={styles.countBadgeGreen}>{mockScoreEdits.length}</span>
          </div>
        </div>

        <div className={styles.list}>
          {mockScoreEdits.length === 0 ? (
            <div className={styles.emptyGreen}>Chưa có yêu cầu nào</div>
          ) : (
            mockScoreEdits.map(req => (
              <div key={req.id} className={styles.cardGreen}>
                <div className={styles.cardInfo}>
                  <strong className={styles.senderName}>{req.judgeName}</strong>
                  <span className={styles.cardTeam}>Về đội: <span className={styles.teamGreen}>{req.teamName}</span></span>
                </div>
                <div className={styles.cardActionGroup}>
                  <span className={styles.time}>{req.time}</span>
                  <Button label="Chi tiết" labelSize="0.8rem" size="xs" variant="outline" color="green" onClick={() => openScoreEdit(req)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      */}

      {/* Box Xử lí vi phạm */}
      <div className={styles.boxOrange}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Flag size={24} color="var(--color-primary-orange)" weight="fill" />
            <h3 className={styles.titleOrange}>Xử lí vi phạm</h3>
            <span className={styles.countBadgeOrange}>{mockViolations.length}</span>
          </div>
        </div>

        <div className={styles.list}>
          {mockViolations.length === 0 ? (
            <div className={styles.emptyOrange}>Chưa có đội bị cắm cờ</div>
          ) : (
            mockViolations.map(v => (
              <div key={v.id} className={styles.cardOrange}>
                <div className={styles.cardInfo}>
                  <strong className={styles.senderName}>{v.judgeName}</strong>
                  <span className={styles.cardTeam}>Về đội: <span className={styles.teamOrange}>{v.teamName}</span></span>
                </div>
                <div className={styles.cardActionGroup}>
                  <span className={styles.time}>{v.time}</span>
                  <Button label="Chi tiết" labelSize="0.8rem" size="xs" variant="outline" color="orange" onClick={() => openViolation(v)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {violationModalOpen && (
        <ViolationHandlingModal 
          isOpen={violationModalOpen} 
          onClose={() => setViolationModalOpen(false)}
          data={selectedViolation}
          onOpenTeam={onOpenTeam}
          onOpenSubmission={onOpenSubmission}
        />
      )}

      {scoreEditModalOpen && (
        <ScoreEditModal
          isOpen={scoreEditModalOpen}
          onClose={() => setScoreEditModalOpen(false)}
          data={selectedScoreEdit}
          onOpenTeam={onOpenTeam}
          onOpenSubmission={onOpenSubmission}
        />
      )}
    </div>
  )
}

export default RequestsSection
