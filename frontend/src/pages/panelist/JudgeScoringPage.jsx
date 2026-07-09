import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StickyHeader from '../../components/shared/StickyHeader';
import ResizableSplit from '../../components/shared/ResizableSplit';
import ScoringTeamHero from '../../components/panelist/scoring/ScoringTeamHero';
import SubmissionPanel from '../../components/panelist/scoring/SubmissionPanel';
import ScoringPanel from '../../components/panelist/scoring/ScoringPanel';
import styles from './JudgeScoringPage.module.css';
import axiosClient from '../../api/axiosClient';

function JudgeScoringPage() {
  const { eventId, roundId, submissionId } = useParams();
  const navigate = useNavigate();

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

        // 🎯 1. GỌI SONG SONG 2 API: Chi tiết bài nộp và Danh sách vòng thi của Sự kiện
        const [submissionRes, eventRoundsRes] = await Promise.all([
          axiosClient.get(`submission/${submissionId}`),
          axiosClient.get(`/round/rounds/${roundId}`)
        ]);

        const subListData = submissionRes.data;
        const roundsList = eventRoundsRes.data;

        // 🛠️ Xử lý lấy phần tử nếu API bài nộp trả về dạng mảng
        const subData = Array.isArray(subListData) ? subListData[0] : subListData;

        if (!subData) {
          throw new Error('Không tìm thấy thông tin bài nộp của đội thi này.');
        }

        // 🛠️ Phòng thủ lỗi "find is not a function": Kiểm tra nếu roundsList là mảng hoặc object đơn lẻ
        let currentRoundData = null;
        if (Array.isArray(roundsList)) {
          currentRoundData = roundsList.find(r => String(r.roundId) === String(roundId));
        } else if (roundsList && String(roundsList.roundId) === String(roundId)) {
          currentRoundData = roundsList;
        } else {
          currentRoundData = roundsList; // Fallback gán thẳng nếu API trả về duy nhất 1 vòng hiện tại
        }

        if (!currentRoundData) {
          throw new Error('Không tìm thấy cấu hình tiêu chí cho vòng thi này.');
        }

        // 🎯 2. MAPPING THÔNG TIN ĐỘI THI (Khớp chuẩn dữ liệu thật)
        setTeam({
          name: subData.teamName,
          status: subData.scoringStatus?.toLowerCase() || 'unscored',
          category: subData.roundName,
          code: `TEAM-${subData.teamId}`,
          submittedAt: subData.submittedAt,
          flaggedViolation: false,

          members: subData.members.map(member => ({
            id: String(member.id),
            name: member.fullName,
            position: member.roleInTeam,
            isLeader: member.leader
          }))
        });

        // 🎯 3. MAPPING CÁC ĐƯỜNG LINK NỘP BÀI THỰC TẾ (Đổ trực tiếp vào ô xem nội dung bên trái)
        setSubmission({
          github: { url: subData.githubUrl || '' },
          slide: { url: subData.documentUrl || '', fileUrl: null }, // Đưa tài liệu vào khung Slide
          video: { url: subData.demoUrl || '', fileUrl: null }       // Link video / demo sản phẩm
        });

        // 🎯 4. MAPPING CRITERIA (Đổ vào bảng chấm điểm bên phải)
        if (currentRoundData.criteria) {
          setRubric({
            name: currentRoundData.roundName || 'Tiêu chí chấm thi',
            criteria: currentRoundData.criteria.map(c => ({
              id: String(c.id),
              name: c.name,
              description: c.description,
              points: 10,                 // Hệ điểm tối đa mặc định cho UI kéo thanh điểm
              percent: c.weight           // Backend trả về thẳng 30.0, 40.0 -> Khớp luôn hiển thị %
            }))
          });
        }

        // 🎯 5. MAPPING ĐIỂM SỐ ĐÃ CHẤM (Nếu có điểm cũ thì khôi phục, chưa có thì tạo Object rỗng an toàn)
        if (subData.finalScore !== null && subData.finalScore !== undefined) {
          setExisting({
            scores: subData.scores || {}, // { "1": 8.5, "2": 9 }
            notes: subData.notes || {},
            overall: subData.overallComment || '',
            audit: { savedAt: subData.scoredAt, submittedAt: subData.scoredAt },
            hasDiscrepancy: false
          });
        } else {
          // Fallback object rỗng phòng thủ lỗi "Cannot read properties of null (reading 'audit')" ở ScoringPanel
          setExisting({
            scores: {},
            notes: {},
            overall: '',
            audit: { savedAt: null, submittedAt: null },
            hasDiscrepancy: false
          });
        }

      } catch (err) {
        console.error('Error binding data inside JudgeScoringPage:', err);
        setError(err.response?.data?.message || err.message || 'Lỗi đồng bộ dữ liệu chấm thi.');
      } finally {
        setLoading(false);
      }
    }

    // Chạy useEffect khi có đủ 3 tham số định tuyến động từ URL
    if (submissionId && roundId && eventId) {
      fetchScoringData();
    }
  }, [submissionId, roundId, eventId]);

  // ══ Xử lý các nút bấm tương tác API (giữ nguyên logic nghiệp vụ) ══
  const handleSaveDraft = async (payload) => {
    try {
      await axiosClient.post(`/api/v1/panelist/submissions/${submissionId}/draft`, payload);
      setTeam(prev => ({ ...prev, status: 'draft' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu bản nháp thất bại.');
    }
  };

  const handleSubmit = async (payload) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn nộp điểm số này? Điểm sau khi nộp sẽ không thể tự chỉnh sửa.')) {
        await axiosClient.post(`/api/v1/panelist/submissions/${submissionId}/submit`, payload);
        setTeam(prev => ({ ...prev, status: 'done' }));
        navigate(dynamicBackLink);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Nộp điểm chấm thi thất bại.');
    }
  };

  const handleRequestEdit = async () => {
    try {
      if (window.confirm('Gửi yêu cầu mở khóa sửa điểm lên ban tổ chức?')) {
        await axiosClient.post(`/api/v1/panelist/submissions/${submissionId}/request-edit`);
        alert('Yêu cầu đã được gửi thành công, vui lòng chờ BTC duyệt.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi yêu cầu mở khóa.');
    }
  };

  const handleToggleViolation = async (nextState) => {
    try {
      await axiosClient.put(`/api/v1/panelist/submissions/${submissionId}/violation`, { isViolation: nextState });
      setTeam(prev => ({ ...prev, flaggedViolation: nextState }));
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
              onOpenRubric={handleOpenRubric}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              onRequestEdit={handleRequestEdit}
            />
          }
        />
      </div>
    </div>
  );
}

export default JudgeScoringPage;