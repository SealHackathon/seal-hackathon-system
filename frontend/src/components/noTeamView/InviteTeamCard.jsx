import { useState } from 'react'
import SideCard from '../leaderView/SideCard'
import Button from '../shared/Button'
import { EnvelopeSimple } from '@phosphor-icons/react'

function InviteTeamCard({ invites, onAccept, onReject }) {
  const [selectedInvite, setSelectedInvite] = useState(null)

  const items = invites.map(inv => ({
    id: inv.id,
    name: inv.teamName,
    email: `${inv.memberCount}/${inv.maxSlots} thành viên`,
    ...inv,
  }))

  return (
    <>
      <SideCard
        color="green"
        icon={<EnvelopeSimple size={32} />}
        title="Lời mời vào đội"
        count={invites.length}
        items={items}
        emptyText="Chưa có lời mời nào."
        renderAction={(item) => (
          <Button
            label="Chi tiết"
            labelSize={16}
            variant="outline"
            color='green'
            onClick={() => setSelectedInvite(item)}
          />
        )}
      />
      {selectedInvite && (
        <div>Làm sau (Cái modal)</div>
      )}
    </>
  )
}

export default InviteTeamCard