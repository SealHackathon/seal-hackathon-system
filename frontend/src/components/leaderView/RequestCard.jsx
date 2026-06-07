import { useState } from 'react'
import SideCard from './SideCard'
import Button from '../shared/Button'
import RequestDetailModal from './RequestDetailModal'
import { EnvelopeSimple } from '@phosphor-icons/react'

function RequestCard({ requests, onAccept, onReject }) {
  const [selectedRequest, setSelectedRequest] = useState(null)

  return (
    <>
      <SideCard
      color="green"
      icon={<EnvelopeSimple size={32} />}
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
          onClick={() => setSelectedRequest(item)}
        />
      )}
    />

    <RequestDetailModal
        request={selectedRequest}
        onAccept={onAccept}
        onReject={onReject}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  )
}

export default RequestCard