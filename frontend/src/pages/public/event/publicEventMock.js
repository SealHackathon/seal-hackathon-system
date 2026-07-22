// Dữ liệu mẫu mô phỏng chính xác payload từ Backend trả về cho một event.

export const API_EVENT_MOCK = {
  eventId: 'seal-2026',
  eventName: 'SEAL Hackathon Summer 2026',
  eventTopic: 'FinTech for Everyone',
  description: 'Sân chơi dành cho sinh viên CNTT xây dựng sản phẩm số hướng người dùng, đi từ ý tưởng đến trải nghiệm thực tế và khả năng thương mại hóa.',
  descriptionDetails: '<p>SEAL Hackathon Summer 2026 là sự kiện thứ ba trong hệ thống <strong>SEAL – Software Engineering Agile League</strong>, tiếp nối thành công của <em>SEAL Fall 2025</em> và <em>SEAL Spring 2026</em>. Đây là sân chơi học thuật dành cho sinh viên ngành Công nghệ thông tin đang theo học tại <strong>Trường Đại học FPT cơ sở TP.HCM</strong> và các trường đại học khác trên địa bàn thành phố.</p><p>Đúng với định hướng <strong>"Summer SEAL – Emerging Technologies"</strong>, mùa giải năm nay tập trung vào ba công nghệ mới nổi: <strong>Trí tuệ nhân tạo (AI)</strong>, <strong>Internet vạn vật (IoT)</strong> và <strong>Blockchain</strong>.</p><p>Thí sinh sẽ được thử thách xây dựng sản phẩm ứng dụng một hoặc kết hợp các công nghệ này để giải quyết bài toán thực tế, đồng thời rèn luyện kỹ năng làm việc nhóm, tư duy sản phẩm và khả năng thuyết trình chuyên nghiệp.</p>',
  openRegisterTime: '2026-06-01T00:00:00',
  closeRegisterTime: '2026-06-30T23:59:59',
  cofirmTeamTime: '2026-07-20T23:59:59',
  minTeamMember: 3,
  maxTeamMember: 5,
  eventRules: `
    <p>Mỗi đội thi từ <strong>3–5 thành viên</strong>, thực hiện code và xây dựng sản phẩm trong thời gian quy định của từng vòng thi.</p>
    <p>Đội thi phải lưu trữ mã nguồn và kết quả trên các nền tảng cloud chuyên dụng: <strong>GitHub, Jira, Confluence, Notion</strong> hoặc tương đương <em>(không chấp nhận Google Drive hoặc dịch vụ cá nhân)</em>.</p>
    <p>Sản phẩm dự thi được trình bày dưới dạng slide kèm demo trực tiếp hoặc video.</p>
    <p>Các đội chỉ được sử dụng AI Agent framework do Ban tổ chức cho phép:</p>
    <ul>
      <li>LangGraph</li>
      <li>OpenAI SDK</li>
      <li>Google Gemini SDK</li>
      <li>LlamaIndex</li>
    </ul>
    <p>hoặc mở rộng sang <strong>CrewAI, AutoGen, HuggingFace Agents</strong> nếu thể hiện được tính sáng tạo phù hợp với track đã chọn.</p>
  `,
  notes: [
    { id: 1, title: 'Tư cách tham gia', detail: 'Sinh viên còn thời hạn đào tạo, không trong thời gian đình chỉ học.' },
    { id: 2, title: 'Sản phẩm dự thi', detail: 'Không vi phạm bản quyền, không sử dụng lại sản phẩm đã đạt giải ở cuộc thi khác.' },
    { id: 3, title: 'Đạo đức thi đấu', detail: 'Nghiêm cấm gian lận, sao chép mã nguồn của đội khác dưới mọi hình thức.' },
    { id: 4, title: 'Quyền sở hữu', detail: 'Đội thi giữ quyền sở hữu sản phẩm; ban tổ chức được phép sử dụng hình ảnh để truyền thông.' },
  ],
  prizes: [
    { prizeId: 1, type: 'main', rank: 1, name: 'Giải Nhất', amount: 1, prizeValue: 7000000, description: 'Giấy chứng nhận, Cúp, Suất thực tập' },
    { prizeId: 2, type: 'main', rank: 2, name: 'Giải Nhì', amount: 1, prizeValue: 5000000, description: 'Giấy chứng nhận, Cúp' },
    { prizeId: 3, type: 'main', rank: 3, name: 'Giải Ba', amount: 1, prizeValue: 3000000, description: 'Giấy chứng nhận, Cúp' },
    { prizeId: 4, type: 'main', rank: null, name: 'Giải Khuyến khích', amount: 2, prizeValue: 1000000, description: 'Giấy chứng nhận' },
    { prizeId: 5, type: 'extended', rank: null, name: 'Giải Sáng tạo', amount: 1, prizeValue: 1000000, description: 'Giấy chứng nhận' },
    { prizeId: 6, type: 'extended', rank: null, name: 'Giải Triển vọng', amount: 1, prizeValue: 1000000, description: 'Giấy chứng nhận' },
    { prizeId: 7, type: 'extended', rank: null, name: 'Cá nhân xuất sắc', amount: 3, prizeValue: 500000, description: 'Giấy chứng nhận' },
  ],
  rounds: [
    {
      roundId: 'so-loai',
      roundName: 'Vòng Sơ loại',
      timeStart: '2026-11-08T07:00:00',
      timeEnd: '2026-11-08T18:00:00',
      format: 'online',
      meetingLink: 'https://meet.google.com/seal-sokhao',
      topTeamPass: 10,
      submissionType: 'new',
      submissionConfig: {
        openingTime: '2026-11-08T07:00:00',
        submissionDeadline: '2026-11-08T17:00:00',
        submissionInstructions: '',
      },
      timelines: [
        { timelineName: 'Check-in & ổn định chỗ ngồi', timeStart: '2026-11-08T07:00:00', description: 'Thí sinh check-in, kiểm tra internet và vị trí ngồi theo track' },
        { timelineName: 'Nhận đề bài & bắt đầu xây dựng sản phẩm', timeStart: '2026-11-08T07:30:00', description: 'BTC công bố đề bài chi tiết theo từng track, các đội bắt đầu nghiên cứu và thiết kế' },
        { timelineName: 'Đóng cổng nộp bài', timeStart: '2026-11-08T13:00:00', description: 'Các đội hoàn tất nộp sản phẩm dự thi' },
        { timelineName: 'Pitching & chấm điểm sơ loại', timeStart: '2026-11-08T13:15:00', description: 'Mỗi đội pitch sản phẩm trước giám khảo theo bảng thi đấu tương ứng' },
      ],
      details: `
<h4>a. Đề bài:</h4>
<p><strong>Bối cảnh:</strong> Người dùng trẻ tại các đô thị lớn ngày càng cần những sản phẩm số giúp giải quyết các vấn đề trong học tập, công việc và cuộc sống hằng ngày một cách thuận tiện và cá nhân hóa hơn.</p>
<p><strong>Yêu cầu chung:</strong> Mỗi đội xây dựng một sản phẩm số (web hoặc mobile) giải quyết một vấn đề thực tế của nhóm người dùng mục tiêu do đội lựa chọn, với trọng tâm là trải nghiệm người dùng và tiềm năng thương mại hóa.</p>
<p><strong>Yêu cầu bắt buộc:</strong></p>
<ul>
  <li>Nêu rõ vấn đề và chân dung nhóm người dùng mục tiêu</li>
  <li>Có prototype thể hiện được luồng sử dụng chính và hoạt động được</li>
  <li>Giao diện trực quan, dễ sử dụng, bám sát nhu cầu người dùng</li>
</ul>
<p><strong>Yêu cầu khuyến khích:</strong></p>
<ul>
  <li>Có mô hình kinh doanh / chiến lược thương mại hóa sản phẩm</li>
  <li>Có minh chứng nghiên cứu người dùng và kiểm thử khả dụng (usability testing)</li>
  <li>Sản phẩm có điểm sáng tạo, khác biệt so với các giải pháp hiện có</li>
</ul>

<h4>b. Các thành phần cần nộp:</h4>
<ul>
  <li><strong>Link prototype</strong> – bản demo chạy được trên Figma hoặc sản phẩm web/mobile thực tế, truy cập được qua link công khai.</li>
  <li><strong>Slide pitch (PDF hoặc PPT)</strong> – trình bày vấn đề, giải pháp, đối tượng người dùng và cách sản phẩm giải quyết đề bài.</li>
  <li><strong>Video demo sản phẩm</strong> – thời lượng không quá 3 phút, thể hiện luồng sử dụng chính của sản phẩm.</li>
  <li><strong>Tài liệu mô tả</strong> cách sản phẩm đáp ứng đề bài (tối đa 1 trang) – nêu rõ đội đã xử lý các yêu cầu must-have / nice-to-have ra sao.</li>
</ul>

<h4>c. Cách thức & quy định nộp bài:</h4>
<ul>
  <li>Toàn bộ thành phần được nộp qua form trên hệ thống SEAL trước deadline (08/11/2026, 13:00). Hệ thống sẽ tự động đóng khi hết giờ.</li>
  <li>Đặt tên file theo cú pháp: <strong>[Tên đội]_[Track]_[Loại tài liệu]</strong>.</li>
  <li>Đảm bảo mọi đường link (Figma, video, repo) ở chế độ công khai / cho phép xem; BTC không chịu trách nhiệm với các link lỗi quyền truy cập.</li>
  <li>Chỉ lần nộp cuối cùng trước deadline được ghi nhận để chấm điểm.</li>
</ul>
<p>Tất cả các thành phần trên được nộp qua form trên hệ thống SEAL trước deadline quy định.</p>
      `
    },
    {
      roundId: 'chung-ket',
      roundName: 'Vòng Chung kết',
      timeStart: '2026-11-15T08:00:00',
      timeEnd: '2026-11-15T17:00:00',
      format: 'offline',
      locationName: 'Hội trường A, Tòa nhà Innovation',
      location: { lat: 10.8412, lng: 106.8098, name: 'FPT University TP.HCM', address: 'Đường D1, Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh' },
      position: 'FPT University TP.HCM',
      submissionType: 'previous',
      timelines: [
        { timelineName: 'Khai mạc vòng Chung kết', timeStart: '2026-11-15T08:00:00', description: 'BTC giới thiệu 6 đội xuất sắc nhất vào chung kết' },
        { timelineName: 'Pitching các đội chung kết', timeStart: '2026-11-15T08:30:00', description: 'Mỗi đội trình bày sản phẩm, chiến lược kinh doanh và trả lời câu hỏi từ ban giám khảo' },
        { timelineName: 'Ban giám khảo thảo luận', timeStart: '2026-11-15T13:00:00', description: 'Hội đồng giám khảo tổng hợp điểm và thống nhất kết quả' },
        { timelineName: 'Lễ bế mạc & trao giải', timeStart: '2026-11-15T16:00:00', description: 'Công bố kết quả và trao giải cho các đội đạt giải' },
      ],
      details: ''
    }
  ],
  tracks: [
    { trackId: 'web', trackName: 'Bảng Web', description: 'Ứng dụng web fintech: ngân hàng số, ví điện tử, quản lý tài chính.', maxTeamPerTrack: 20 },
    { trackId: 'mobile', trackName: 'Bảng Mobile', description: 'Ứng dụng di động cho thanh toán và đầu tư cá nhân.', maxTeamPerTrack: 15 },
    { trackId: 'ai', trackName: 'Bảng AI', description: 'Giải pháp AI cho phân tích rủi ro, chấm điểm tín dụng, tư vấn tài chính.', maxTeamPerTrack: 10 },
  ],
  milestones: [
    { milestoneName: 'Workshop định hướng', timeStart: '2026-06-15T00:00:00', milestoneDes: 'Buổi chia sẻ về sản phẩm fintech cùng chuyên gia.', link: 'https://meet.google.com/workshop' },
  ],
  mentors: [
    { mentorId: 1, receiver: { fullName: 'ThS. Nguyễn Minh An', position: 'Giảng viên Hệ thống thông tin', orgName: 'FPT University', avatarUrl: '' }, trackId: 'web' },
    { mentorId: 2, receiver: { fullName: 'ThS. Trần Thu Hà', position: 'Giảng viên Kỹ thuật phần mềm', orgName: 'FPT University', avatarUrl: '' }, trackId: 'mobile' },
    { mentorId: 3, receiver: { fullName: 'TS. Lê Quốc Bảo', position: 'Trưởng bộ môn Trí tuệ nhân tạo', orgName: 'FPT University', avatarUrl: '' }, trackId: 'ai' },
    { mentorId: 4, receiver: { fullName: 'ThS. Phạm Gia Hân', position: 'Giảng viên Thiết kế đồ họa', orgName: 'FPT University', avatarUrl: '' }, trackId: 'web' },
  ],
  judges: [
    { judgeId: 1, receiver: { fullName: 'TS. Đỗ Văn Cường', position: 'Giảng viên CNTT', orgName: 'FPT University', avatarUrl: '' }, roundIds: [{id: 'so-khao'}] },
    { judgeId: 2, receiver: { fullName: 'PGS.TS Vũ Hải Đăng', position: 'Trưởng khoa CNTT', orgName: 'Đại học Quốc gia', avatarUrl: '' }, roundIds: [{id: 'chung-ket'}] },
    { judgeId: 3, receiver: { fullName: 'TS. Ngô Bảo Châu', position: 'Giám đốc chương trình', orgName: 'FPT University', avatarUrl: '' }, roundIds: [{id: 'chung-ket'}] },
  ]
}
