import { Clock } from '@phosphor-icons/react'
import SideCard from './SideCard'
import Button from '../shared/Button'

function InviteCard({ invites, onCancel }) {
  return (
    <SideCard
      color="orange"
      icon={<Clock size={32} />}
      title="Lời mời đã gửi"
      count={invites.length}
      items={invites}
      emptyText="Chưa gửi lời mời nào."
      renderAction={(item) => (
        <Button
          label="Hủy"
          labelSize={16}
          variant="outline"
          color='orange'
          onClick={() => onCancel(item.memberId)}
        />
      )}
    />
  )
}

export default InviteCard