import { useState } from 'react'
import DisclaimerStep from './DisclaimerStep'
import ChooseOptionStep from './ChooseOptionStep'
import CreateTeamStep from './CreateTeamStep'
import JoinByCodeStep from './JoinByCodeStep'
import FindTeamStep from './FindTeamStep'
import axios from 'axios'
function JoinTeamFlow({ onClose }) {
  const [step, setStep] = useState(1)
  const [option, setOption] = useState(null)  // 'create' | 'code' | 'search'

  if (step === 1) return (
    <DisclaimerStep
      onClose={onClose}
      onNext={() => setStep(2)}
    />
  )

  if (step === 2) return (
    <ChooseOptionStep
      onClose={onClose}
      onBack={() => setStep(1)}
      onNext={(selected) => { setOption(selected); setStep(3) }}
    />
  )

  // 1. Lấy chuỗi JSON từ localStorage
  const storedUser = localStorage.getItem('userInfo');

  // 2. Chuyển đổi chuỗi thành Object (Cần kiểm tra xem dữ liệu có tồn tại hay không)
  const userInfo = storedUser ? JSON.parse(storedUser) : null;

  // 3. Sử dụng các thuộc tính bên trong


  if (step === 3 && option === 'create') return (
    <CreateTeamStep
      onClose={onClose}
      onBack={() => setStep(2)}
      onSubmit={(data) => {
        const token = localStorage.getItem("accessToken");
        axios.post('http://localhost:8080/api/team/create', data, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(() => {
            onClose();
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
          })
      }}
      currentUserEmail={userInfo?.email}
    />
  )
  // if (step === 3 && option === 'code') return (<NoTeamViews />)
  //       console.log('Tạo đội:', data)
  //     }}
  //     currentUserEmail="ntbi533@gmail.com"
  //   />
  // )

  if (step === 3 && option === 'code') return (
    <JoinByCodeStep
      onClose={onClose}
      onBack={() => setStep(2)}
      onSubmit={(data) => console.log('Tham gia bằng mã:', data)}
    />
  )

  if (step === 3 && option === 'search') return (
    <FindTeamStep
      onClose={onClose}
      onBack={() => setStep(2)}
      onSubmit={(data) => console.log('Xin vào đội:', data)}
    />
  )

  return null
}

export default JoinTeamFlow