import { useState, useEffect } from 'react'
import EventLayout from '../layouts/EventLayout'
import TeamInfoHeader from '../components/leaderView/TeamInfoHeader'
import TeamMemberPanel from '../components/leaderView/TeamMemberPanel'
import TeamCategoryPanel from '../components/leaderView/TeamCategoryPanel'
import InviteTeamCard from '../components/noTeamView/InviteTeamCard'
import ConfirmModal from '../components/shared/ConfirmModal'
import styles from './MemberView.module.css'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../AuthContext'

// const MOCK_MEMBERS = [
//   {
//     id: 1,
//     name: 'Nguyễn Thành Thái',
//     email: 'nthai@gmail.com',
//     school: 'Đại học FPT',
//     isLeader: true,
//     isCurrentUser: false,
//     memberStatus: 'OFFICAL',
//     joinMethod: undefined,
//     bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.',
//     positions: ['Frontend Developer'],
//     techTags: { frontend: ['React', 'Next.js', 'Tailwind CSS'], backend: ['Spring Boot'] },
//     topics: ['Web Development'],
//     cvLink: 'https://github.com/Thaibc',
//   },
//   {
//     id: 2,
//     name: 'Bùi Thiên Khánh',
//     email: 'btkhanh123@gmail.com',
//     school: 'Đại học FPT',
//     isLeader: false,
//     isCurrentUser: false,
//     memberStatus: 'OFFICAL',
//     joinMethod: 'INVITE',
//     bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với các công nghệ Frontend như React và Vue, luôn thích tối ưu hóa UI/UX để mang lại trải nghiệm tốt nhất.',
//     positions: ['Frontend Developer'],
//     techTags: { frontend: ['React', 'Vue', 'Tailwind CSS'] },
//     topics: ['Web Development', 'Frontend Architecture'],
//     cvLink: 'https://github.com/in/Kbuiii',
//   },
//   {
//     id: 3,
//     name: 'Mạc Minh Tùng',
//     email: 'mtung638@gmail.com',
//     school: 'Đại học FPT',
//     isLeader: false,
//     isCurrentUser: false,
//     memberStatus: 'OFFICAL',
//     joinMethod: 'REQUEST',
//     bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình chuyên về phía Backend, có kinh nghiệm làm việc với Java, Spring Boot và quản trị cơ sở dữ liệu MySQL, Redis.',
//     positions: ['Backend Developer'],
//     techTags: { backend: ['Java', 'Spring Boot', 'MySQL', 'Redis'] },
//     topics: ['System Design', 'Cloud Computing'],
//     cvLink: 'https://github.com/Mtung0603',
//   },
//   {
//     id: 4,
//     name: 'Hồ Ngọc Bảo Trân',
//     email: 'hngbtran@gmail.com',
//     school: 'Đại học FPT',
//     isLeader: false,
//     isCurrentUser: true,
//     memberStatus: 'RESERVE',
//     joinMethod: 'CODE',
//     bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình yêu thích sự kết hợp giữa thiết kế và công nghệ, đảm nhận tốt cả hai vai trò Frontend Developer và UI/UX Designer.',
//     positions: ['Frontend Developer', 'UI/UX Designer'],
//     techTags: { frontend: ['React', 'Tailwind CSS'], design: ['Figma', 'Adobe XD'] },
//     topics: ['UI/UX Design', 'Web Development'],
//     cvLink: 'https://github.net/hngbtran',
//   },
//   {
//     id: 5,
//     name: 'Phạm Khắc Đăng Khoa',
//     email: 'khoapkd@gmail.com',
//     school: 'Đại học FPT',
//     isLeader: false,
//     isCurrentUser: false,
//     memberStatus: 'RESERVE',
//     joinMethod: 'INVITE',
//     bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình đam mê học hỏi các công nghệ web mới, chuyên phát triển Frontend với React và luôn sẵn sàng hỗ trợ team.',
//     positions: ['Frontend Developer'],
//     techTags: { frontend: ['React', 'JavaScript', 'HTML/CSS'] },
//     topics: ['Web Development', 'Creative Coding'],
//     cvLink: 'https://github.com/khoa2099',
//   },
// ]

// const MOCK_INVITES = [
//   {
//     id: 10,
//     teamId: 101,
//     teamName: 'Dream Team FPT',
//     description: 'Đội thi đấu Hackathon cần tuyển Frontend.',
//   }
// ]


const MOCK_CATEGORIES = [
  { id: 1, name: 'Giáo dục (Education)', desc: 'Các giải pháp liên quan đến học tập, giảng dạy, quản lý giáo dục.', currentTeams: 8, teamLimit: 10 },
  { id: 2, name: 'Y tế (Healthcare)', desc: 'Các giải pháp chăm sóc sức khỏe, quản lý bệnh viện, y tế cộng đồng.', currentTeams: 15, teamLimit: 15 },
  { id: 3, name: 'Thương mại điện tử (E-commerce)', desc: 'Nền tảng mua sắm trực tuyến, thanh toán điện tử, logistics.', currentTeams: 5, teamLimit: 12 },
  { id: 4, name: 'Giải trí (Entertainment)', desc: 'Game, mạng xã hội, ứng dụng đa phương tiện.', currentTeams: 12, teamLimit: 20 },
]

function MemberView() {
  const [teamStatus, setTeamStatus] = useState('OPEN')
  // Use mock data for testing UI
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([]);
  const [FAKE_INVITES, setFAKE_INVITES] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null)

  const [teamInfo, setTeamInfo] = useState({ teamName: 'SEAL Hackathon Team', description: 'Đội thi của chúng mình', teamCode: 'SEAL2026', teamStatus: 'OPEN' });
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [leaveRequest, setLeaveRequest] = useState([])
  const { updateTeamRole } = useAuth();
  const eventId = localStorage.getItem('eventId') || null;

  useEffect(() => {
    localStorage.setItem('lastKnownTeamRole', 'IN_TEAM');
  }, []);


  // api sinh vien xem những invitation gui toi minh
  useEffect(() => {
    axiosClient.get('/teamrequest/member-invitation')
      .then((response) => {
        setFAKE_INVITES(response.data);

      })
      .catch((error) => console.log(error));
  }, []);





  // api lấy team info - comment out to use mock data for testing

  useEffect(() => {
    axiosClient
      .get('/team/team-info')
      .then((response) => {
        setTeamInfo(response.data);
        setTeamStatus(response.data.teamStatus);
        // TODO: Cần trả về trường categoryId trong object teamInfo
        if (response.data.category.id) setSelectedCategory(response.data.category.id)
      })
      .catch((error) => console.log(error));
  }, []);

  // TODO: Gọi API GET /api/event/{eventId}/categories để lấy danh sách hạng mục
  useEffect(() => {
    // const eventId = 1 // Lấy id từ URL hoặc context
    axiosClient.get(`/track?eventId=${eventId}`)
      .then(res => setCategories(res.data))
      .catch(err => console.log(err))
  }, [])



  // api lấy team members - comment out to use mock data

  useEffect(() => {
    axiosClient
      .get('/team/my-team')
      .then((response) => {
        setFAKE_MEMBERS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);


  const handleOnLeave = (message) => {
    axiosClient
      .post('/teamrequest/out-team', { message: message })
      .then((response) => {
        console.log(response.data);
        if (currentUser?.memberStatus === 'RESERVE') {
          // Reserve members are removed instantly, so just clear state and reload
          setConfirmModal({
            title: 'Thành công',
            message: 'Bạn đã rời nhóm thành công!',
            confirmLabel: 'Xác nhận',
            isNotification: true,
            variant: 'success',
            onConfirm: () => {
              localStorage.removeItem('lastKnownTeamRole');
              updateTeamRole('NO_TEAM');
            }
          })
          return;
        }

        const responseData = {
          id: response.data?.id, name: response.data?.name, message: response.data?.message
        }
        setLeaveRequest([responseData])
        localStorage.setItem('pendingLeaveRequest', 'true');
        setConfirmModal({
          title: 'Thành công',
          message: 'Đã gửi yêu cầu rời nhóm thành công! Đang chờ nhóm trưởng phê duyệt.',
          confirmLabel: 'Xác nhận',
          isNotification: true,
          variant: 'success',
          onConfirm: () => setConfirmModal(null)
        })
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
      });
  };


  // api member xem những leave request da gui di 
  useEffect(() => {
    axiosClient
      .get('/teamrequest/leave_request')
      .then((response) => {
        setLeaveRequest(response.data);
      })
      .catch((error) => console.log(error));
  }, []);



  const handleOnCancelLeave = (id) => {
    axiosClient
      .post('/teamrequest/out-team/cancle', id)
      .then((response) => {
        console.log(response.data);
        localStorage.removeItem('pendingLeaveRequest');
        setConfirmModal({
          title: 'Thành công',
          message: 'Bạn đã hủy yêu cầu rời nhóm thành công!',
          confirmLabel: 'Xác nhận',
          isNotification: true,
          variant: 'success',
          onConfirm: () => window.location.reload()
        })
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể hủy rời nhóm lúc này.");
      });
  }



  const handleAcceptInvite = (requestId, isAccepted) => {
    axiosClient
      .put('/teamrequest/invitation-response', {
        requestId: requestId,
        accept: isAccepted
      })
      .then((response) => {
        console.log(response.data);
        setFAKE_INVITES(prev => prev.filter(inv => inv.id !== requestId));
        setConfirmModal({
          title: 'Thành công',
          message: 'Đã chấp nhận lời mời thành công!',
          confirmLabel: 'Xác nhận',
          isNotification: true,
          variant: 'success',
          onConfirm: () => window.location.reload()
        })
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra khi chấp nhận lời mời!");
      });
  }


  // (id) => {
  //   alert("Đã chấp nhận lời mời. Bạn sẽ rời team hiện tại.");
  //   setFAKE_INVITES(prev => prev.filter(inv => inv.id !== id));
  // }

  const handleRejectInvite = (requestId, isAccepted) => {
    axiosClient
      .put('/teamrequest/invitation-response', {
        requestId: requestId,
        accept: isAccepted
      })
      .then((response) => {
        console.log(response.data);
        setFAKE_INVITES(prev => prev.filter(inv => inv.id !== requestId));
        setConfirmModal({
          title: 'Thành công',
          message: 'Đã từ chối lời mời thành công!',
          confirmLabel: 'Xác nhận',
          isNotification: true,
          variant: 'success',
          onConfirm: () => window.location.reload()
        })
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra khi Từ Chối lời mời!");
      });
  }

  const currentUser = FAKE_MEMBERS.find(m => m.isCurrentUser);

  return (
    <EventLayout>
      <div className={styles.page}>

        <TeamInfoHeader
          teamName={teamInfo.teamName}
          teamStatus={teamStatus}
          description={teamInfo.description}
          showFindMember={false}
        />

        <TeamCategoryPanel
          categories={categories}
          selectedCategoryId={selectedCategory}
          isLeader={false}
          onCategoryChange={setSelectedCategory}
        />

        <div className={styles.content}>
          <div className={styles.main}>
            <TeamMemberPanel
              members={FAKE_MEMBERS}
              maxSlots={teamInfo.maxSlots || 4}
              teamStatus={teamStatus}
              isLeader={false}
              hasSelectedCategory={!!selectedCategory}
              leaveRequests={leaveRequest}
              onLeave={handleOnLeave}
              onCancelLeave={(id) => handleOnCancelLeave(id)}
            />
          </div>

          <div className={styles.side}>
            <InviteTeamCard
              invites={currentUser?.memberStatus === 'OFFICAL' ? [] : FAKE_INVITES}
              onAccept={(id) => handleAcceptInvite(id, true)}
              onReject={(id) => handleRejectInvite(id, false)}
              isFromTeam={true}
              emptyText={
                currentUser?.memberStatus === 'OFFICAL'
                  ? "Thành viên chính thức sẽ không nhận được lời mời tham gia từ đội khác."
                  : "Chưa có lời mời nào."
              }
            />
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
        isNotification={confirmModal?.isNotification}
        variant={confirmModal?.variant}
      />
    </EventLayout>
  )
}

export default MemberView