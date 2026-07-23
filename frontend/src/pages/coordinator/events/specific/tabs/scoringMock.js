// Mock data cho tab Chấm điểm (ScoringTab)
// Cấu trúc: rounds, tracks, judges, entries (đội×BGK×tiêu chí), requests

export const ROUNDS = [
  { id: 'r1', name: 'Vòng sơ loại', isCurrent: false },
  { id: 'r2', name: 'Vòng bán kết', isCurrent: true },
  { id: 'r3', name: 'Vòng chung kết', isCurrent: false },
]

export const TRACKS = [
  { id: 'all', name: 'Tất cả track' },
  { id: 't1', name: 'AI & Machine Learning' },
  { id: 't2', name: 'Web / Mobile' },
  { id: 't3', name: 'Cybersecurity' },
]

export const JUDGES = [
  { id: 'j1', name: 'TS. Nguyễn Văn An', assigned: 40, scored: 40 },
  { id: 'j2', name: 'ThS. Lê Hoàng Bình', assigned: 40, scored: 32 },
  { id: 'j3', name: 'PGS. Trần Minh Châu', assigned: 40, scored: 18 },
]

export const CRITERIA = [
  { id: 'c1', name: 'Tính sáng tạo', weight: 0.3 },
  { id: 'c2', name: 'Khả năng thực thi', weight: 0.3 },
  { id: 'c3', name: 'Tác động xã hội', weight: 0.2 },
  { id: 'c4', name: 'Trình bày', weight: 0.2 },
]

// Danh sách đội tham gia (theo track và vòng)
export const ENTRIES = [
  // Track AI - Vòng bán kết
  {
    teamId: 'team1', teamName: 'TechTitans', trackId: 't1', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 8.5, scores: { c1: 9, c2: 8, c3: 8.5, c4: 8.5 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 8.0, scores: { c1: 8, c2: 7.5, c3: 8.5, c4: 8 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: true, total: 6.0, scores: { c1: 5.5, c2: 6.5, c3: 6, c4: 6 } },
    ],
    discrepancy: { stdDev: 1.28 }, // Lệch vượt ngưỡng
  },
  {
    teamId: 'team2', teamName: 'AlphaCoders', trackId: 't1', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 7.8, scores: { c1: 8, c2: 7.5, c3: 8, c4: 7.5 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 7.9, scores: { c1: 8, c2: 8, c3: 7.5, c4: 8 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: false, total: null, scores: {} },
    ],
  },
  {
    teamId: 'team3', teamName: 'NeuroLabs', trackId: 't1', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 9.2, scores: { c1: 9.5, c2: 9, c3: 9, c4: 9.5 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 8.7, scores: { c1: 9, c2: 8.5, c3: 8.5, c4: 8.5 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: true, total: 9.0, scores: { c1: 9, c2: 9, c3: 9, c4: 9 } },
    ],
  },
  {
    teamId: 'team4', teamName: 'DataDriven', trackId: 't1', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 6.5, scores: { c1: 6.5, c2: 7, c3: 6, c4: 6.5 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 7.2, scores: { c1: 7, c2: 7.5, c3: 7, c4: 7.5 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: true, total: 6.8, scores: { c1: 7, c2: 6.5, c3: 7, c4: 6.5 } },
    ],
    violation: { reason: 'Nghi sử dụng code từ trước' },
  },

  // Track Web/Mobile - Vòng bán kết
  {
    teamId: 'team5', teamName: 'PixelPerfect', trackId: 't2', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 8.9, scores: { c1: 9, c2: 9, c3: 8.5, c4: 9 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 8.5, scores: { c1: 8.5, c2: 8.5, c3: 8, c4: 9 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: true, total: 8.7, scores: { c1: 9, c2: 8.5, c3: 8.5, c4: 8.5 } },
    ],
  },
  {
    teamId: 'team6', teamName: 'CodeCraft', trackId: 't2', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 7.1, scores: { c1: 7, c2: 7.5, c3: 7, c4: 7 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: false, total: null, scores: {} },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: false, total: null, scores: {} },
    ],
  },
  {
    teamId: 'team7', teamName: 'AppForge', trackId: 't2', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 8.0, scores: { c1: 8, c2: 8, c3: 8, c4: 8 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 7.5, scores: { c1: 7.5, c2: 7.5, c3: 7.5, c4: 7.5 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: true, total: 7.8, scores: { c1: 8, c2: 7.5, c3: 8, c4: 7.5 } },
    ],
  },

  // Track Cybersecurity - Vòng bán kết
  {
    teamId: 'team8', teamName: 'CipherGuard', trackId: 't3', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 9.5, scores: { c1: 9.5, c2: 9.5, c3: 9.5, c4: 9.5 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 9.3, scores: { c1: 9.5, c2: 9, c3: 9.5, c4: 9 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: true, total: 9.1, scores: { c1: 9, c2: 9.5, c3: 9, c4: 9 } },
    ],
  },
  {
    teamId: 'team9', teamName: 'ZeroDay', trackId: 't3', roundId: 'r2',
    perJudge: [
      { judgeId: 'j1', judgeName: 'TS. Nguyễn Văn An', submitted: true, total: 7.5, scores: { c1: 7.5, c2: 7.5, c3: 7.5, c4: 7.5 } },
      { judgeId: 'j2', judgeName: 'ThS. Lê Hoàng Bình', submitted: true, total: 8.0, scores: { c1: 8, c2: 8, c3: 8, c4: 8 } },
      { judgeId: 'j3', judgeName: 'PGS. Trần Minh Châu', submitted: false, total: null, scores: {} },
    ],
    discrepancy: { stdDev: 1.15 },
  },
]

// Yêu cầu chỉnh điểm + báo vi phạm đang chờ
export const PENDING_REQUESTS = [
  { id: 'req1', type: 'scoreEdit', teamName: 'TechTitans', judgeName: 'ThS. Lê Hoàng Bình', time: '14:30 10/07', round: 'Vòng bán kết', reason: 'Chấm nhầm do lag mạng' },
  { id: 'req2', type: 'scoreEdit', teamName: 'AlphaCoders', judgeName: 'PGS. Trần Minh Châu', time: '15:10 10/07', round: 'Vòng bán kết', reason: 'Tính điểm sai tiêu chí' },
  { id: 'req3', type: 'scoreEdit', teamName: 'ZeroDay', judgeName: 'TS. Nguyễn Văn An', time: '16:00 10/07', round: 'Vòng bán kết', reason: 'Bấm nhầm' },
  { id: 'req4', type: 'violation', teamName: 'DataDriven', judgeName: 'TS. Nguyễn Văn An', time: '13:20 10/07', round: 'Vòng bán kết', reason: 'Nghi ngờ dùng code sẵn' },
  { id: 'req5', type: 'violation', teamName: 'CodeCraft', judgeName: 'ThS. Lê Hoàng Bình', time: '14:50 10/07', round: 'Vòng bán kết', reason: 'Vi phạm thời gian nộp bài' },
]

// Danh sách các bài có độ lệch BGK vượt ngưỡng (stdDev > 1.0)
export const DISCREPANCY_LIST = [
  { teamId: 'team1', teamName: 'TechTitans', trackName: 'AI & ML', stdDev: 1.28, roundName: 'Vòng bán kết' },
  { teamId: 'team9', teamName: 'ZeroDay', trackName: 'Cybersecurity', stdDev: 1.15, roundName: 'Vòng bán kết' },
]

// Tổng quan toàn sự kiện (cross-round)
export const EVENT_OVERVIEW = {
  totalTeams: 120,
  totalScored: 84,    // đã chấm đủ tất cả BGK
  totalPending: 36,   // chưa đủ điểm
  pendingScoreEdits: 3,
  pendingViolations: 2,
  discrepancyCount: 7,
}


