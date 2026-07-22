import styles from './RichTextView.module.css'

/**
 * RichTextView — render nội dung Rich Text
 * - Truyền `html` (chuỗi HTML từ backend) hoặc `text` (chuỗi thường)
 * đảm bảo html đã được sanitize phía server trước khi trả về.
 */
function RichTextView({ html, text, className }) {
  const cls = [styles.rich, className].filter(Boolean).join(' ')
  if (html) {
    const inner = { __html: html }
    return <div className={cls} dangerouslySetInnerHTML={inner} />
  }
  return <div className={cls}>{text}</div>
}

export default RichTextView
