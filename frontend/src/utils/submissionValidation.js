// Danh sách hạng mục bắt buộc trong bài nộp — dùng chung cho trang & form nộp bài
export const REQUIRED_SUBMISSION_FIELDS = ['github', 'video', 'slide']

// Validate 1 hạng mục trong form nộp bài
export function validateSubmissionField(key, form) {
    const field = form[key]

    if (key === 'github') {
        const url = field.value?.trim().toLowerCase() || ''
        if (!url) return 'Vui lòng cung cấp nội dung bắt buộc.'
        if (!url.includes('github.com')) return 'Đường dẫn phải chứa "github.com".'
        return null
    }

    if (field.mode === 'link') {
        const url = field.value?.trim() || ''
        return url ? null : 'Vui lòng cung cấp nội dung bắt buộc.'
    }

    return field.file ? null : 'Vui lòng cung cấp nội dung bắt buộc.'
}

// Validate toàn bộ hạng mục bắt buộc, trả về map { [key]: true/false }
export function computeValidFields(form) {
    const valid = {}
    REQUIRED_SUBMISSION_FIELDS.forEach((key) => {
        valid[key] = validateSubmissionField(key, form) === null
    })
    return valid
}