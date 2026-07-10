
export const CRITERIA = [
  { id: 'c1', name: 'Tính đổi mới', weight: 30 },
  { id: 'c2', name: 'Kỹ thuật & hoàn thiện', weight: 30 },
  { id: 'c3', name: 'Tính ứng dụng', weight: 25 },
  { id: 'c4', name: 'Thuyết trình', weight: 15 },
]

export const ROUNDS = [
  { id: 'soloai', name: 'Vòng sơ loại', lifecycle: 'done', timeStart: '2026-06-20', timeEnd: '2026-06-25', isFinal: false },
  { id: 'doidau', name: 'Vòng đối đầu', lifecycle: 'done', timeStart: '2026-07-01', timeEnd: '2026-07-10', isFinal: false },
  { id: 'semifinal', name: 'Vòng bán kết', lifecycle: 'active', timeStart: '2026-07-12', timeEnd: '2026-07-15', isFinal: false },
  { id: 'final', name: 'Vòng chung kết', lifecycle: 'active', timeStart: '2026-07-20', timeEnd: '2026-07-25', isFinal: true },
]

export const CATEGORIES = [
  { id: 'ai', name: 'AI Agents for Innovation' },
  { id: 'fintech', name: 'FinTech Sandbox' },
]

// Tien ich tao diem 1 giam khao.
function j(judge, submitted, c1, c2, c3, c4, total) {
  return { judge, submitted, scores: { c1, c2, c3, c4 }, total }
}

// Doi co diem chinh thuc, 2 giam khao deu da submit (dung cho cac vong da xong).
function official(id, name, total) {
  return {
    team: { id, name },
    assignedCount: 2,
    perJudge: [
      j('GK. Minh', true, total, total, total, total, total),
      j('GK. Huy', true, total, total, total, total, total),
    ],
  }
}

// -- Vong so loai (da cong bo) --
const SOLOAI = {
  updatedAt: '2026-06-25T18:00:00+07:00',
  review: null,
  judges: [
    { id: 'j1', name: 'GK. Minh', assigned: 6, scored: 6, lastUpdate: '2026-06-25T16:00:00+07:00' },
    { id: 'j3', name: 'GK. Huy', assigned: 6, scored: 6, lastUpdate: '2026-06-25T15:30:00+07:00' },
  ],
  entries: [
    official('ledgerlink', 'LedgerLink', 8.45),
    official('neopay', 'NeoPay', 8.2),
    official('quantumleap', 'QuantumLeap', 8.1),
    official('dataforge', 'DataForge', 7.9),
    official('greentrace', 'GreenTrace', 7.6),
    official('skyroute', 'SkyRoute', 7.4),
  ],
}

// -- Vong doi dau (da cong bo) --
const DOIDAU = {
  updatedAt: '2026-07-10T18:00:00+07:00',
  review: null,
  judges: [
    { id: 'j1', name: 'GK. Minh', assigned: 6, scored: 6, lastUpdate: '2026-07-10T16:00:00+07:00' },
    { id: 'j3', name: 'GK. Huy', assigned: 6, scored: 6, lastUpdate: '2026-07-10T15:30:00+07:00' },
  ],
  entries: [
    official('ledgerlink', 'LedgerLink', 8.6),
    official('neopay', 'NeoPay', 8.3),
    official('quantumleap', 'QuantumLeap', 8.2),
    official('dataforge', 'DataForge', 8.0),
    official('greentrace', 'GreenTrace', 7.5),
    official('skyroute', 'SkyRoute', 7.2),
  ],
}

// -- Vong ban ket (dang dien ra) -- du moi edge case --
const SEMIFINAL = {
  updatedAt: '2026-07-15T02:05:00+07:00',
  review: null,
  judges: [
    { id: 'j1', name: 'GK. Minh', assigned: 9, scored: 9, lastUpdate: '2026-07-15T01:40:00+07:00' },
    { id: 'j2', name: 'GK. Lan', assigned: 9, scored: 7, lastUpdate: '2026-07-15T02:00:00+07:00' },
    { id: 'j3', name: 'GK. Huy', assigned: 9, scored: 9, lastUpdate: '2026-07-15T01:20:00+07:00' },
    { id: 'j4', name: 'GK. Trang', assigned: 6, scored: 0, lastUpdate: null },
  ],
  entries: [
    {
      team: { id: 'ledgerlink', name: 'LedgerLink' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 8.5, 8.8, 8.7, 9.0, 8.7),
        j('GK. Lan', true, 8.4, 8.6, 8.5, 8.5, 8.5),
        j('GK. Huy', true, 8.6, 8.5, 8.7, 8.6, 8.6),
      ],
    },
    {
      team: { id: 'neopay', name: 'NeoPay' },
      assignedCount: 3,
      tieBreakNote: 'Hòa 8.10 — tie-break theo tiêu chí Tính đổi mới',
      perJudge: [
        j('GK. Minh', true, 8.1, 8.1, 8.1, 8.1, 8.1),
        j('GK. Lan', true, 8.1, 8.1, 8.1, 8.1, 8.1),
        j('GK. Huy', true, 8.1, 8.1, 8.1, 8.1, 8.1),
      ],
    },
    {
      team: { id: 'quantumleap', name: 'QuantumLeap' },
      assignedCount: 3,
      tieBreakNote: 'Hòa 8.10 — tie-break theo tiêu chí Tính đổi mới',
      perJudge: [
        j('GK. Minh', true, 8.3, 8.0, 8.1, 8.1, 8.2),
        j('GK. Lan', true, 8.0, 8.0, 8.0, 8.0, 8.0),
        j('GK. Huy', true, 8.1, 8.1, 8.1, 8.1, 8.1),
      ],
    },
    {
      team: { id: 'dataforge', name: 'DataForge' },
      assignedCount: 3,
      discrepancy: { flagged: true, stdDev: 1.35 },
      perJudge: [
        j('GK. Minh', true, 9.5, 9.0, 9.5, 9.0, 9.3),
        j('GK. Lan', true, 6.0, 5.5, 6.5, 6.0, 6.0),
        j('GK. Huy', true, 8.0, 8.0, 8.5, 8.0, 8.1),
      ],
    },
    {
      team: { id: 'greentrace', name: 'GreenTrace' },
      assignedCount: 3,
      violation: { flagged: true, reason: 'Nghi ngờ sao chép mã nguồn từ dự án công khai' },
      perJudge: [
        j('GK. Minh', true, 7.8, 7.9, 7.7, 7.8, 7.8),
        j('GK. Lan', true, 7.5, 7.5, 7.5, 7.5, 7.5),
        j('GK. Huy', true, 7.3, 7.2, 7.4, 7.3, 7.3),
      ],
    },
    {
      team: { id: 'skyroute', name: 'SkyRoute' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 8.0, 8.0, 7.9, 8.1, 8.0),
        j('GK. Lan', true, 7.9, 7.9, 8.0, 7.9, 7.9),
        j('GK. Huy', false, null, null, null, null, null),
      ],
    },
    {
      team: { id: 'byteforge', name: 'ByteForge' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', false, null, null, null, null, null),
        j('GK. Lan', false, null, null, null, null, null),
        j('GK. Huy', false, null, null, null, null, null),
      ],
    },
    {
      team: { id: 'oldguard', name: 'OldGuard' },
      assignedCount: 3,
      ended: 'withdrawn',
      perJudge: [
        j('GK. Minh', false, null, null, null, null, null),
        j('GK. Lan', false, null, null, null, null, null),
        j('GK. Huy', false, null, null, null, null, null),
      ],
    },
    {
      team: { id: 'rulebreaker', name: 'RuleBreaker' },
      assignedCount: 3,
      ended: 'eliminated',
      perJudge: [
        j('GK. Minh', true, 6.8, 6.9, 6.7, 6.8, 6.8),
        j('GK. Lan', true, 7.0, 6.8, 6.9, 7.0, 6.9),
        j('GK. Huy', true, 6.5, 6.6, 6.4, 6.5, 6.5),
      ],
    },
  ],
}

// -- Vong chung ket (dang o giai doan 2: giam khao ra soat) --
const FINAL = {
  updatedAt: '2026-07-25T02:05:00+07:00',
  review: { durationMin: 30, remainingSec: 45, pendingRequests: 1, judgesAgreed: 2, judgesTotal: 3 },
  judges: [
    { id: 'j1', name: 'GK. Minh', assigned: 6, scored: 6, lastUpdate: '2026-07-25T01:10:00+07:00' },
    { id: 'j2', name: 'GK. Lan', assigned: 6, scored: 6, lastUpdate: '2026-07-25T01:25:00+07:00' },
    { id: 'j3', name: 'GK. Huy', assigned: 6, scored: 6, lastUpdate: '2026-07-25T01:05:00+07:00' },
  ],
  entries: [
    {
      team: { id: 'ledgerlink', name: 'LedgerLink' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 9.2, 9.1, 9.0, 9.1, 9.1),
        j('GK. Lan', true, 9.0, 9.1, 9.2, 9.1, 9.1),
        j('GK. Huy', true, 9.1, 9.1, 9.1, 9.1, 9.1),
      ],
    },
    {
      team: { id: 'neopay', name: 'NeoPay' },
      assignedCount: 4,
      perJudge: [
        j('GK. Tuấn', true, 8, 9, 8, 7, 8.1),
        j('GK. Lan', true, 9, 8, 8, 8, 8.4),
        j('GK. Khoa', true, 7, 7, 8, 7, 7.3),
        j('GK. Thảo', false, null, null, null, null, null),
      ],
    },
    {
      team: { id: 'quantumleap', name: 'QuantumLeap' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 8.4, 8.4, 8.4, 8.4, 8.4),
        j('GK. Lan', true, 8.3, 8.4, 8.5, 8.4, 8.4),
        j('GK. Huy', true, 8.4, 8.4, 8.4, 8.4, 8.4),
      ],
    },
    {
      team: { id: 'dataforge', name: 'DataForge' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 8.0, 8.0, 8.0, 8.0, 8.0),
        j('GK. Lan', true, 7.9, 8.0, 8.1, 8.0, 8.0),
        j('GK. Huy', true, 8.0, 8.0, 8.0, 8.0, 8.0),
      ],
    },
    {
      team: { id: 'greentrace', name: 'GreenTrace' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 7.6, 7.6, 7.6, 7.6, 7.6),
        j('GK. Lan', true, 7.5, 7.6, 7.7, 7.6, 7.6),
        j('GK. Huy', true, 7.6, 7.6, 7.6, 7.6, 7.6),
      ],
    },
    {
      team: { id: 'skyroute', name: 'SkyRoute' },
      assignedCount: 3,
      perJudge: [
        j('GK. Minh', true, 7.2, 7.2, 7.2, 7.2, 7.2),
        j('GK. Lan', true, 7.1, 7.2, 7.3, 7.2, 7.2),
        j('GK. Huy', true, 7.2, 7.2, 7.2, 7.2, 7.2),
      ],
    },
  ],
  awards: {
    main: [
      { key: 'first', team: { id: 'ledgerlink', name: 'LedgerLink' }, score: 9.1 },
      { key: 'second', team: { id: 'neopay', name: 'NeoPay' }, score: 8.7 },
      { key: 'third', team: { id: 'quantumleap', name: 'QuantumLeap' }, score: 8.4 },
    ],
    extended: [
      { id: 'x1', label: 'Giải Yêu thích nhất', team: { id: 'dataforge', name: 'DataForge' } },
      { id: 'x2', label: 'Giải Đổi mới sáng tạo', team: null },
      { id: 'x3', label: 'Giải Kỹ thuật xuất sắc', team: { id: 'skyroute', name: 'SkyRoute' } },
    ],
  },
}

export const DATA = { soloai: SOLOAI, doidau: DOIDAU, semifinal: SEMIFINAL, final: FINAL }
