import { useState, useMemo, useEffect } from 'react'
import { UserCircle, TextAlignLeft, Link, Info, ArrowLeft, ArrowRight } from '@phosphor-icons/react'

import ProfileStepper      from '../../../components/shared/ProfileStepper'
import AvatarUpload        from '../../../components/shared/AvatarUpload'
import FormTextarea        from '../../../components/shared/FormTextarea'
import MultiSelectDropdown from '../../../components/shared/MultiSelectDropdown'
import TagPicker           from '../../../components/shared/TagPicker'
import FormInput           from '../../../components/shared/FormInput'
import Banner              from '../../../components/shared/Banner'
import Button              from '../../../components/shared/Button'

import { positionOptions, MAX_POSITIONS } from '../../../data/positionData'
import { topicOptions }                   from '../../../data/tagData'
import { getFilteredSections }            from '../../../data/tagData'

import styles from './Step4PersonalInfo.module.css'

const MAX_TOPICS   = 5
const MAX_TECH     = 10
const MAX_BIO      = 300

// ─────────────────────────────────────────────────────────────
//  Step4PersonalInfo
// ─────────────────────────────────────────────────────────────
function Step4PersonalInfo({ onBack, onSubmit, initialData, onSaveData }) {
    // ── State ──────────────────────────────────────────────
    const [avatar,    setAvatar]    = useState(initialData?.avatar || null)
    const [bio,       setBio]       = useState(initialData?.bio || '')
    const [positions, setPositions] = useState(initialData?.positions || [])    // string[] — position values
    const [techTags,  setTechTags]  = useState(initialData?.techTags || {})    // { sectionId: string[] }
    const [topics,    setTopics]    = useState(initialData?.topics || [])    // string[] — topic values
    const [cvLink,    setCvLink]    = useState(initialData?.cvLink || '')

    // ── Sections hiển thị trong TagPicker ─────────────────
    // Được tính lại mỗi khi positions thay đổi
    const visibleSections = useMemo(
        () => getFilteredSections(positions),
        [positions]
    )

    // Khi positions thay đổi → xóa tech tags của section không còn visible
    useEffect(() => {
        const visibleIds = new Set(visibleSections.map(s => s.id))
        setTechTags(prev => {
            const next = {}
            for (const [id, tags] of Object.entries(prev)) {
                if (visibleIds.has(id)) next[id] = tags
            }
            return next
        })
    }, [visibleSections])

    // ── Kiểm tra có custom position không ─────────────────
    const hasCustomPosition = positions.some(
        p => typeof p === 'string' && p.startsWith('custom:')
    )

    // ── Validation cơ bản ──────────────────────────────────
    const hasPositions   = positions.length > 0
    const techCount      = Object.values(techTags).reduce((s, arr) => s + arr.length, 0)
    const hasTech        = techCount > 0
    const canSubmit      = hasPositions && hasTech

    // ── Handlers ───────────────────────────────────────────
    function handlePositionsChange(newPositions) {
        setPositions(newPositions)
    }

    function saveData() {
        onSaveData?.({ avatar, bio, positions, techTags, topics, cvLink })
    }

    function handleBack() {
        saveData()
        onBack()
    }

    function handleSubmit() {
        if (!canSubmit) return
        onSubmit?.({ avatar, bio, positions, techTags, topics, cvLink })
    }

    return (
        <div className={styles.card}>
            <aside className={styles.sidebar}>
                <ProfileStepper currentStep={4} />
            </aside>

            <div className={`${styles.content} ${'scrollbar'}`}>
                <h1 className={styles.pageTitle}>Hồ sơ cá nhân</h1>

                {/* Info banner */}
                <Banner
                    color="blue"
                    variant="flat"
                    message="Hoàn thiện hồ sơ giúp bạn kết nối với các thành viên phù hợp và tăng cơ hội tìm được đội thi lý tưởng."
                />

                {/* ── Avatar ── */}
                <AvatarUpload
                    value={avatar}
                    onChange={setAvatar}
                />

                {/* ── Tiểu sử ── */}
                <FormTextarea
                    label="Tiểu sử"
                    iconLeft={TextAlignLeft}
                    placeholder="Mình là sinh viên năm 3 CNTT, đam mê xây dựng sản phẩm thực tế và có kinh nghiệm với React, Spring Boot..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    maxLength={MAX_BIO}
                    rows={3}
                />

                {/* ── Vị trí trong đội ── */}
                <MultiSelectDropdown
                    label="Vị trí trong đội"
                    required
                    icon={UserCircle}
                    placeholder="Chọn từ danh sách"
                    options={positionOptions}
                    value={positions}
                    onChange={handlePositionsChange}
                    maxSelect={MAX_POSITIONS}
                    allowCustom
                    customLabel="Không có trong danh sách?"
                />

                {/* Gợi ý khi chọn vị trí thủ công */}
                {hasCustomPosition && (
                    <Banner
                        color="blue"
                        variant="dashed"
                        icon={Info}
                        iconSize={20}
                        message="Lưu ý nhỏ: Nếu chọn vị trí tự nhập, bạn cũng cần tự thêm các công nghệ liên quan ở phần bên dưới."
                    />
                )}

                {/* ── Công nghệ sử dụng ── */}
                {visibleSections.length > 0 ? (
                    <TagPicker
                        label="Công nghệ sử dụng"
                        required
                        maxTotal={MAX_TECH}
                        sections={visibleSections}
                        value={techTags}
                        onChange={setTechTags}
                    />
                ) : (
                    <div className={styles.techPlaceholder}>
                        <p className={styles.techPlaceholderText}>
                            Chọn vị trí trong đội để hiển thị các công nghệ phù hợp.
                        </p>
                    </div>
                )}

                {/* ── Lĩnh vực quan tâm ── */}
                <MultiSelectDropdown
                    label="Lĩnh vực quan tâm"
                    placeholder="Chọn từ danh sách"
                    options={topicOptions}
                    value={topics}
                    onChange={setTopics}
                    maxSelect={MAX_TOPICS}
                />

                {/* ── CV / Portfolio ── */}
                <FormInput
                    label="CV / Portfolio"
                    iconLeft={Link}
                    placeholder="https://github.com/username hoặc link CV của bạn"
                    value={cvLink}
                    onChange={e => setCvLink(e.target.value)}
                />

                {/* Note */}
                <p className={styles.note}>
                    Lưu ý nhỏ: Đảm bảo link được quyền xem công khai trước khi chia sẻ nhé.
                </p>

                {/* ── Footer ── */}
                <div className={styles.footer}>
                    <Button
                        label="Quay lại"
                        variant="outline"
                        icon={ArrowLeft}
                        iconPosition="left"
                        iconSize={20}
                        onClick={handleBack}
                    />
                    <Button
                        label="Xác nhận"
                        icon={ArrowRight}
                        iconPosition="right"
                        iconSize={20}
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    )
}

export default Step4PersonalInfo
