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



function LeaderView() {
  // lay du lieu tu API len 
  //gia lap login luu accesstoken vao localStorage
  const [confirmModal, setConfirmModal] = useState(null)

  const [teamStatus, setTeamStatus] = useState('pending')
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([]);
  const [FAKE_REQUESTS, setFAKE_REQUESTS] = useState([]);
  const [FAKE_INVITES, setFAKE_INVITES] = useState([]);
  const [FAKE_LEAVE_REQUESTS, setFAKE_LEAVE_REQUESTS] = useState([]);
  const token = localStorage.getItem("accessToken")
  const [teamInfo, setTeamInfo] = useState({ teamName: '', description: '', teamCode: '' });
  const emptyCount = MAX_SLOTS - FAKE_MEMBERS.length
  // api lấy team members thành viên đội 
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/my-team'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setFAKE_MEMBERS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // api lấy team info
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/team/team-info'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setTeamInfo(response.data);
      })
      .catch((error) => console.log(error));
  }, []);


  // api teamLeader xem những join request gửi đến team này 
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/teamrequest/joinrequest'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setFAKE_REQUESTS(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // api teamLeader xem những invitation da gui di 
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/teamrequest/leader-invitation'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
      .then((response) => {
        setFAKE_INVITES(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // api teamLeader xem những leave request da gui di 
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/teamrequest/leave_request'
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        }
      )
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
        axios
          .put('http://localhost:8080/api/teamrequest/Join-request/respond', {
            requestId: requestId,
            accept: isAccept
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // nếu có JWT
            }
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

        axios
          .put('http://localhost:8080/api/teamrequest/Join-request/respond', {
            requestId: requestId,
            accept: isAccept
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // nếu có JWT
            }
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

        axios
          .delete(`http://localhost:8080/api/teamrequest/invitation-bymember?memberId=${memberId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
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
        axios
          .put(`http://localhost:8080/api/team/kick/${id}`, {}, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
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
      axios
        .post('http://localhost:8080/api/teamrequest/out-team', {}, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // nếu có JWT
          }
        })
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
      .put(`http://localhost:8080/api/teamrequest/Leave-request/${id}/respond`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // nếu có JWT
        }
      })
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
    axios
      .post('http://localhost:8080/api/teamrequest/out-team/cancle', id, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // nếu có JWT
        }
      })
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
    axios
      .post('http://localhost:8080/api/teamrequest/lock-team', {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // nếu có JWT
        }
      })
      .then((response) => {
        console.log(response.data);

        setTeamStatus('waiting')

        // alert("Bạn đã tu choi yeu cau roi nhóm thành công!");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("Có lỗi xảy ra, không thể rời nhóm lúc này.");
      });
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
              leaveRequests={FAKE_LEAVE_REQUESTS}
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