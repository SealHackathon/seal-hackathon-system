import { useState, useMemo } from 'react'
import FieldGroup from '../../../../../components/shared/FieldGroup'
import FormInput from '../../../../../components/shared/FormInput'
import FormTextarea from '../../../../../components/shared/FormTextarea'
import RichTextEditor from '../../../../../components/shared/RichTextEditor'
import FileUpload from '../../../../../components/shared/FileUpload'
import DateTimePicker from '../../../../../components/shared/DateTimePicker'
import ToggleSwitch from '../../../../../components/shared/ToggleSwitch'
import MultiSelectDropdown from '../../../../../components/shared/MultiSelectDropdown'
import {
    TextAlignLeft, CalendarBlank, UsersThree,
    Flag, Tag, Image
} from '@phosphor-icons/react'
import styles from './Step1BasicInfo.module.css'

const KEYWORD_OPTIONS = [
    { value: 'ai', label: 'AI' },
    { value: 'rag', label: 'RAG' },
    { value: 'agent', label: 'Agent' },
    { value: 'web', label: 'Web' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'iot', label: 'IoT' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'devops', label: 'DevOps' },
]

function Step1BasicInfo({ formData, onFormChange, errors = {} }) {
    const deadlineSameAsClose = formData.deadlineSameAsClose ?? true

    const highlightRanges = useMemo(() => {
        const ranges = []
        if (formData.openDate && formData.closeDate) {
            ranges.push({
                start: formData.openDate,
                end: formData.closeDate,
                colorType: 'registration',
                label: 'Thời gian đăng ký'
            })
        }
        if (formData.rounds && formData.rounds.length > 0) {
            formData.rounds.forEach(round => {
                if (round.startDate && round.endDate) {
                    ranges.push({
                        start: round.startDate,
                        end: round.endDate,
                        colorType: 'round',
                        label: 'Vòng thi'
                    })
                }
            })
        }
        return ranges
    }, [formData.openDate, formData.closeDate, formData.rounds])

    // Tính lỗi cho closeDate
    const closeDateError = (() => {
        if (errors.closeDate) return errors.closeDate
        const open = formData.openDate
        const close = formData.closeDate
        if (!open || !close) return null
        if (close <= open) return 'Ngày và giờ đóng phải sau ngày và giờ mở đăng ký'
        return null
    })()

    const teamDeadlineError = (() => {
        if (errors.teamDeadline) return errors.teamDeadline
        const close = formData.closeDate
        const deadline = formData.teamDeadline
        if (!deadline) return null
        if (close && deadline < close) return 'Hạn chốt đội phải sau hoặc bằng thời gian đóng đăng ký'
        return null
    })()

    const minMemberError = (() => {
        if (errors.minMembers) return errors.minMembers
        const min = formData.minMembers
        const max = formData.maxMembers
        if (!min || !max) return null
        if (Number(min) >= Number(max)) return 'Tối thiểu phải nhỏ hơn tối đa'
        return null
    })()

    const maxMemberError = (() => {
        if (errors.maxMembers) return errors.maxMembers
        const min = formData.minMembers
        const max = formData.maxMembers
        if (!min || !max) return null
        if (Number(max) <= Number(min)) return 'Tối đa phải lớn hơn tối thiểu'
        return null
    })()


    // Normalize: FormInput có thể trả về string hoặc event object
    function handleChange(field, val) {
        const value = val?.target ? val.target.value : val
        onFormChange?.(field, value)
    }

    function handleDeadlineToggle(val) {
        onFormChange?.('deadlineSameAsClose', val)
        if (val) {
            onFormChange?.('teamDeadline', formData.closeDate ?? null)
        } else {
            onFormChange?.('teamDeadline', null)
        }
    }

    function getCloseDateMinTime() {
        const open = formData.openDate
        const close = formData.closeDate

        if (!open) return new Date(new Date().setHours(0, 0, 0, 0))

        const sameDay = close &&
            open.getFullYear() === close.getFullYear() &&
            open.getMonth() === close.getMonth() &&
            open.getDate() === close.getDate()

        return sameDay
            ? open                                            // cùng ngày → giờ phải >= openDate
            : new Date(new Date().setHours(0, 0, 0, 0))       // khác ngày → từ 00:00
    }


    return (
        <div className={styles.wrapper}>

            <h1 className={styles.title}>Thông tin cơ bản</h1>

            {/* ════════════════════════
                    PHẦN TRÊN — 2 CỘT
             ════════════════════════ */}
            <div className={styles.contentWrapper}>
                <div className={styles.twoCol}>

                    {/* ── Cột trái ── */}
                <div className={styles.colLeft}>

                    <FieldGroup icon={TextAlignLeft} title="Tổng quan sự kiện" required>

                        <FormInput
                            label="Tên sự kiện"
                            labelColorVariant="primary"
                            required
                            placeholder="VD: SEAL Hackathon Summer 2026"
                            maxLength={50}
                            showCount
                            value={formData.name ?? ''}
                            onChange={val => handleChange('name', val)}
                            status={errors.name ? 'error' : 'default'}
                            message={errors.name}
                        />

                        <FormInput
                            label="Chủ đề"
                            labelColorVariant="primary"
                            placeholder="VD: AI Agents for Software Innovation"
                            hint="Chủ đề chính của cuộc thi, giúp thí sinh định hướng giải pháp."
                            maxLength={50}
                            showCount
                            value={formData.theme ?? ''}
                            onChange={val => handleChange('theme', val)}
                        />

                        <FormTextarea
                            className={styles.textArea}
                            labelColorVariant="primary"
                            label="Mô tả ngắn"
                            placeholder="Giới thiệu ngắn gọn về sự kiện trong 1–2 câu..."
                            hint="Hiển thị dưới tên sự kiện ở trang danh sách và kết quả tìm kiếm."
                            multiline
                            rows={3}
                            maxLength={300}
                            showCount
                            value={formData.shortDesc ?? ''}
                            onChange={val => handleChange('shortDesc', val)}
                        />

                    </FieldGroup>

                    <FieldGroup icon={Flag} title="Mô tả chi tiết">

                        <div className={styles.richTextHeader}>
                            <span className={styles.richTextHint}>
                                Trình bày mục tiêu, đối tượng tham gia và điểm nổi bật của sự kiện.
                            </span>
                        </div>

                        <RichTextEditor
                            value={formData.detailDesc ?? ''}
                            onChange={val => handleChange('detailDesc', val)}
                            placeholder="Mô tả chi tiết về sự kiện..."
                        />

                    </FieldGroup>

                </div>

                <div className={styles.verticalDivider} />

                {/* ── Cột phải ── */}
                <div className={styles.colRight}>

                    <FieldGroup icon={CalendarBlank} title="Thời gian đăng ký" required>

                        <DateTimePicker
                            label="Ngày mở đăng ký"
                            required
                            value={formData.openDate ?? null}
                            onChange={val => onFormChange?.('openDate', val)}
                            placeholder="Thứ tư, 12/08/2026, 09:00"
                            error={errors.openDate}
                            highlightRanges={highlightRanges}
                        />

                        <DateTimePicker
                            label="Ngày đóng đăng ký"
                            required
                            value={formData.closeDate ?? null}
                            onChange={val => {
                                onFormChange?.('closeDate', val)
                                if (deadlineSameAsClose) onFormChange?.('teamDeadline', val)
                            }}
                            placeholder="Thứ sáu, 14/08/2026, 23:59"
                            // * Chọn -> Validate -> Thông báo; không dùng cách giới hạn không cho chọn nữa
                            // minDate={formData.openDate ?? undefined}
                            // minTime={getCloseDateMinTime()}
                            // maxTime={new Date(new Date().setHours(23, 59, 0, 0))}
                            error={closeDateError}
                            highlightRanges={highlightRanges}
                        />

                    </FieldGroup>

                    <FieldGroup icon={UsersThree} layout='row' title="Số thành viên mỗi đội" required>

                        
                            <FormInput
                                label="Tối thiểu"
                                labelVariant='small'
                                placeholder={3}
                                type="number"
                                min={1}
                                value={formData.minMembers ?? ''}
                                onChange={val => {
                                    const raw = val?.target ? val.target.value : val
                                    if (raw !== '' && Number(raw) < 1) return
                                    onFormChange('minMembers', raw === '' ? '' : Number(raw))
                                }}
                                onKeyDown={e => {
                                    if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                                        e.preventDefault()
                                    }
                                }}
                                status={minMemberError ? 'error' : 'default'}
                                message={minMemberError}
                            />
                            <FormInput
                                label="Tối đa"
                                labelVariant='small'
                                placeholder={5}
                                type="number"
                                min={1}
                                value={formData.maxMembers ?? ''}
                                onChange={val => {
                                    const raw = val?.target ? val.target.value : val
                                    if (raw !== '' && Number(raw) < 1) return
                                    onFormChange('maxMembers', raw === '' ? '' : Number(raw))
                                }}
                                onKeyDown={e => {
                                    if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                                        e.preventDefault()
                                    }
                                }}
                                status={maxMemberError ? 'error' : 'default'}
                                message={maxMemberError}
                            />
                        

                    </FieldGroup>

                    <FieldGroup icon={Flag} title="Hạn chốt đội">

                        <ToggleSwitch
                            label="Giống với ngày đóng đăng ký"
                            description="Thí sinh có thể đăng ký trước, tìm đội và chốt thành viên sau."
                            checked={deadlineSameAsClose}
                            onChange={handleDeadlineToggle}
                        />

                        {!deadlineSameAsClose && (
                            <DateTimePicker
                                value={formData.teamDeadline ?? null}
                                onChange={val => onFormChange?.('teamDeadline', val)}
                                placeholder="Thứ ba, 20/08/2026, 23:59"

                                // * Chọn -> Validate -> Thông báo; không dùng cách giới hạn không cho chọn nữa
                                // minDate={
                                //     formData.closeDate
                                //         ? new Date(new Date(formData.closeDate).setHours(0, 0, 0, 0))
                                //         : undefined
                                // }
                                
                                error={teamDeadlineError}
                                highlightRanges={highlightRanges}
                            />
                        )}

                    </FieldGroup>

                    <FieldGroup icon={Tag} title="Từ khóa">

                        <MultiSelectDropdown
                            placeholder="Chọn hoặc nhập từ khóa..."
                            options={KEYWORD_OPTIONS}
                            value={formData.keywords ?? []}
                            onChange={val => onFormChange?.('keywords', val)}
                            allowCustom
                            customLabel="Từ khóa khác"
                            searchable
                        />

                    </FieldGroup>

                </div>
            </div>

            <div className={styles.horizontalDivider} />

            {/* ════════════════════════
          PHẦN DƯỚI — ẢNH (full width)
      ════════════════════════ */}
            <FieldGroup icon={Image} title="Ảnh đại diện và ảnh bìa">

                <div className={styles.imageGuide}>
                    <div className={styles.imageGuideItem}>
                        <p className={styles.imageGuideTitle}>Ảnh đại diện sự kiện</p>
                        <p className={styles.imageGuideText}>
                            Hiển thị tại trang danh sách và kết quả tìm kiếm. Tỉ lệ 1:1, tối thiểu 300×300px.
                        </p>
                    </div>
                    <div className={styles.imageGuideItem}>
                        <p className={styles.imageGuideTitle}>Ảnh bìa sự kiện</p>
                        <p className={styles.imageGuideText}>
                            Hiển thị ở đầu trang chi tiết sự kiện. Chọn ảnh ngang, nội dung quan trọng nên đặt ở giữa vì hai cạnh có thể bị cắt trên một số thiết bị. Tỉ lệ 8:1, tối thiểu 1170×156px.
                        </p>
                    </div>
                </div>

                <div className={styles.imageUploadRow}>
                    <FileUpload
                        label="Ảnh đại diện"
                        required
                        accept={['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']}
                        maxSizeMB={5}
                        aspectRatio={1}
                        value={formData.avatarFile}
                        onFileChange={file => onFormChange?.('avatarFile', file)}
                        errorMsg={errors.avatarFile}
                    />
                    
                    <FileUpload
                        label="Ảnh bìa"
                        required
                        accept={['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']}
                        maxSizeMB={5}
                        aspectRatio={2.63 / 1}
                        value={formData.coverFile}
                        onFileChange={file => onFormChange?.('coverFile', file)}
                        errorMsg={errors.coverFile}
                    />
                </div>

            </FieldGroup>
            
            </div>

        </div>
    )
}

export default Step1BasicInfo