import { useState } from 'react'
import DisclaimerStep from './DisclaimerStep'
import ChooseOptionStep from './ChooseOptionStep'
import CreateTeamStep from './CreateTeamStep'

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

  if (step === 3 && option === 'create') return (
    <CreateTeamStep
      onClose={onClose}
      onBack={() => setStep(2)}
      onSubmit={(data) => {
        console.log('Tạo đội:', data)
      }}
      currentUserEmail="ntbi533@gmail.com"
    />
  )

  
  return null
}

export default JoinTeamFlow