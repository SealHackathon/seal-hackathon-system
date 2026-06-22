import { useState } from 'react'
import FieldGroup from '../../../../../components/shared/FieldGroup'
import FormInput from '../../../../../components/shared/FormInput'
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

function Step1BasicInfo({ formData, onFormChange }) {
    const deadlineSameAsClose = formData.deadlineSameAsClose ?? true

    // Tính lỗi cho closeDate
    const closeDateError = (() => {
        const open = formData.openDate
        const close = formData.closeDate
        if (!open || !close) return null
        if (close <= open) return 'Ngày và giờ đóng phải sau ngày và giờ mở đăng ký'
        return null
    })()

    const teamDeadlineError = (() => {
        const open = formData.openDate
        const close = formData.closeDate
        const deadline = formData.teamDeadline
        if (!deadline) return null
        if (open && deadline <= open) return 'Hạn chốt đội phải sau ngày mở đăng ký'
        if (close && deadline > close) return 'Hạn chốt đội phải trước ngày đóng đăng ký'
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
            <div className={styles.twoCol}>

                {/* ── Cột trái ── */}
                <div className={styles.colLeft}>


                    <FormInput
                        label="Tên sự kiện"
                        required
                        placeholder="VD: SEAL Hackathon Summer 2026"
                        hint="Tên hiển thị công khai trên toàn hệ thống, không thay đổi được sau khi công bố."
                        maxLength={50}
                        showCount
                        value={formData.name ?? ''}
                        onChange={val => handleChange('name', val)}
                    />

                    <FormInput
                        label="Chủ đề"
                        placeholder="VD: AI Agents for Software Innovation"
                        hint="Chủ đề chính của cuộc thi, giúp thí sinh định hướng giải pháp."
                        maxLength={50}
                        showCount
                        value={formData.theme ?? ''}
                        onChange={val => handleChange('theme', val)}
                    />

                    <FormInput
                        label="Mô tả ngắn"
                        placeholder="Giới thiệu ngắn gọn về sự kiện trong 1–2 câu..."
                        hint="Hiển thị dưới tên sự kiện ở trang danh sách và kết quả tìm kiếm."
                        multiline
                        rows={3}
                        maxLength={200}
                        showCount
                        value={formData.shortDesc ?? ''}
                        onChange={val => handleChange('shortDesc', val)}
                    />


                    <FieldGroup icon={TextAlignLeft} title="Mô tả chi tiết">

                        <div className={styles.richTextHeader}>
                            <span className={styles.richTextHint}>
                                Trình bày mục tiêu, đối tượng tham gia và điểm nổi bật của sự kiện.
                            </span>
                            {/* <button type="button" className={styles.btnTemplate}>
                                Tải mẫu có sẵn
                            </button> */}
                        </div>

                        <RichTextEditor
                            value={formData.detailDesc ?? ''}
                            onChange={val => handleChange('detailDesc', val)}
                            placeholder="Mô tả chi tiết về sự kiện..."
                        />

                    </FieldGroup>

                </div>

                {/* ── Cột phải ── */}
                <div className={styles.colRight}>

                    <FieldGroup icon={CalendarBlank} title="Thời gian đăng ký" required>

                        <DateTimePicker
                            label="Ngày mở đăng ký"
                            required
                            value={formData.openDate ?? null}
                            onChange={val => onFormChange?.('openDate', val)}
                            placeholder="Thứ tư, 12/08/2026, 09:00"
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
                            minDate={formData.openDate ?? undefined}
                            minTime={getCloseDateMinTime()}
                            maxTime={new Date(new Date().setHours(23, 59, 0, 0))}
                            error={closeDateError}    
                        />

                    </FieldGroup>

                    <FieldGroup icon={UsersThree} title="Số thành viên mỗi đội" required>

                        <div className={styles.memberRow}>
                            <FormInput
                                label="Tối thiểu"
                                type="number"
                                min={1}
                                value={String(formData.minMembers ?? 3)}
                                onChange={val => handleChange('minMembers', Number(val))}
                            />
                            <FormInput
                                label="Tối đa"
                                type="number"
                                min={1}
                                value={String(formData.maxMembers ?? 4)}
                                onChange={val => handleChange('maxMembers', Number(val))}
                            />
                        </div>

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
                                minDate={formData.openDate ?? undefined}
                                maxDate={formData.closeDate ?? undefined}
                                error={teamDeadlineError}
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

            {/* ════════════════════════
          PHẦN DƯỚI — ẢNH (full width)
      ════════════════════════ */}
            <FieldGroup icon={Image} title="Ảnh đại diện và ảnh bìa">

                {/* Hàng trên: avatar (trái) + hướng dẫn cả 2 (phải) */}
                <div className={styles.imageTopRow}>

                    <div className={styles.avatarUpload}>
                        <FileUpload
                            label="Ảnh đại diện"
                            required
                            accept={['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']}
                            maxSizeMB={5}
                            aspectRatio={1}
                            onFileChange={file => onFormChange?.('avatarFile', file)}
                        />
                    </div>

                    <div className={styles.imageGuide}>
                        <div className={styles.imageGuideItem}>
                            <p className={styles.imageGuideTitle}>Ảnh đại diện sự kiện</p>
                            <p className={styles.imageGuideText}>
                                Hiển thị tại trang danh sách và kết quả tìm kiếm.
                                Nên dùng logo hoặc hình ảnh rõ nét. Tỉ lệ 1:1, tối thiểu 300×300px.
                            </p>
                        </div>
                        <div className={styles.imageGuideItem}>
                            <p className={styles.imageGuideTitle}>Ảnh bìa sự kiện</p>
                            <p className={styles.imageGuideText}>
                                Hiển thị ở đầu trang chi tiết sự kiện. Chọn ảnh ngang, nội dung
                                quan trọng nên đặt ở giữa vì hai cạnh có thể bị cắt trên một số thiết bị.
                                Tỉ lệ 8:1, tối thiểu 1170×156px.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Hàng dưới: thumbnail full width */}
                <FileUpload
                    label="Ảnh bìa"
                    required
                    accept={['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']}
                    maxSizeMB={5}
                    aspectRatio={8 / 1}
                    onFileChange={file => onFormChange?.('coverFile', file)}
                />

            </FieldGroup>

        </div>
    )
}

export default Step1BasicInfo