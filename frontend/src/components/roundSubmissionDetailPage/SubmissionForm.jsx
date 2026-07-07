import {
  Files,
  UploadSimple,
  LinkSimple,
  CheckCircle,
  MinusCircle,
  Eye,
  GithubLogo,
  VideoCamera,
  PresentationChart,
  ArrowSquareOut,
  PaperPlaneTilt,
  PencilSimple,
} from '@phosphor-icons/react'
import SegmentedControl from '../shared/SegmentedControl'
import FormInput from '../shared/FormInput'
import FileUpload from '../shared/FileUpload'
import Button from '../shared/Button'
import styles from './SubmissionForm.module.css'
import { validateSubmissionField } from '../../utils/submissionValidation'

const ITEM_META = {
  github: {
    name: 'Link GitHub Repository',
    icon: GithubLogo,
    placeholder: 'https://github.com/ten-doi/ten-repo',
    hint: 'Nhập một URL GitHub hợp lệ (bắt đầu bằng https://github.com/).',
  },
  video: {
    name: 'Video demo',
    icon: VideoCamera,
    linkLabel: 'YouTube, Google Drive…',
    accept: ['video/mp4', 'video/quicktime'],
    maxMB: 100,
  },
  slide: {
    name: 'Slide trình bày',
    icon: PresentationChart,
    linkLabel: 'Google Slides, OneDrive…',
    accept: ['application/pdf'],
    maxMB: 20,
  },
}

// ── Khung chung cho 1 hạng mục: icon trạng thái + tên + nội dung ──
function FieldWrap({ itemKey, isFilled, children }) {
  const { icon: Icon, name } = ITEM_META[itemKey]
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <CheckCircle size={28} weight="fill" className={styles.fieldDone} data-on={isFilled} />
        <div className={styles.fieldName}>
          <Icon weight="fill" />
          {name}
          <span className={styles.ast}>*</span>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Trạng thái chưa có dữ liệu (chế độ chỉ xem) ──
function EmptyVal() {
  return (
    <div className={`${styles.controlBox} ${styles.roVal}`}>
      <MinusCircle weight="fill" />
      Đội chưa cung cấp hạng mục này
    </div>
  )
}

// ── Hiển thị 1 link ở chế độ chỉ xem, có nút mở link ngoài — dùng chung cho github & dual field ──
function ReadOnlyLinkField({ itemKey, isFilled, url }) {
  return (
    <FieldWrap itemKey={itemKey} isFilled={isFilled}>
      {url ? (
        <FormInput
          iconLeft={LinkSimple}
          value={url}
          readOnly
          disabled
          iconRight={ArrowSquareOut}
          onIconRightClick={() => window.open(url, '_blank')}
        />
      ) : (
        <EmptyVal />
      )}
    </FieldWrap>
  )
}

function SubmissionForm({
  form,
  setForm,
  errors,
  setErrors,
  validFields,
  setValidFields,
  readOnly,
  isEditable,
  isMember,
  readyCount,
  totalCount,
  isLate,
  isUpdate,
  onSubmit,
  onEdit,
  onCancel,
}) {
  const title = readOnly ? 'Bài nộp hiện tại của đội' : 'Bài nộp của đội'
  const isFilled = (key) => !!validFields[key]

  // Áp kết quả validate (lỗi + trạng thái hợp lệ) cho 1 field — dùng chung cho blur & đổi file
  const applyValidationResult = (key, formState) => {
    const err = validateSubmissionField(key, formState)
    setErrors?.((prev) => ({ ...prev, [key]: err || null }))
    setValidFields?.((prev) => ({ ...prev, [key]: !err }))
  }

  const handleInput = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], value: val } }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
    if (validFields[key]) setValidFields((prev) => ({ ...prev, [key]: false }))
  }

  const handleBlur = (key) => applyValidationResult(key, form)

  const handleMode = (key, mode) => {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], mode } }))
    setValidFields?.((prev) => ({ ...prev, [key]: false }))
  }

  const handleFileChange = (key, file) => {
    const newForm = { ...form, [key]: { ...form[key], file } }
    setForm(newForm)
    // File thì validate ngay, không đợi onBlur như input text
    applyValidationResult(key, newForm)
  }

  const renderGithub = () => {
    const f = form.github
    const err = errors.github

    if (readOnly) {
      return <ReadOnlyLinkField itemKey="github" isFilled={isFilled('github')} url={f.value} />
    }

    return (
      <FieldWrap itemKey="github" isFilled={isFilled('github')}>
        <FormInput
          iconLeft={LinkSimple}
          placeholder={ITEM_META.github.placeholder}
          value={f.value}
          onChange={(e) => handleInput('github', e.target.value)}
          onBlur={() => handleBlur('github')}
          status={err ? 'error' : undefined}
          message={err}
          hint={err ? undefined : ITEM_META.github.hint}
        />
      </FieldWrap>
    )
  }

  // "Dual" = hạng mục cho phép chọn tải file lên HOẶC gắn link ngoài (video, slide)
  const renderDual = (key) => {
    const meta = ITEM_META[key]
    const f = form[key]
    const err = errors[key]

    if (readOnly) {
      const displayUrl = f.value || (f.file ? `https://res.cloudinary.com/seal/raw/upload/v1234567890/${f.file.name}` : '')
      return <ReadOnlyLinkField itemKey={key} isFilled={isFilled(key)} url={displayUrl} />
    }

    return (
      <FieldWrap itemKey={key} isFilled={isFilled(key)}>
        <SegmentedControl
          options={[
            { label: 'Tải file lên', value: 'file', icon: UploadSimple },
            { label: 'Gắn link ngoài', value: 'link', icon: LinkSimple },
          ]}
          value={f.mode}
          onChange={(val) => handleMode(key, val)}
        />
        <div className={styles.fieldControl}>
          {f.mode === 'file' ? (
            <FileUpload
              accept={meta.accept}
              maxSizeMB={meta.maxMB}
              aspectRatio={4}
              value={f.file}
              onFileChange={(file) => handleFileChange(key, file)}
              errorMsg={err}
            />
          ) : (
            <FormInput
              iconLeft={LinkSimple}
              placeholder={`Dán link (${meta.linkLabel})`}
              value={f.value}
              onChange={(e) => handleInput(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              status={err ? 'error' : undefined}
              message={err}
              hint={err ? undefined : `Dán link chia sẻ ở chế độ ai có link đều xem được (${meta.linkLabel}).`}
            />
          )}
        </div>
      </FieldWrap>
    )
  }

  return (
    <div className={styles.card}>
      {/* ── Tiêu đề ── */}
      <div className={styles.cardHead}>
        {readOnly ? <Files weight="fill" size={24} /> : <UploadSimple weight="fill" size={24} />}
        <span className={styles.cardTitle}>{title}</span>
        {readOnly && isEditable && !isMember && (
          <div className={styles.cardSub}>
            <Button label="Chỉnh sửa" icon={PencilSimple} variant="outline" onClick={onEdit} />
          </div>
        )}
      </div>

      {/* ── Các hạng mục bài nộp ── */}
      {renderGithub()}
      {renderDual('video')}
      {renderDual('slide')}

      {isMember && readOnly && (
        <div className={`${styles.controlBox} ${styles.viewOnly}`}>
          <Eye weight="fill" />
          Bạn đang xem với vai trò thành viên — chỉ đội trưởng mới có thể nộp hoặc chỉnh sửa bài của đội.
        </div>
      )}

      {/* ── Tiến độ & hành động nộp bài ── */}
      {!readOnly && (
        <div className={styles.footerArea}>
          <div className={styles.progressArea}>
            <div className={styles.progressTop}>
              <span className={styles.progressLbl}>Hạng mục đã hoàn tất</span>
              <span className={styles.progressCount}>
                {readyCount}/{totalCount}
              </span>
            </div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${(readyCount / totalCount) * 100}%` }} />
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.btnGroup}>
              {isUpdate && <Button label="Huỷ" variant="outline" onClick={onCancel} />}
              <Button
                label={isLate ? (isUpdate ? 'Cập nhật (Muộn)' : 'Nộp bài (Muộn)') : isUpdate ? 'Cập nhật bài nộp' : 'Nộp bài'}
                icon={PaperPlaneTilt}
                iconWeight="fill"
                variant={isLate ? 'orange' : 'primary'}
                onClick={onSubmit}
              />
            </div>
            <span className={styles.note}>Hệ thống chỉ lưu bài nộp cuối cùng làm kết quả chính thức.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubmissionForm