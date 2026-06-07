import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import MemberCard from './MemberCard'
import CardSearchBase from '../shared/CardSearchBase'
import styles from '../shared/CardSearchBase.module.css'
import axios from 'axios'
import { useEffect } from 'react'


function FindMemberModal({ onClose }) {
  const [search, setSearch] = useState('')
  const [fptOnly, setFptOnly] = useState(false)
  const [invitedIds, setInvitedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  // trang leader thì lấy danh sách lời mời để show bằng request id của teamRequest
  // nhưng ở đây là trang tìm kiếm thành viên mời vào team nên lấy cái id lên là id của user
    

   // lay danh sach free user trong he thong
  const [FAKE_MEMBERS, setFAKE_MEMBERS] = useState([]);
  const token = localStorage.getItem("accessToken") 
    useEffect(() => {
      // nếu team đã đủ người thì trả về mảng rỗng 
      axios
        .get('http://localhost:8080/api/user/free-users'
          , {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // nếu có JWT
            }
          }
        )
        .then((response) => {
          response.data.forEach(user => {
            user.isInvited = false; // thêm thuộc tính isInvited vào từng user
          });
          setFAKE_MEMBERS(response.data);
        })
        .catch((error) => console.log(error));
    }, []);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.wrapper} ${styles.modalScroll}`} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} color="var(--color-text-secondary)" />
        </button>

        <h1 className={styles.title}>Tìm thành viên</h1>
        <p className={styles.subtitle}>
          Tìm và mời thành viên vào đội của bạn. Lời mời sẽ được gửi đến và người nhận có thể chấp nhận hoặc từ chối.
        </p>

      {/* -bên đây là truyền vào 1 danh sách những FREE member nhung người chưa có đội để leader mời
          -cái id lấy lên là ID của USER đó
          -NHƯNG MÀ cái nút onCancel ở đây lại truyền vào cái id của user đó.
          -Khi bấm xóa thì xuống api sẽ ko gọi được vì API cần request id
          -Anh thắc mắc cái onCancle này có link với onCancel ở InviteCard trong LeaderView không
      ) */}
        <CardSearchBase
          items={FAKE_MEMBERS}
          renderCard={(member) => (
            <MemberCard
              key={member.id}
              member={member}
              onInvite={(id) => setInvitedIds(prev => [...prev, id])}
              onCancel={(id) => setInvitedIds(prev => prev.filter(i => i !== id))}
            />
          )}
          searchPlaceholder="Tìm theo tên hoặc email"
          search={search}
          onSearchChange={setSearch}
          fptOnly={fptOnly}
          onFptChange={setFptOnly}
          currentPage={currentPage}
          totalPages={8}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  )
}

export default FindMemberModal