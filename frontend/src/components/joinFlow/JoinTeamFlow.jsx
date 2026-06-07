import { useState } from 'react'
import DisclaimerStep from './DisclaimerStep'
import ChooseOptionStep from './ChooseOptionStep'
import CreateTeamStep from './CreateTeamStep'
import JoinByCodeStep from './JoinByCodeStep'
import FindTeamStep from './FindTeamStep'
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


  // 3. Sử dụng các thuộc tính bên trong

  // const token = localStorage.getItem("accessToken");
  if (step === 3 && option === 'create') return (
    <CreateTeamStep
      onClose={onClose}
      onBack={() => setStep(2)}
      // onSubmit={(data) => {

      //   axios.post('http://localhost:8080/api/team/create', data, {
      //     headers: { Authorization: `Bearer ${token}` }
      //   })
      //     .then(() => {
      //       onClose();
      //       window.location.reload();
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //     })
      // }}
    />
  )


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