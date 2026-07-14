// Ánh xạ trạng thái tài khoản thí sinh → nhãn + variant của <Badge/>
// Dùng chung cho bảng và panel chi tiết để tránh lặp logic.
export const CANDIDATE_STATUS = {
    approved: { label: 'Đã được duyệt', variant: 'green' },
    pending:  { label: 'Chờ duyệt',     variant: 'orange' },
    rejected: { label: 'Đã từ chối',    variant: 'orangeSolid' },
}

export function getStatusMeta(status) {
    return CANDIDATE_STATUS[status] ?? CANDIDATE_STATUS.pending
}
