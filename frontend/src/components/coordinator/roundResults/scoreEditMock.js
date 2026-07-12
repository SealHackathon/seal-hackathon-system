// Mock data cho ScoreEditModal — yêu cầu chỉnh điểm từ BGK
export const mockScoreEditData = {
  id: 1,
  // Thông tin ngữ cảnh
  teamName: 'TechTitans',
  teamId: 't-techtitans',
  round: 'Vòng sơ loại',
  submissionId: 'SUB-001',
  time: '15:45 10/07/2026',
  status: 'pending', // 'pending' | 'approved' | 'rejected'

  // BGK gửi yêu cầu
  requestedBy: {
    id: 'j2',
    name: 'Lê Hoàng B',
  },

  // Lý do BGK ghi
  reason: 'Chấm nhầm điểm phần giao diện do lag mạng lúc submit. Vui lòng cho phép sửa lại điểm tiêu chí Thiết kế trải nghiệm từ 5.0 lên 8.0.',

  // Danh sách tiêu chí
  criteria: [
    { id: 'c1', name: 'Tính khả thi kỹ thuật', weight: 25 },
    { id: 'c2', name: 'Sáng tạo & Đổi mới',    weight: 25 },
    { id: 'c3', name: 'Thiết kế trải nghiệm',  weight: 20 },
    { id: 'c4', name: 'Tác động & Tiềm năng',  weight: 30 },
  ],

  // Tiêu chí bị yêu cầu chỉnh (id)
  affectedCriteriaId: 'c3',

  // Điểm của tất cả BGK theo từng tiêu chí
  // isSender: true = BGK gửi yêu cầu
  judges: [
    {
      id: 'j1', name: 'Nguyễn Văn A', isSender: false,
      scores: { c1: 8.0, c2: 7.5, c3: 7.5, c4: 8.5 },
    },
    {
      id: 'j2', name: 'Lê Hoàng B', isSender: true,
      scores: { c1: 7.5, c2: 8.0, c3: 5.0, c4: 8.0 }, // c3 là điểm bị chỉnh
      proposedScores: { c3: 8.0 },                     // điểm đề xuất
    },
    {
      id: 'j3', name: 'Trần Thị C', isSender: false,
      scores: { c1: 8.5, c2: 7.0, c3: 7.0, c4: 9.0 },
    },
    {
      id: 'j4', name: 'Phạm Đức D', isSender: false,
      scores: { c1: 7.0, c2: 8.5, c3: 8.0, c4: 7.5 },
    },
  ],

  // Impact lên điểm tổng & xếp hạng (BTC tính trước để hiển thị)
  impact: {
    totalTeams: 18,
    before: {
      judgeTotal: 7.06,  // điểm tổng của BGK j2 trước khi chỉnh (weighted avg)
      teamScore: 7.78,   // điểm tổng của team (avg tất cả BGK)
      teamRank: 5,
    },
    after: {
      judgeTotal: 7.69,  // điểm tổng của BGK j2 sau khi chỉnh
      teamScore: 8.13,   // điểm tổng của team sau khi chỉnh
      teamRank: 3,
    },
  },
}
