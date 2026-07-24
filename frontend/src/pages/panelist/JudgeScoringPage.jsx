import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StickyHeader from '../../components/shared/StickyHeader';
import ResizableSplit from '../../components/shared/ResizableSplit';
import ScoringTeamHero from '../../components/panelist/scoring/ScoringTeamHero';
import SubmissionPanel from '../../components/panelist/scoring/SubmissionPanel';
import ScoringPanel from '../../components/panelist/scoring/ScoringPanel';
import ScoringCriteriaModal from '../../components/panelist/event/judgeRoundDetail/ScoringCriteriaModal';
import ReportViolationModal from '../../components/panelist/scoring/ReportViolationModal';
import RequestEditModal from '../../components/panelist/scoring/RequestEditModal';
import styles from './JudgeScoringPage.module.css';
import axiosClient from '../../api/axiosClient';

// TẮT/BẬT MOCK DATA ĐỂ TEST GIAO DIỆN MÀ KHÔNG CẦN BACKEND
const USE_MOCK_DATA = true;

function JudgeScoringPage() {
  const { eventId, roundId, submissionId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditModeParam = searchParams.get('editMode') === 'true';

  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isRequestEditModalOpen, setIsRequestEditModalOpen] = useState(false);
  const [isReScoringMode, setIsReScoringMode] = useState(isEditModeParam);
  const [pendingReScorePayload, setPendingReScorePayload] = useState(null);
  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [existing, setExisting] = useState(null);

// const mockSubmission = {
//   github: {
//     url: 'https://github.com/react/react',
//   },
//   slide: { url: 'https://drive.google.com/file/d/1wJVDgrYoYjIfSaWGFcT_B9s3GyAMOGxm/view?usp=sharing', fileUrl: null },
//   video: { url: 'https://www.youtube.com/', fileUrl: null },
// }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dynamicBackLink = `/panelist/events/${eventId}/judge/rounds/${roundId}`;

  useEffect(() => {
    async function fetchScoringData() {
      try {
        setLoading(true);
        setError(null);

        let subListData, roundsList;

        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 500));
          subListData = {
            teamName: "FPT.O-H",
            roundName: "Vòng chung kết",
            scoringStatus: "SUBMITTED",
            scoredAt: '2026-07-22T08:30:00Z',
            scores: { 1: 3.5, 2: 4.0 },
            notes: { 1: 'Tốt', 2: 'Khá' },
            overallComment: 'Dự án tiềm năng nhưng cần cải thiện UI.',
            isViolation: false,
            discrepantCriteriaIds: [2],
            githubUrl: 'https://github.com/mock',
            documentUrl: 'https://docs.google.com',
            demoUrl: 'https://youtube.com',
            members: [{ id: 1, fullName: 'Nguyễn Văn A', roleInTeam: 'LEADER', leader: true }]
          };
          roundsList = {
            roundName: 'Vòng chung kết',
            criteria: [{ id: 1, name: 'Sáng tạo', description: 'Độ sáng tạo', weight: 50 }, { id: 2, name: 'Kỹ thuật', description: 'Độ phức tạp', weight: 50 }]
          };
        } else {
          //  1. GỌI SONG SONG 2 API: Chi tiết bài nộp và Danh sách vòng thi của Sự kiện
          const [submissionRes, eventRoundsRes] = await Promise.all([
            axiosClient.get(`submission/${submissionId}`),
            axiosClient.get(`/round/rounds/${roundId}`)
          ]);
          subListData = submissionRes.data;
          roundsList = eventRoundsRes.data;
        }

        //  Xử lý lấy phần tử nếu API bài nộp trả về dạng mảng (Phòng thủ dữ liệu)
        const subData = Array.isArray(subListData) ? subListData[0] : subListData;

        if (!subData) {
          throw new Error('Không tìm thấy thông tin bài nộp của đội thi này.');
        }

        //  Phòng thủ lỗi "find is not a function": Kiểm tra cấu trúc roundsList trả về
        let currentRoundData = null;
        if (Array.isArray(roundsList)) {
          currentRoundData = roundsList.find(r => String(r.roundId) === String(roundId));
        } else if (roundsList && String(roundsList.roundId) === String(roundId)) {
          currentRoundData = roundsList;
        } else {
          currentRoundData = roundsList; // Fallback gán thẳng nếu API chỉ trả về duy nhất 1 vòng hiện tại
        }

        if (!currentRoundData) {
          throw new Error('Không tìm thấy cấu hình tiêu chí cho vòng thi này.');
        }

        // 2. MAPPING THÔNG TIN ĐỘI THI & DANH SÁCH THÀNH VIÊN (Khớp chuẩn dữ liệu thật)
        setTeam({
          name: subData.teamName || 'SEAL INNOVATORS',
          // Đổi trạng thái UI thành 'done' nếu backend báo đã SUBMITTED
          status: subData.scoringStatus?.toLowerCase() === 'submitted' ? 'done' : (subData.scoringStatus?.toLowerCase() || 'unscored'),
          category: subData.roundName || currentRoundData.roundName || 'Vòng sơ loại',
          code: `SEAL-A${String(subData.teamId || 1).padStart(2, '0')}`, // Ví dụ: SEAL-A01
          submittedAt: subData.submittedAt,
          flaggedViolation: subData.isViolation || false,

          // Map mảng thành viên thực tế từ API sang cấu trúc hiển thị của Component Hero
          members: subData.members?.map(m => ({
            id: String(m.id),
            name: m.fullName,
            position: m.roleInTeam === 'LEADER' ? 'Đội trưởng / Leader' : 'Thành viên',
            isLeader: m.leader // Sử dụng thuộc tính "leader": true/false từ JSON thực tế
          })) || []
        });

        //  3. MAPPING CÁC ĐƯỜNG LINK NỘP BÀI (Đổ trực tiếp vào ô xem nội dung bên trái)
        setSubmission({
          github: { url: subData.githubUrl || '' },
          slide: { url: subData.documentUrl || '', fileUrl: null }, // Đưa tài liệu vào khung Slide/Tài liệu
          video: { url: subData.demoUrl || '', fileUrl: null }       // Link video / demo sản phẩm
        });

        //  4. MAPPING CRITERIA (Đổ tiêu chí gốc từ cấu hình vòng thi vào bảng chấm điểm bên phải)
        if (currentRoundData.criteria) {
          setRubric({
            name: currentRoundData.roundName || 'Tiêu chí chấm thi',
            criteria: currentRoundData.criteria.map(c => ({
              id: String(c.id),
              name: c.name,
              description: c.description,
              points: 10,                 // Hệ điểm tối đa 10 cho thanh kéo điểm (Slider) tương thích cấu hình maxRange=10
              percent: c.weight           // Trọng số tiêu chí (Ví dụ: 30, 40)
            }))
          });
        }

        //  5. KHÔI PHỤC ĐIỂM CŨ VÀ KHÓA CHỈNH SỬA (Nếu bài đã chấm hoặc lưu nháp)
        if (subData.scoringStatus && subData.scoringStatus !== 'UNSCORED') {
          setExisting({
            scores: subData.scores || {}, // Tự động map Object { "1": 3.6, "2": 4.1, "3": 3.7 } vào UI thanh kéo
            notes: subData.notes || {},   // Nhận xét chi tiết của từng tiêu chí
            overall: subData.overallComment || '', // Nhận xét tổng quan toàn bài
            audit: {
              savedAt: subData.scoredAt,
              submittedAt: subData.scoringStatus === 'SUBMITTED' ? subData.scoredAt : null
            },
            hasDiscrepancy: false,
            discrepantCriteriaIds: subData.discrepantCriteriaIds || []
          });
        } else {
          // Fallback object trống an toàn phòng thủ lỗi undefined properties ở ScoringPanel khi đội thi chưa được chấm
          setExisting({
            scores: {},
            notes: {},
            overall: '',
            audit: { savedAt: null, submittedAt: null },
            hasDiscrepancy: false,
            discrepantCriteriaIds: []
          });
        }

      } catch (err) {
        console.error('Error binding data inside JudgeScoringPage:', err);
        setError(err.response?.data?.message || err.message || 'Lỗi đồng bộ dữ liệu chấm thi.');
      } finally {
        setLoading(false);
      }
    }

    // Khởi chạy useEffect khi có đủ 3 tham số định tuyến động trên URL thanh địa chỉ
    if (submissionId && roundId && eventId) {
      fetchScoringData();
    }
  }, [submissionId, roundId, eventId]);



  //  1. XỬ LÝ LƯU NHÁP (status: 'DRAFT')
  const handleSaveDraft = async (scoringPanelPayload) => {
    try {
      const backendPayload = {
        submissionId: Number(submissionId),
        comment: scoringPanelPayload.overall || "",
        status: "DRAFT", //  Đánh dấu đây là bản nháp
        details: Object.keys(scoringPanelPayload.scores || {}).map((criterionId) => ({
          criterionId: Number(criterionId),
          score: Number(scoringPanelPayload.scores[criterionId]),
          comment: scoringPanelPayload.notes?.[criterionId] || ""
        }))
      };

      await axiosClient.post('/judge-scores', backendPayload);
      setTeam(prev => ({ ...prev, status: 'draft' })); // Đổi trạng thái UI thành nháp
      alert("Đã lưu bản nháp thành công!");
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu bản nháp thất bại.');
    }
  };

  //  2. XỬ LÝ NỘP ĐIỂM CHÍNH THỨC (status: 'SUBMITTED' hoặc 'DONE')
  const handleSubmit = async (scoringPanelPayload) => {
    if (isReScoringMode) {
      setPendingReScorePayload(scoringPanelPayload);
      setIsRequestEditModalOpen(true);
      return;
    }

    try {
      if (window.confirm('Bạn có chắc chắn muốn nộp điểm số này? Điểm sau khi nộp sẽ không thể tự chỉnh sửa.')) {

        const backendPayload = {
          submissionId: Number(submissionId),
          comment: scoringPanelPayload.overall || "",
          status: "SUBMITTED", //  Đánh dấu nộp chính thức để khóa chỉnh sửa
          details: Object.keys(scoringPanelPayload.scores || {}).map((criterionId) => ({
            criterionId: Number(criterionId),
            score: Number(scoringPanelPayload.scores[criterionId]),
            comment: scoringPanelPayload.notes?.[criterionId] || ""
          }))
        };

        if (!backendPayload.details || backendPayload.details.length < rubric.criteria.length) {
          alert("Vui lòng nhập đầy đủ điểm cho các tiêu chí trước khi nộp.");
          return;
        }

        await axiosClient.post('/judge-scores', backendPayload);
        setTeam(prev => ({ ...prev, status: 'done' }));
        alert("Nộp điểm chấm thi thành công!");
        navigate(dynamicBackLink);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Nộp điểm chấm thi thất bại.');
    }
  };

  const handleSubmitRequestEdit = async (reason) => {
    try {
      const backendPayload = {
        submissionId: Number(submissionId),
        comment: pendingReScorePayload?.overall || "",
        status: "SUBMITTED",
        details: Object.keys(pendingReScorePayload?.scores || {})
          .filter(criterionId => (existing.discrepantCriteriaIds || []).includes(Number(criterionId)))
          .map((criterionId) => ({
            criterionId: Number(criterionId),
            score: Number(pendingReScorePayload?.scores[criterionId]),
            comment: pendingReScorePayload?.notes?.[criterionId] || ""
          })),
        reason: reason
      };

      await axiosClient.post(`/api/v1/panelist/submissions/${submissionId}/request-edit`, backendPayload);
      alert('Yêu cầu đã được gửi thành công, vui lòng chờ BTC duyệt.');
      setIsRequestEditModalOpen(false);
      setIsReScoringMode(false);
      setPendingReScorePayload(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi yêu cầu mở khóa.');
    }
  };

  const handleToggleViolation = async (nextState) => {
    if (nextState) {
      // Mở modal khi muốn báo cáo vi phạm
      setIsViolationModalOpen(true);
    } else {
      // Hủy báo cáo vi phạm
      try {
        await axiosClient.put(`/submission/${submissionId}/violation`, { isViolation: false, reason: '' });
        setTeam(prev => ({ ...prev, flaggedViolation: false }));
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể cập nhật trạng thái vi phạm.');
      }
    }
  };

  const handleSubmitViolation = async (reason) => {
    try {
      await axiosClient.put(`/submission/${submissionId}/violation`, { isViolation: true, reason });
      setTeam(prev => ({ ...prev, flaggedViolation: true }));
      setIsViolationModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái vi phạm.');
    }
  };

  const handleOpenRubric = () => {
    console.log('Xem thông tin cẩm nang chấm thi');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <StickyHeader title="Đang tải dữ liệu bài nộp..." backLink={dynamicBackLink} />
        <div className={styles.centerWrap}><p>Đang đồng bộ bài nộp và tiêu chí chấm từ vòng thi...</p></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={styles.page}>
        <StickyHeader title="Lỗi tải dữ liệu" backLink={dynamicBackLink} />
        <div className={styles.centerWrap}><p className={styles.errTxt}>{error || 'Bài nộp không tồn tại.'}</p></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <StickyHeader
        title={`Chấm điểm · ${team.name}`}
        backLink={dynamicBackLink}
        backTooltip="Quay lại danh sách đội cần chấm"
      />

      <div className={styles.body}>
        <ScoringTeamHero team={team} onToggleViolation={handleToggleViolation} />

        <ResizableSplit
          storageKey="judgeScoringSplit"
          min={40}
          max={60}
          initialLeft={54}
          left={<SubmissionPanel submission={submission} />}
          right={
            <ScoringPanel
              rubric={rubric}
              criteria={rubric.criteria}
              status={team.status}
              existing={existing}
              onOpenRubric={() => setIsCriteriaModalOpen(true)}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              isReScoringMode={isReScoringMode}
            />
          }
        />
      </div>

      <ScoringCriteriaModal 
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        criteria={rubric?.criteria}
      />

      <ReportViolationModal
        isOpen={isViolationModalOpen}
        onClose={() => setIsViolationModalOpen(false)}
        onSubmit={handleSubmitViolation}
        teamName={team?.name || ''}
      />

      <RequestEditModal
        isOpen={isRequestEditModalOpen}
        onClose={() => setIsRequestEditModalOpen(false)}
        onSubmit={handleSubmitRequestEdit}
        teamName={team?.name || ''}
      />
    </div>
  );
}

export default JudgeScoringPage;