export const MOCK_ROUNDS = [
  {
    id: 1,
    name: 'Vòng 1: Đăng ký & Nộp Ý tưởng',
    dateRange: '01/06 - 10/06/2026',
    status: 'DONE',
    submissionStatus: 'SUBMITTED_ON_TIME',
    message: {
      type: 'success',
      title: 'Vượt qua Vòng 1',
      content: 'Ban giám khảo đánh giá cao ý tưởng của đội. Hãy chuẩn bị thật tốt cho vòng tiếp theo nhé!'
    }
  },
  {
    id: 2,
    name: 'Vòng 2: Phát triển MVP',
    dateRange: '11/06 - 25/06/2026',
    status: 'DONE',
    submissionStatus: 'SUBMITTED_ON_TIME',
    message: {
      type: 'success',
      title: 'Hoàn thành xuất sắc',
      content: 'Sản phẩm có tiềm năng rất tốt. Đội được đi tiếp vào vòng trong.'
    }
  },
  {
    id: 3,
    name: 'Vòng 3: Hoàn thiện Sản phẩm',
    dateRange: '26/06 - 05/07/2026',
    status: 'LATE',
    submissionDeadline: '07/07/2026, 23:59',
    submissionStatus: 'LATE_NO_SUBMISSION',
    message: {
      type: 'warning',
      title: 'Đã quá hạn nộp chính thức',
      content: 'Bài nộp trong thời gian này sẽ bị trừ điểm theo quy định của ban tổ chức.'
    }
  },
  {
    id: 4,
    name: 'Vòng 4: Bổ sung Tài liệu & Demo',
    dateRange: '11/07 - 15/07/2026',
    status: 'UPCOMING',
    submissionStatus: 'NOT_OPEN',
    message: null
  },
  {
    id: 5,
    name: 'Vòng 5: Thuyết trình Bán kết',
    dateRange: '18/07 - 20/07/2026',
    status: 'UPCOMING',
    submissionStatus: 'READY',
    message: {
      type: 'info',
      title: 'Sử dụng lại bài nộp từ vòng trước',
      content: 'Ban giám khảo sẽ chấm điểm dựa trên mã nguồn và tài liệu đội đã nộp tại Vòng 4. Đội không cần nộp thêm tài liệu trên hệ thống.'
    },
    referenceRound: 4
  },
  {
    id: 6,
    name: 'Vòng 6: Chung kết toàn quốc',
    dateRange: '25/07 - 30/07/2026',
    status: 'UPCOMING',
    submissionStatus: 'NOT_OPEN',
    message: null
  }
];

export const MOCK_PROGRESS = {
  currentRoundIndex: 3, // Vòng 3
  totalRounds: 6,
  percentage: 50,
  currentRoundName: 'Vòng 3: Hoàn thiện Sản phẩm',
  rank: '5',
  totalTeams: '24',
  score: '8.85',
  maxScore: '10',
  groupName: 'Tech Innovators'
};
