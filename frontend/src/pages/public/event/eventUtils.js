// Tiện ích định dạng dùng chung cho trang public event.

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function fmtDay(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function fmtDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

// "7,000,000 VNĐ"
export function fmtVND(n) {
  if (n == null) return ''
  return new Intl.NumberFormat('en-US').format(n) + ' VNĐ'
}

// "7.000.000 đồng"
export function fmtDong(n) {
  if (n == null) return ''
  return new Intl.NumberFormat('vi-VN').format(n) + ' đồng'
}

// Số ngày còn lại tính từ hôm nay (>= 0)
export function daysLeft(iso) {
  if (!iso) return 0
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}
