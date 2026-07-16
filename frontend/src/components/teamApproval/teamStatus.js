export const TEAM_STATUS = {
    approved: { label: 'Đã được duyệt', variant: 'green' },
    pending:  { label: 'Chờ duyệt',     variant: 'orange' },
    rejected: { label: 'Từ chối',       variant: 'red' },
    locked:   { label: 'Đã khóa',       variant: 'gray' },
}

export function getTeamStatusMeta(status) {
    return TEAM_STATUS[status] || { label: status, variant: 'gray' }
}
