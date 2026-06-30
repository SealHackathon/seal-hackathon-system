import { useEffect, useState } from 'react'
import EventLayout from '../layouts/EventLayout'
import TeamInfoHeader from '../components/leaderView/TeamInfoHeader'
import TeamMemberPanel from '../components/leaderView/TeamMemberPanel'
import RequestCard from '../components/leaderView/RequestCard'
import InviteCard from '../components/leaderView/InviteCard'
import ConfirmModal from '../components/shared/ConfirmModal'
import styles from './LeaderView.module.css'
import NoticeBox from '../components/shared/NoticeBox'
import axios from 'axios'
import { Bell } from '@phosphor-icons/react'
import axiosClient from '../api/axiosClient'

// Data tạm — sau này thay bằng API
// const FAKE_MEMBERS = [
//   { id: 1, name: 'Nguyễn Thành Thái', email: 'ntbi533@gmail.com', school: 'Đại học FPT', isLeader: true, isCurrentUser: true },
//   { id: 2, name: 'Hồ Ngọc Bảo Trân', email: 'tranhngb@gmail.com', school: 'Đại học FPT', isLeader: false, isCurrentUser: false },
//   { id: 3, name: 'Mạc Minh Tùng', email: 'mtung638@gmail.com', school: 'Đại học FPT', isLeader: false, isCurrentUser: false },
// ]

// thay bằng api danh sách user hiện tại của account này nếu chưa có team ko hiện gì hết







// const FAKE_REQUESTS = [
//    { id: 1, name: 'Hồ Ngọc Bảo Trân', email: 'hngbtran@gmail.com', message: 'Xin chào, mình rất ấn tượng với định hướng của Team bạn. Rất mong được tham gia vào Team của bạn.' },
// ]

// const FAKE_LEAVE_REQUESTS = [
//   { id: 1, name: 'Hồ Ngọc Bảo Trân', message: 'Backend generate ra thành viên "Name" xin rời đội.' },
// ]



// const FAKE_INVITES = [
//   { id:1, memberId: .., name: 'Bùi Thiên Khánh', email: 'btkhanh123@gmail.com' },
//   {  id: 2, memberId:.., name: 'Phạm Khắc Đăng Khoa', email: 'khoapham4676@gmail.com' },
//   { id: 3, memberId:.., name: 'Mạc Minh Tùng', email: 'mtung638@gmail.com' }
// ]


const MAX_SLOTS = 4 // ! Sau này sẽ cho BTC config


// ============================================================
// MOCK DATA — chỉ dùng để test UI, xóa / comment lại khi dùng API thật
//
// memberStatus:  'OFFICAL' | 'RESERVE'   ← đối chiếu với backend trước khi dùng
// joinMethod:    'INVITE'  | 'REQUEST' | 'CODE'  ← tương tự
// ============================================================
const MOCK_MEMBERS = [
  {
    id: 1,
    name: 'Nguyễn Thành Thái',
    email: 'nthai@gmail.com',
    school: 'Đại học FPT',
    isLeader: true,
    isCurrentUser: true,
    memberStatus: 'OFFICAL',
    joinMethod: undefined,
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với React và Spring Boot, từng tham gia dự án nhóm và đảm nhận vai trò Frontend và hỗ trợ Backend.',
    positions: ['Frontend Developer'],
    techTags: { frontend: ['React', 'Next.js', 'Tailwind CSS'], backend: ['Spring Boot'] },
    topics: ['Web Development'],
    cvLink: 'https://github.com/Thaibc',
  },
  {
    id: 2,
    name: 'Bùi Thiên Khánh',
    email: 'btkhanh123@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'OFFICAL',
    joinMethod: 'INVITE',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình có kinh nghiệm làm việc với các công nghệ Frontend như React và Vue, luôn thích tối ưu hóa UI/UX để mang lại trải nghiệm tốt nhất.',
    positions: ['Frontend Developer'],
    techTags: { frontend: ['React', 'Vue', 'Tailwind CSS'] },
    topics: ['Web Development', 'Frontend Architecture'],
    cvLink: 'https://github.com/in/Kbuiii',
  },
  {
    id: 3,
    name: 'Mạc Minh Tùng',
    email: 'mtung638@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'OFFICAL',
    joinMethod: 'REQUEST',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình chuyên về phía Backend, có kinh nghiệm làm việc với Java, Spring Boot và quản trị cơ sở dữ liệu MySQL, Redis.',
    positions: ['Backend Developer'],
    techTags: { backend: ['Java', 'Spring Boot', 'MySQL', 'Redis'] },
    topics: ['System Design', 'Cloud Computing'],
    cvLink: 'https://github.com/Mtung0603',
  },
  {
    id: 4,
    name: 'Hồ Ngọc Bảo Trân',
    email: 'hngbtran@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'RESERVE',
    joinMethod: 'CODE',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình yêu thích sự kết hợp giữa thiết kế và công nghệ, đảm nhận tốt cả hai vai trò Frontend Developer và UI/UX Designer.',
    positions: ['Frontend Developer', 'UI/UX Designer'],
    techTags: { frontend: ['React', 'Tailwind CSS'], design: ['Figma', 'Adobe XD'] },
    topics: ['UI/UX Design', 'Web Development'],
    cvLink: 'https://github.net/hngbtran',
  },
  {
    id: 5,
    name: 'Phạm Khắc Đăng Khoa',
    email: 'khoapkd@gmail.com',
    school: 'Đại học FPT',
    isLeader: false,
    isCurrentUser: false,
    memberStatus: 'RESERVE',
    joinMethod: 'INVITE',
    bio: 'Mình là sinh viên năm 3 ngành Kỹ thuật phần mềm tại FPT University. Mình đam mê học hỏi các công nghệ web mới, chuyên phát triển Frontend với React và luôn sẵn sàng hỗ trợ team.',
    positions: ['Frontend Developer'],
    techTags: { frontend: ['React', 'JavaScript', 'HTML/CSS'] },
    topics: ['Web Development', 'Creative Coding'],
    cvLink: 'https://github.com/khoa2099',
  },
]



function LeaderView() {
  // lay du lieu tu API len 
  //gia lap login luu accesstoken vao localStorage
  const [confirmModal, setConfirmModal] = useState(null)
  const [teamStatus, setTeamStatus] = useState('pending')
  const [teamInfo, setTeamInfo] = useState({ teamName: 'SEAL Hackathon Team', description: 'Đội thi của chúng mình', teamCode: 'SEAL2026', teamStatus: 'OPEN' })
  const token = localStorage.getItem("accessToken")

  useEffect(() => {
    localStorage.setItem('lastKnownTeamRole', 'IN_TEAM');
  }, []);

  // ↓ Để test UI: dùng MOCK_MEMBERS. Khi dùng API thật: đổi lại thành useState([])
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([MOCK_MEMBERS]);
  const [FAKE_REQUESTS, setFAKE_REQUESTS] = useState([]);
  const [FAKE_INVITES, setFAKE_INVITES] = useState([]);
  const [FAKE_LEAVE_REQUESTS, setFAKE_LEAVE_REQUESTS] = useState([]);
  const emptyCount = MAX_SLOTS - FAKE_MEMBERS.length

  // api lấy team members thành viên đội 
  useEffect(() => {
    axiosClient
      .get('/team/my-team')
      .then((response) => {
        setFAKE_MEMBERS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // api lấy team info
  useEffect(() => {
    axiosClient
      .get('/team/team-info')
      .then((response) => {
        setTeamInfo(response.data);
        setTeamStatus(response.data.teamStatus)
      })
      .catch((error) => console.log(error));
  }, []);


  // api teamLeader xem những join request gửi đến team này 
  useEffect(() => {
    axiosClient
      .get('/teamrequest/joinrequest')
      .then((response) => {
        setFAKE_REQUESTS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // api teamLeader xem những invitation da gui di 
  useEffect(() => {
    axiosClient
      .get('/teamrequest/leader-invitation')
      .then((response) => {
        setFAKE_INVITES(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // api teamLeader xem những leave request da gui di 
  useEffect(() => {
    axiosClient
      .get('/teamrequest/leave_request')
      .then((response) => {
        setFAKE_LEAVE_REQUESTS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);




  const handleOnAccept = ((requestId, isAccept) => {
    setConfirmModal({
      title: 'Phê duyệt thành viên vào đội',
      message: 'Bạn có chắc chắn muốn PHÊ DUYỆT thành viên này vào đội không?',
      confirmLabel: 'Phê duyệt',
      onConfirm: () => {
        axiosClient
          .put('/teamrequest/Join-request/respond', {
            requestId: requestId,
            accept: isAccept
          })
          .then((response) => {
            console.log(response.data);
            // alert("Đã chấp nhận thành viên vào đội thành công!");

            // 2. Reload lại trang để cập nhật danh sách mới
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra khi thực hiện phê duyệt!");
          });

        setConfirmModal(null)
      }
    })
  });



  const handleOnReject = ((requestId, isAccept) => {
    // 1. Hiện thông báo hỏi trước khi Từ chối gia nhập
    setConfirmModal({
      title: 'Từ chối gia nhập',
      message: 'Bạn có chắc chắn muốn TỪ CHỐI yêu cầu gia nhập này không?',
      confirmLabel: 'Từ chối',
      onConfirm: () => {

        axiosClient
          .put('/teamrequest/Join-request/respond', {
            requestId: requestId,
            accept: isAccept
          })
          .then((response) => {
            console.log(response.data);
            // alert("Đã từ chối yêu cầu gia nhập!");

            // 2. Reload lại trang để yêu cầu biến mất khỏi danh sách chờ
            // window.location.reload();
          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra khi thực hiện từ chối!");
          });

        setConfirmModal(null)
      }
    })

  });


  const handleCancel = ((memberId) => {
    // 1. Hiển thị hộp thoại xác nhận trước khi gửi yêu cầu hủy/xóa
    setConfirmModal({
      title: 'Hủy lời mời',
      message: 'Bạn có chắc chắn muốn hủy lời mời này không?',
      confirmLabel: 'Xác nhận',
      denyLabel: 'Không',
      onConfirm: () => {

        axiosClient
          .delete(`/teamrequest/invitation-bymember?memberId=${memberId}`)
          .then((response) => {
            console.log(response.data);

            // Hiện thông báo thành công cho người dùng biết
            // alert("Đã hủy lời mời thành công!");

            // 2. Tải lại trang để cập nhật giao diện (mất lời mời vừa hủy)
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra khi hủy lời mời!");
          });

        setConfirmModal(null)
      }
    })
  });

  const handleOnKick = (id) => {
    setConfirmModal({
      title: 'Yêu cầu thành viên rời đội',
      message: 'Bạn có chắc muốn kick thành viên này?',
      confirmLabel: 'Xác nhận',
      denyLabel: 'Không',
      onConfirm: () => {
        axiosClient
          .put(`/team/kick/${id}`, {}
          )
          .then((response) => {
            console.log(response.data);
            //thêm reload trang

            setConfirmModal({
              message: 'Đã kick thành viên thành công!',
              confirmLabel: 'Xác nhận',
              isNotification: true,
              onConfirm: () => { window.location.reload() }
            })

            // alert("Đã kick thành viên thành công!");
            //reload trang
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra khi hủy tư cách thành viên!");
          });

        setConfirmModal(null)
      }
    })
  };

  const handleOnPromote = (id) => {
    // 1. Hiển thị lời cảnh báo
    setConfirmModal({
      title: 'Trao quyền trưởng nhóm',
      message: 'Bạn có chắc chắn muốn NHƯỜNG QUYỀN TRƯỞNG NHÓM cho thành viên này không?\nSau khi đồng ý, bạn sẽ không còn là Leader của đội nữa!',
      confirmLabel: 'Xác nhận',
      denyLabel: 'Không',
      onConfirm: () => {
        axios
          .put(`http://localhost:8080/api/team/promote/${id}`, {}, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // Gửi kèm token để kiểm tra bạn đúng là Leader hiện tại không
            }
          })
          .then((response) => {
            console.log(response.data);

            setConfirmModal({
              message: 'Đã chuyển giao quyền Trưởng nhóm thành công!',
              confirmLabel: 'Xác nhận',
              isNotification: true,
              onConfirm: () => { window.location.reload() }
            })

            // alert("Đã chuyển giao quyền Trưởng nhóm thành công!");

            // 2. Tải lại trang để cập nhật lại giao diện (Ẩn các nút quản lý của Leader cũ)

          })
          .catch((error) => {
            console.log(error);
            alert("Có lỗi xảy ra khi trao quyền trưởng nhóm!");
          });
        setConfirmModal(null)
      }
    })
  };


  const handleOnLeave = () => {
    if (FAKE_MEMBERS.length > 1) {
      alert("Vui lòng chuyển nhượng quyền trưởng nhóm cho thành viên khác.");
      return;
    }

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn rời khỏi nhóm này không? Hành động này không thể hoàn tác!");

    if (isConfirmed) {
      axiosClient
        .post('/teamrequest/out-team', {})
        .then((response) => {
          console.log(response.data);

          setConfirmModal({
            message: 'Bạn đã rời nhóm thành công!',
            confirmLabel: 'Xác nhận',
            isNotification: true,
            onConfirm: () => { window.location.reload() }
          })

          // alert("Bạn đã rời nhóm thành công!");
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
          alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
        });
    } else {
      console.log("Người dùng đã hủy bỏ yêu cầu rời nhóm.");
    }
  };



  // TODO: Xử lí chỉnh sửa thông tin đội

  const handleOnApproveLeave = (id) => {
    axios
      .put(`/teamrequest/Leave-request/${id}/respond`, {})
      .then((response) => {
        console.log(response.data);

        setConfirmModal({
          message: 'Bạn đã duyệt yêu cầu rời nhóm thành công!',
          confirmLabel: 'Xác nhận',
          isNotification: true,
          onConfirm: () => { window.location.reload() }
        })

        // alert("Bạn đã duyet yeu cau roi nhóm thành công!");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
      });

  } // TODO: Xử lí rời đội

  const handleOnCancelLeave = (id) => {
    axiosClient
      .post('/teamrequest/out-team/cancle', id)
      .then((response) => {
        console.log(response.data);

        setConfirmModal({
          message: 'Bạn đã từ chối yêu cầu rời nhóm thành công!',
          confirmLabel: 'Xác nhận',
          isNotification: true,
          onConfirm: () => { window.location.reload() }
        })

        // alert("Bạn đã tu choi yeu cau roi nhóm thành công!");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
      });
  }

  const handleOnLockTeam = () => {
    axiosClient
      .post('/teamrequest/lock-team', {})
      .then((response) => {
        console.log(response.data);

        setTeamStatus('PENDING_APPROVAL')

        // alert("Đã chốt đội thành công!");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Đã có lỗi xảy ra, không thể chốt đội lúc này.");
      });
  }


  // TODO: Gọi API PUT /api/team/move-to-official/:id khi backend sẵn sàng
  const handleMoveToOfficial = (id) => {
    setConfirmModal({
      title: 'Nâng lên hàng chính thức',
      message: 'Bạn có chắc muốn chuyển thành viên này lên hàng chính thức không?',
      confirmLabel: 'Xác nhận',
      denyLabel: 'Không',
      onConfirm: () => {
        console.log('TODO: Gọi API promote RESERVE → OFFICAL, memberId:', id)
        // đang check là cái id này là MEMBER id FK của bảng MEMBER
         axiosClient.put(`/team/move-to-official/${id}`)
        setConfirmModal(null)
      }
    })
  }

  // TODO: Gọi API PUT /api/team/move-to-reserve/:id khi backend sẵn sàng
  const handleMoveToReserve = (id) => {
    setConfirmModal({
      title: 'Chuyển xuống hàng dự bị',
      message: 'Bạn có chắc muốn chuyển thành viên này xuống hàng dự bị không?',
      confirmLabel: 'Xác nhận',
      denyLabel: 'Không',
      onConfirm: () => {
        console.log('TODO: Gọi API demote OFFICAL → RESERVE, memberId:', id)
        // axios.put()
        //   .then(() => window.location.reload())
        //   .catch(err => console.log(err))
        setConfirmModal(null)
      }
    })
  }


  // function renderNoticeBox() {
  //   if (teamStatus == 'pending' && emptyCount <= 1) { // ! mốt chỉnh lại chỗ này là emptyCount == minSlots
  //     return (
  //       <NoticeBox
  //         color="green"
  //         icon={Bell}
  //         message={
  //           <div>
  //             <p>Đội của bạn đã đủ thành viên.</p>
  //           </div>
  //         }
  //         detail={
  //           <div>
  //             <p>Vì số lượng mỗi track có hạn, bạn hãy nhanh chóng chọn bảng và chốt đội nhé.</p>
  //           </div>
  //         }
  //       />
  //     )
  //   }
  // }


  return (
    <EventLayout>
      <div className={styles.page}>

        {/* Thanh info đội — full width */}

        {/* cần truyền vào teamName ,description, teamCode */}
        <TeamInfoHeader
          teamId={teamInfo.id}
          teamName={teamInfo.teamName}
          description={teamInfo.description}
          teamCode={teamInfo.teamCode}
          emptyCount={emptyCount}
          teamStatus={teamStatus}
          isLeader
          // onEdit={() => console.log('mở popup chỉnh sửa thông tin đội')}
          onFindMember={() => console.log('mở popup tìm thành viên')}
        />

        {/* {renderNoticeBox()} */}

        {/* 2 cột bên dưới */}
        <div className={styles.content}>

          <div className={styles.main}>
            <TeamMemberPanel
              members={FAKE_MEMBERS}
              maxSlots={MAX_SLOTS}
              teamStatus={teamStatus}
              isLeader
              onLockTeam={() => handleOnLockTeam()}
              onKick={(id) => handleOnKick(id)}
              onPromote={(id) => handleOnPromote(id)}
              onApproveLeave={(id) => handleOnApproveLeave(id)}
              onCancelLeave={(id) => handleOnCancelLeave(id)}
              onLeave={handleOnLeave}
              onMoveToOfficial={(id) => handleMoveToOfficial(id)}
              onMoveToReserve={(id) => handleMoveToReserve(id)}
              leaveRequests={FAKE_LEAVE_REQUESTS}
              onLock={handleOnLockTeam}
            />
          </div>

          <div className={styles.side}>
            <RequestCard
              requests={FAKE_REQUESTS}
              onAccept={(id) => handleOnAccept(id, true)}
              onReject={(id) => handleOnReject(id, false)}
            />
            {/* truyền vào danh sách lờiời đã gởi đi của leader
                cái id mà truyền vô cho onCancel là id của teamRequest để khi hủy sẽ gọi API xóa teamRequest đó đi
            */}
            <InviteCard
              invites={FAKE_INVITES}
              onCancel={(id) => handleCancel(id)}
            />
          </div>

        </div>
      </div>


      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
        isNotification={confirmModal?.isNotification}
      />

    </EventLayout>
  )
}

export default LeaderView