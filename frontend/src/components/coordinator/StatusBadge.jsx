import Badge from '../shared/Badge'

/**
 * Map event status → Badge variant + label mặc định
 */
const STATUS_MAP = {
  live:      { variant: 'green',         label: 'Đang diễn ra' },
  upcoming:  { variant: 'blue',          label: 'Sắp diễn ra'  },
  ended:     { variant: 'orange',        label: 'Đã diễn ra'   },
  draft:     { variant: 'dashed-orange', label: 'Lưu nháp'     },
  cancelled: { variant: 'red',           label: 'Đã hủy'       },
  ARCHIVED:  { variant: 'gray',          label: 'Lưu trữ'      }, 
}

/**
 * StatusBadge — badge specific cho trạng thái event
 *
 * @param {'live'|'upcoming'|'ended'|'draft'|'cancelled'|'archived'} status
 * @param {string}         [label]   — override label mặc định
 * @param {'sm'|'md'|'lg'} [size]
 */
function StatusBadge({ status, label, size = 'md' }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.draft

  return (
    <Badge
      variant={config.variant}
      label={label ?? config.label}
      size={size}
      dot={true}
    />
  )
}

export default StatusBadge