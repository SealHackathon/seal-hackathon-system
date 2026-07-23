import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, ClockCounterClockwise } from '@phosphor-icons/react';
import RoleBasedLeaderboard from '../../components/shared/Leaderboard/RoleBasedLeaderboard';
import { useAuth } from '../../AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './LeaderboardPage.module.css';

// ==========================================
// MOCK DATA
// ==========================================
const ENABLE_MOCK_LEADERBOARD = true;

const MOCK_LEADERBOARD = [
  {
    id: 'team1',
    teamName: 'SEAL INNOVATORS',
    rank: 1,
    avgScore: 8.95,
    status: 'official', 
    discrepancy: false, 
    judges: [
      { 
        judgeId: 'j1', judgeName: 'Trần Văn A', score: 9.0,
        criteriaScores: [ { name: 'Tính khả thi', score: 9.0 }, { name: 'Sáng tạo', score: 9.0 } ]
      },
      { 
        judgeId: 'j2', judgeName: 'Nguyễn Thị B', score: 8.9,
        criteriaScores: [ { name: 'Tính khả thi', score: 8.8 }, { name: 'Sáng tạo', score: 9.0 } ]
      },
      { 
        judgeId: 'j3', judgeName: 'Lê Văn C', score: 9.0,
        criteriaScores: [ { name: 'Tính khả thi', score: 9.0 }, { name: 'Sáng tạo', score: 9.0 } ]
      }
    ]
  },
  {
    id: 'team2',
    teamName: 'CODE MASTERS',
    rank: 2,
    avgScore: 8.10,
    status: 'provisional',
    discrepancy: true, // Lệch chuẩn
    judges: [
      { 
        judgeId: 'j1', judgeName: 'Trần Văn A (Bạn)', score: 8.5,
        criteriaScores: [ { name: 'Tính khả thi', score: 8.0 }, { name: 'Sáng tạo', score: 9.0 } ]
      },
      { 
        judgeId: 'j2', judgeName: 'Nguyễn Thị B', score: 6.0,
        criteriaScores: [ { name: 'Tính khả thi', score: 5.0 }, { name: 'Sáng tạo', score: 7.0 } ]
      },
      { 
        judgeId: 'j3', judgeName: 'Lê Văn C', score: 9.8,
        criteriaScores: [ { name: 'Tính khả thi', score: 10.0 }, { name: 'Sáng tạo', score: 9.6 } ]
      }
    ]
  },
  {
    id: 'team3',
    teamName: 'TECH TITANS',
    rank: 3,
    avgScore: 7.50,
    status: 'official',
    discrepancy: false,
    judges: [
      { 
        judgeId: 'j4', judgeName: 'Phạm Văn D', score: 7.5,
        criteriaScores: [ { name: 'Tính khả thi', score: 7.0 }, { name: 'Sáng tạo', score: 8.0 } ]
      },
      { 
        judgeId: 'j5', judgeName: 'Hoàng Thị E', score: 7.4,
        criteriaScores: [ { name: 'Tính khả thi', score: 7.4 }, { name: 'Sáng tạo', score: 7.4 } ]
      },
      { 
        judgeId: 'j6', judgeName: 'Vũ Văn F', score: 7.6,
        criteriaScores: [ { name: 'Tính khả thi', score: 7.6 }, { name: 'Sáng tạo', score: 7.6 } ]
      }
    ]
  }
];

function LeaderboardPage() {
  const { role: authRole, teamRole } = useAuth(); // 'USER', 'LECTURER', 'ADMIN'
  const { eventId, roundId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Xác định role thật khi vào trang này dựa trên URL (để không bị đè nếu vừa là Judge vừa là Mentor)
  let activeRole = 'TEAM';
  if (location.pathname.includes('/mentor/')) {
    activeRole = 'MENTOR';
  } else if (location.pathname.includes('/judge/')) {
    activeRole = 'JUDGE';
  } else {
    activeRole = (teamRole === 'LEADER' || teamRole === 'MEMBER') ? teamRole : 'TEAM';
  }

  // Mock data: JUDGE thì GĐ 2 (chưa chốt), MENTOR/TEAM thì GĐ 3 (đã chốt) để xem được bảng
  const activeStage = activeRole === 'JUDGE' ? 2 : 3; 
  const roundName = "Vòng 1: Sơ loại"; // Tương lai sẽ fetch bằng API: /round/rounds/:roundId

  // Đồng hồ đếm ngược rà soát điểm (30 phút = 1800 giây)
  const [remainingSec, setRemainingSec] = useState(1800);

  useEffect(() => {
    if (activeRole === 'JUDGE' && activeStage === 2) {
      const interval = setInterval(() => {
        setRemainingSec(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeRole, activeStage]);

  // Format giây thành MM:SS
  const mins = Math.floor(remainingSec / 60).toString().padStart(2, '0');
  const secs = (remainingSec % 60).toString().padStart(2, '0');

  // Xử lý mock data: Nếu đã sang stage 3 (Công bố chính thức) thì tất cả đều là official và hết lệch chuẩn
  let processedData = [];
  
  if (ENABLE_MOCK_LEADERBOARD) {
    processedData = MOCK_LEADERBOARD.map(team => {
      if (activeStage === 3) {
        return {
          ...team,
          status: 'official',
          discrepancy: false,
        };
      }
      return team;
    });
  }

  // MOCK IDS
  const currentJudgeId = ENABLE_MOCK_LEADERBOARD ? 'j1' : '';
  const currentTeamId = ENABLE_MOCK_LEADERBOARD ? 'team1' : '';
  const mentorTeamIds = ENABLE_MOCK_LEADERBOARD ? ['team1', 'team3'] : [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBox}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} weight="bold" /> Quay lại
          </button>
          <h1 className={styles.pageTitle}>
            Bảng xếp hạng - {roundName}
          </h1>
          <p className={styles.pageDesc}>Xem xếp hạng, điểm số và kết quả của các đội thi trong vòng này.</p>
        </div>
      </header>

      <main>
        {/* Banner đếm ngược rà soát điểm cho BGK */}
        {activeRole === 'JUDGE' && activeStage === 2 && (
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
          data={processedData} 
          role={activeRole} 
          stage={activeStage} 
          currentJudgeId={currentJudgeId}
          currentTeamId={currentTeamId}
          mentorTeamIds={mentorTeamIds}
        />
      </main>
    </div>
  );
}

export default LeaderboardPage;
