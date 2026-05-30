import { EnvelopeSimple } from '@phosphor-icons/react'
import SideCard from './SideCard'
import Button from '../shared/Button'

function RequestCard({ requests, onViewDetail }) {
  return (
    <SideCard
      color="green"
      icon={<EnvelopeSimple size={32}/>}
      title="Yêu cầu vào đội"
      count={requests.length}
      items={requests}
      emptyText="Chưa có yêu cầu nào."
      renderAction={(item) => (
        <Button
          label="Chi tiết"
          labelSize={16}
          variant="outline"
          color='green'
          onClick={() => onViewDetail(item)}
        />
      )}
    />
  )
}

export default RequestCard