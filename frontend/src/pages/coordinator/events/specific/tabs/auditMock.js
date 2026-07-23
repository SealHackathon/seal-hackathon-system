export const AUDIT_OVERVIEW = {
  totalActions: 5,
  scoreSubmissions: 2,
  scoreEdits: 2,
  violationsFlagged: 1,
}

export const MOCK_API_RESPONSE_LOGS = {
  meta: {
    currentPage: 1,
    totalPages: 5,
    totalRecords: 100,
    limit: 20
  },
  data: [
    { id: 'al1', type: 'score_submitted', user: 'ThS. Lê Hoàng Bình', action: 'đã hoàn thành chấm điểm', target: 'đội TechTitans', time: '2026-07-22T10:35:00Z', detail: 'Tổng: 8.0' },
    { id: 'al2', type: 'score_edited', user: 'PGS. Trần Minh Châu', action: 'đã chỉnh sửa điểm', target: 'đội NeuroLabs', time: '2026-07-22T09:12:00Z', detail: 'Tiêu chí Sáng tạo: 8.5 thành 9.0\nLý do: Đội có nộp thêm bằng chứng.' },
    { id: 'al3', type: 'flagged', user: 'TS. Nguyễn Văn An', action: 'gắn cờ vi phạm', target: 'đội DataDriven', time: '2026-07-21T16:40:00Z', detail: 'Lý do: Nghi ngờ sao chép mã nguồn mở.' },
    { id: 'al4', type: 'score_submitted', user: 'TS. Nguyễn Văn An', action: 'đã hoàn thành chấm điểm', target: 'đội CipherGuard', time: '2026-07-21T14:20:00Z', detail: 'Tổng: 9.5' },
    { id: 'al5', type: 'score_edited', user: 'ThS. Lê Hoàng Bình', action: 'đã chỉnh sửa điểm', target: 'đội ZeroDay', time: '2026-07-21T09:05:00Z', detail: 'Tiêu chí Khả năng thực thi: 7.5 thành 8.0' },
  ]
};
