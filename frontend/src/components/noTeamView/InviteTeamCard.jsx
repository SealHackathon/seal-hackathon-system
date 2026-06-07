import { useState } from 'react'
import SideCard from '../leaderView/SideCard'
import Button from '../shared/Button'
import RequestDetailModal from '../leaderView/RequestDetailModal'
import { EnvelopeSimple } from '@phosphor-icons/react'

function InviteTeamCard({ invites = [], onAccept, onReject }) {
  const [selectedInvite, setSelectedInvite] = useState(null)

  // Map lại thông tin của invite cho đúng với các thông tin sẽ gửi đến cái RequestDetailModal
  const items = invites.map(inv => ({
    ...inv,
    id: inv.id,
    name: inv.teamName,
    email: `${inv.memberCount}/${inv.maxSlots} thành viên`,
    // Bên NoTeamView truyền invite vào chứa các dữ liệu liên quan tới một team
    // Bên này map chúng thành một array để gửi quá bên RequestDetailModal
    team: {                              
      name: inv.teamName,
      maxSlots: inv.maxSlots,
      description: inv.description ?? '',
      members: Array.from({ length: inv.memberCount }, (_, i) => ({ id: i })),
    }
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

      {/* ở đây chưa biết là invite hay request cần 1 props để truyền vào */}
      <RequestDetailModal
        invite={selectedInvite}
        isTeamInvite
        onAccept={onAccept}
        onReject={onReject}
        onClose={() => setSelectedInvite(null)}
      />

    </>
  )
}

export default InviteTeamCard