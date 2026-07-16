export const TEAM_STATUS = {
    APPROVED: { label: 'Đã duyệt', variant: 'green' },
    PENDING_APPROVAL: { label: 'Chờ duyệt', variant: 'orange' },
    REJECTED: { label: 'Từ chối', variant: 'orangeSolid' },
    OPEN: { label: 'Đang mở', variant: 'blue' }
}

export function getStatusMeta(status) {
    return TEAM_STATUS[status] ?? { label: status, variant: 'gray' }
}
