export const AUDIT_OVERVIEW = {
  totalActions: 5,
  scoreSubmissions: 2,
  scoreEdits: 2,
  violationsFlagged: 1,
}

export const AUDIT_LOGS = [
  { id: 'al1', type: 'score_submitted', user: 'ThS. Lê Hoàng Bình', action: 'đã hoàn thành chấm điểm', target: 'đội TechTitans', time: '10:35 22/07/2026', detail: 'Tổng: 8.0' },
  { id: 'al2', type: 'score_edited', user: 'PGS. Trần Minh Châu', action: 'đã chỉnh sửa điểm', target: 'đội NeuroLabs', time: '09:12 22/07/2026', detail: 'Tiêu chí Sáng tạo: 8.5 thành 9.0' },
  { id: 'al3', type: 'flagged', user: 'TS. Nguyễn Văn An', action: 'gắn cờ vi phạm', target: 'đội DataDriven', time: '16:40 21/07/2026', detail: 'Lý do: Nghi ngờ sử dụng code từ trước' },
  { id: 'al4', type: 'score_submitted', user: 'TS. Nguyễn Văn An', action: 'đã hoàn thành chấm điểm', target: 'đội CipherGuard', time: '14:20 21/07/2026', detail: 'Tổng: 9.5' },
  { id: 'al5', type: 'score_edited', user: 'ThS. Lê Hoàng Bình', action: 'đã chỉnh sửa điểm', target: 'đội ZeroDay', time: '09:05 21/07/2026', detail: 'Tiêu chí Khả năng thực thi: 7.5 thành 8.0' },
]
