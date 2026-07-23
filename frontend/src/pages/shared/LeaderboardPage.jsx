import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, ClockCounterClockwise } from '@phosphor-icons/react';
import RoleBasedLeaderboard from '../../components/shared/Leaderboard/RoleBasedLeaderboard';
import { useAuth } from '../../AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ScoreDistributionModal from '../../components/coordinator/roundResults/ScoreDistributionModal';
import styles from './LeaderboardPage.module.css';
import axiosClient from '../../api/axiosClient';

// ==========================================
// MOCK DATA
// ==========================================
const ENABLE_MOCK_LEADERBOARD = true;

// const MOCK_LEADERBOARD = [
//   {
//     id: 'team1',
//     teamName: 'SEAL INNOVATORS',
//     rank: 1,
//     avgScore: 8.95,
//     status: 'official', 
//     discrepancy: false, 
//     judges: [
//       { 
//         judgeId: 'j1', judgeName: 'Trần Văn A', score: 9.0,
//         criteriaScores: [ { name: 'Tính khả thi', score: 9.0 }, { name: 'Sáng tạo', score: 9.0 } ]
//       },
//       { 
//         judgeId: 'j2', judgeName: 'Nguyễn Thị B', score: 8.9,
//         criteriaScores: [ { name: 'Tính khả thi', score: 8.8 }, { name: 'Sáng tạo', score: 9.0 } ]
//       },
//       { 
//         judgeId: 'j3', judgeName: 'Lê Văn C', score: 9.0,
//         criteriaScores: [ { name: 'Tính khả thi', score: 9.0 }, { name: 'Sáng tạo', score: 9.0 } ]
//       }
//     ]
//   },
//   {
//     id: 'team2',
//     teamName: 'CODE MASTERS',
//     rank: 2,
//     avgScore: 8.10,
//     status: 'provisional',
//     discrepancy: true, // Lệch chuẩn
//     judges: [
//       { 
//         judgeId: 'j1', judgeName: 'Trần Văn A (Bạn)', score: 8.5,
//         criteriaScores: [ { name: 'Tính khả thi', score: 8.0 }, { name: 'Sáng tạo', score: 9.0 } ]
//       },
//       { 
//         judgeId: 'j2', judgeName: 'Nguyễn Thị B', score: 6.0,
//         criteriaScores: [ { name: 'Tính khả thi', score: 5.0 }, { name: 'Sáng tạo', score: 7.0 } ]
//       },
//       { 
//         judgeId: 'j3', judgeName: 'Lê Văn C', score: 9.8,
//         criteriaScores: [ { name: 'Tính khả thi', score: 10.0 }, { name: 'Sáng tạo', score: 9.6 } ]
//       }
//     ]
//   },
//   {
//     id: 'team3',
//     teamName: 'TECH TITANS',
//     rank: 3,
//     avgScore: 7.50,
//     status: 'official',
//     discrepancy: false,
//     judges: [
//       { 
//         judgeId: 'j4', judgeName: 'Phạm Văn D', score: 7.5,
//         criteriaScores: [ { name: 'Tính khả thi', score: 7.0 }, { name: 'Sáng tạo', score: 8.0 } ]
//       },
//       { 
//         judgeId: 'j5', judgeName: 'Hoàng Thị E', score: 7.4,
//         criteriaScores: [ { name: 'Tính khả thi', score: 7.4 }, { name: 'Sáng tạo', score: 7.4 } ]
//       },
//       { 
//         judgeId: 'j6', judgeName: 'Vũ Văn F', score: 7.6,
//         criteriaScores: [ { name: 'Tính khả thi', score: 7.6 }, { name: 'Sáng tạo', score: 7.6 } ]
//       }
//     ]
//   }
// ];

// Mock API 2: My Context (Cá nhân hoá theo token)
const MOCK_MY_CONTEXT = {
  role: "TEAM",
  myTeam: {
    id: "team1",
    teamName: "SEAL INNOVATORS",
    rank: 1,
    avgScore: 8.95
  },
  myMentorTeams: [
    {
      id: "team1",
      teamName: "SEAL INNOVATORS",
      rank: 1,
      avgScore: 8.95
    },
    {
      id: "team3",
      teamName: "TECH TITANS",
      rank: 3,
      avgScore: 7.50
    }
  ]
};

// Mock API 3: Dữ liệu chung cho biểu đồ phân tán điểm số (Sử dụng chung cho BTC và BGK)
const MOCK_SCORE_DISTRIBUTION = {
  teamId: "team2",
  teamName: "CODE MASTERS",
  criteria: [
    { id: 1, name: "Tính khả thi", weight: 50 },
    { id: 2, name: "Sáng tạo", weight: 50 }
  ],
  judges: [
    {
      id: "j1",
      name: "Trần Văn A (Bạn)",
      isSender: true,
      scores: { "1": 8.0, "2": 9.0 }
    },
    {
      id: "j2",
      name: "Nguyễn Thị B",
      isSender: false,
      scores: { "1": 5.0, "2": 7.0 }
    },
    {
      id: "j3",
      name: "Lê Văn C",
      isSender: false,
      scores: { "1": 10.0, "2": 9.6 }
    }
  ]
};

function LeaderboardPage() {
  const { role: authRole, teamRole } = useAuth(); // 'USER', 'LECTURER', 'ADMIN'
  const { eventId, roundId } = useParams();
  const [MOCK_LEADERBOARD, setMOCK_LEADERBOARD] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myTeamData, setMyTeamData] = useState(null);
const [myMentorTeamsData, setMyMentorTeamsData] = useState([]);
  const [roundInfo, setRoundInfo] = useState({
    roundName: 'Đang tải...',
    publishStage: 1
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleRequestEdit = (submissionId) => {
    navigate(`/panelist/events/${eventId}/judge/rounds/${roundId}/submissions/${submissionId}?editMode=true`);
  };

  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartData, setChartData] = useState(null);

  const handleOpenChart = (teamId) => {
    // API Call: GET /api/rounds/${roundId}/submissions/${teamId}/score-distribution
    // Mock logic:
    if (ENABLE_MOCK_LEADERBOARD) {
      setChartData(MOCK_SCORE_DISTRIBUTION);
      setChartModalOpen(true);
    }
  };

  // Xác định role thật khi vào trang này dựa trên URL (để không bị đè nếu vừa là Judge vừa là Mentor)
  let activeRole = 'TEAM';
  if (location.pathname.includes('/mentor/')) {
    activeRole = 'MENTOR';
  } else if (location.pathname.includes('/judge/')) {
    activeRole = 'JUDGE';
  } else {
    activeRole = (teamRole === 'LEADER' || teamRole === 'MEMBER') ? teamRole : 'TEAM';
  }

  // Mock data: JUDGE thì tuỳ URL, MENTOR/TEAM thì GĐ 3 (đã chốt) để xem được bảng
  // const activeStage = activeRole === 'JUDGE' ? (roundId === 'vong3_mock' ? 3 : 2) : 3;
  // const roundName = roundId === 'vong3_mock' ? "Vòng 3: Đã chốt điểm" : "Vòng 2: Chung kết";
  // Tương lai sẽ fetch bằng API: /round/rounds/:roundId

  useEffect(() => {
    if (ENABLE_MOCK_LEADERBOARD) {
      axiosClient.get(`/round/${roundId}/info`)
        .then((res) => {
          setRoundInfo({
            roundName: res.data.roundName,
            publishStage: res.data.publishStage
          });
        })
        .catch((err) => {
          console.error("Lỗi khi tải thông tin vòng thi:", err);
        });
    }
  }, [roundId]);
  
  // const activeStage = ENABLE_MOCK_LEADERBOARD 
  // ? (activeRole === 'JUDGE' ? (roundId === 'vong3_mock' ? 3 : 2) : 3)
  // : roundInfo.publishStage;

// const roundName = ENABLE_MOCK_LEADERBOARD 
//   ? (roundId === 'vong3_mock' ? "Vòng 3: Đã chốt điểm" : "Vòng 2: Chung kết")
//   : roundInfo.roundName;



  // Đồng hồ đếm ngược rà soát điểm (30 phút = 1800 giây)
  const [remainingSec, setRemainingSec] = useState(1800);

  useEffect(() => {
    if (activeRole === 'JUDGE' && roundInfo.publishStage === 2) {
      const interval = setInterval(() => {
        setRemainingSec(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeRole, roundInfo.publishStage]);

  // Format giây thành MM:SS
  const mins = Math.floor(remainingSec / 60).toString().padStart(2, '0');
  const secs = (remainingSec % 60).toString().padStart(2, '0');

  // Xử lý mock data: Nếu đã sang stage 3 (Công bố chính thức) thì tất cả đều là official và hết lệch chuẩn
  let processedData = [];


  useEffect(() => {
    if (ENABLE_MOCK_LEADERBOARD) {

      axiosClient.get(`/team-results/rounds/${roundId}/results?eventId=${eventId}`)
        .then((response) => {
          // Lưu dữ liệu API vào state
          setLeaderboardData(response.data);

        })
        .catch((error) => {
          console.error("Lỗi khi tải bảng xếp hạng:", error);
        })
        .finally(() => {

        });
    }
  }, [roundId, eventId, ENABLE_MOCK_LEADERBOARD]);


  // if (ENABLE_MOCK_LEADERBOARD) {
  //   // Dùng dữ liệu Mock khi bật cờ MOCK
  //   processedData = MOCK_LEADERBOARD.map(team => {
  //     if (activeStage === 3) {
  //       return {
  //         ...team,
  //         status: 'official',
  //         discrepancy: false,
  //       };
  //     }
  //     return team;
  //   });
  // } else {
  //   // Dùng dữ liệu thật từ API
  //   processedData = leaderboardData;
  // }

  // MOCK IDS
  const currentJudgeId = ENABLE_MOCK_LEADERBOARD ? 'j1' : '';

  // const myTeamData = ENABLE_MOCK_LEADERBOARD ? MOCK_MY_CONTEXT.myTeam : null;
  
  // const myMentorTeamsData = ENABLE_MOCK_LEADERBOARD ? MOCK_MY_CONTEXT.myMentorTeams : [];

  useEffect(() => {
  if (ENABLE_MOCK_LEADERBOARD) {
    if (!roundId) return;

    axiosClient
      .get(`/round/${roundId}/my-context`)
      .then((response) => {
        // Response trả về MyContextResponseDTO chứa myTeam và myMentorTeams
        const data = response.data;
        setMyTeamData(data?.myTeam || null);
        setMyMentorTeamsData(data?.myMentorTeams || []);
      })
      .catch((error) => {
        console.error("Lỗi khi tải thông tin context của tôi:", error);
        setMyTeamData(null);
        setMyMentorTeamsData([]);
      });
  } else {
    // Trường hợp bật MOCK
    setMyTeamData(MOCK_MY_CONTEXT.myTeam);
    setMyMentorTeamsData(MOCK_MY_CONTEXT.myMentorTeams || []);
  }
}, [roundId, ENABLE_MOCK_LEADERBOARD]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} weight="bold" /> Quay lại
          </button>
          <h1 className={styles.pageTitle}>
            Bảng xếp hạng - {roundInfo.roundName}
          </h1>
          <p className={styles.pageDesc}>Xem xếp hạng, điểm số và kết quả của các đội thi trong vòng này.</p>
        </div>
      </header>

      <main>
        {/* Banner đếm ngược rà soát điểm cho BGK */}
        {activeRole === 'JUDGE' && roundInfo.publishStage === 2 && (
          <div className={styles.reviewBanner}>
            <div className={styles.reviewIcon}>
              <ClockCounterClockwise size={28} weight="fill" />
            </div>
            <div className={styles.reviewContent}>
              <h4 className={styles.reviewTitle}>Thời gian rà soát điểm</h4>
              <p className={styles.reviewDesc}>
                Các giám khảo đang có 30 phút để thảo luận và yêu cầu chỉnh sửa điểm đối với những đội bị đánh dấu chênh lệch.
              </p>
            </div>
            <div className={styles.timerBox}>
              <span className={styles.timerText}>{mins}:{secs}</span>
            </div>
          </div>
        )}

        <RoleBasedLeaderboard
          data={leaderboardData}
          role={activeRole}
          stage={roundInfo.publishStage}
          currentJudgeId={currentJudgeId}
          myTeamData={myTeamData}
          myMentorTeamsData={myMentorTeamsData}
          onRequestEdit={handleRequestEdit}
          onOpenChart={handleOpenChart}
        />
      </main>

      {/* Modal biểu đồ phân tán điểm số dùng chung với BTC */}
      <ScoreDistributionModal
        isOpen={chartModalOpen}
        onClose={() => setChartModalOpen(false)}
        data={chartData}
      />
    </div>
  );
}

export default LeaderboardPage;
