import { Scroll, ClipboardText, Info } from '@phosphor-icons/react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import RichTextView from './RichTextView'
import styles from './RulesSection.module.css'

// Mock data để render thử — thay bằng data thật (rules.general / rules.notes) khi ráp API
const MOCK = {
  general: `
    <p>Mỗi đội thi từ <strong>3–5 thành viên</strong>, thực hiện code và xây dựng sản phẩm trong thời gian quy định của từng vòng thi.</p>
    <p>Đội thi phải lưu trữ mã nguồn và kết quả trên các nền tảng cloud chuyên dụng: <strong>GitHub, Jira, Confluence, Notion</strong> hoặc tương đương <em>(​không chấp nhận Google Drive hoặc dịch vụ cá nhân)</em>.</p>
    <p>Sản phẩm dự thi được trình bày dưới dạng slide kèm demo trực tiếp hoặc video.</p>
    <p>Các đội chỉ được sử dụng AI Agent framework do Ban tổ chức cho phép:</p>
    <ul>
      <li>LangGraph</li>
      <li>OpenAI SDK</li>
      <li>Google Gemini SDK</li>
      <li>LlamaIndex</li>
    </ul>
    <p>hoặc mở rộng sang <strong>CrewAI, AutoGen, HuggingFace Agents</strong> nếu thể hiện được tính sáng tạo phù hợp với track đã chọn.</p>
  `,
  notes: [
    {
      title: 'Quy định về tư cách tham gia',
      desc: 'Sinh viên ngành CNTT đang theo học tại FPT University cơ sở TP.HCM hoặc các trường đại học khác trên địa bàn TP.HCM. Sinh viên đã tốt nghiệp không được tham gia. Một thí sinh chỉ được tham gia một đội thi.',
    },
    {
      title: 'Quy định về đội thi',
      desc: 'Mỗi đội từ 3–5 thành viên. Sau thời gian kết thúc đăng ký, các đội thi không được thay đổi thành viên.',
    },
    {
      title: 'Quy định về sản phẩm dự thi',
      desc: 'Sản phẩm nộp dự thi phải là kết quả làm việc của chính đội thi trong thời gian cuộc thi diễn ra, không sao chép hoặc đạo nhái từ nguồn khác.',
    },
  ],
}

function RulesSection({ id, rules }) {
  const general = rules?.general || MOCK.general
  const notes = rules?.notes?.length ? rules.notes : MOCK.notes
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.1 })

  return (
    <section id={id} ref={sectionRef} className={`${styles.section} ${isVisible ? styles.revealed : ''}`}>
      {/* ===== Header section ===== */}
      <div className={styles.headCol}>
        <span className={styles.eyebrow}>Thể lệ</span>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <span className={styles.ac}>Về</span> Quy chế cuộc thi
          </h2>
          <span className={styles.hicon}>
            <Scroll weight="fill" />
          </span>
        </div>
        <div className={styles.uline}>
          <span />
          <span />
        </div>
      </div>

      {/* ===== Quy định chung ===== */}
      <div className={styles.subHead}>
        <div className={styles.subTitleRow}>
          <span className={styles.subIcon}>
            <ClipboardText weight="fill" />
          </span>
          <span className={styles.subTitle}>Quy định chung</span>
        </div>
        <div className={styles.subUline}>
          <span />
          <span />
        </div>
      </div>
      <div className={styles.general}>
        <div className={styles.generalBody}>
          <RichTextView html={general} />
        </div>
      </div>

      {/* ===== Lưu ý ===== */}
      {notes.length > 0 && (
        <>
          <div className={`${styles.subHead} ${styles.blockGap}`}>
            <div className={styles.subTitleRow}>
              <span className={styles.subIcon}>
                <Info weight="fill" />
              </span>
              <span className={styles.subTitle}>Lưu ý</span>
            </div>
            <div className={styles.subUline}>
              <span />
              <span />
            </div>
          </div>
          <div className={styles.notesList}>
            {notes.map((n, i) => (
              <div key={i} className={styles.noteCard}>
                <span className={styles.noteNum}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={styles.noteBody}>
                  <span className={styles.noteTitle}>{n.title}</span>
                  <span className={styles.noteDesc}>{n.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default RulesSection