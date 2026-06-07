import SideCard from '../leaderView/SideCard'
import Button from '../shared/Button'
import { Clock } from '@phosphor-icons/react'

function RequestTeamCard({ requests, onCancel }) {
  const items = requests.map(req => ({
    id: req.id,
    name: req.teamName,
    email: `${req.memberCount}/${req.maxSlots} thành viên`,
    ...req,
  }))

  return (
    <SideCard
      color="orange"
      icon={<Clock size={32} />}
      title="Yêu cầu đã gửi"
      count={requests.length}
      items={items}
      emptyText="Chưa gửi yêu cầu nào."
      renderAction={(item) => (
        <Button
          label="Hủy"
          labelSize={16}
          variant="outline"
          color='orange'
          onClick={() => onCancel(item.id)}
        />
      )}
    />
  )
}

export default RequestTeamCard