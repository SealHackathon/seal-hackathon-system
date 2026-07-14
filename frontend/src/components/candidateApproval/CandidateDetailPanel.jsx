import { useState, useEffect } from 'react'
import {
    X, IdentificationCard, Student, User, Calendar, GenderIntersex,
    MapPin, Buildings, IdentificationBadge, UsersThree, Image as ImageIcon,
    Prohibit, Trash, CaretDown, CaretUp, XCircle, ArrowUUpLeft,
    Code, Heart, SuitcaseSimple, Link
} from '@phosphor-icons/react'
import Button from '../shared/Button'
import Badge from '../shared/Badge'
import SegmentedControl from '../shared/SegmentedControl'
import { getStatusMeta } from './candidateStatus'
import styles from './CandidateDetailPanel.module.css'

// ─────────────────────────────────────────────
//  InfoField — 1 cặp nhãn + giá trị (chỉ xem), có icon phía trước
// ─────────────────────────────────────────────
function InfoField({ label, value, icon: Icon, full }) {
    return (
        <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
            <span className={styles.fieldLabel}>{label}</span>
            <div className={styles.fieldValue}>
                {Icon && <Icon size={24} weight="duotone" />}
                <span>{value || '—'}</span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
//  SectionBanner — thanh tiêu đề section màu xanh
// ─────────────────────────────────────────────
function SectionBanner({ icon: Icon, title }) {
    return (
        <div className={styles.banner}>
            {Icon && <Icon size={20} weight="fill" />}
            <span>{title}</span>
        </div>
    )
}

// ─────────────────────────────────────────────
//  ImageBox — khung ảnh (CCCD, thẻ sinh viên). Bấm để mở tab mới.
// ─────────────────────────────────────────────
function ImageBox({ src, alt }) {
    return (
        <div
            className={styles.imageBox}
            onClick={() => src && window.open(src, '_blank', 'noopener')}
        >
            {src
                ? <img src={src} alt={alt} />
                : <ImageIcon size={40} weight="fill" className={styles.imagePlaceholder} />
            }
        </div>
    )
}

/**
 * CandidateDetailPanel — panel trượt từ phải để xem & duyệt thông tin thí sinh.
 *
 * @param {Object}   candidate           — dữ liệu thí sinh (null = đóng)
 * @param {Function} onClose
 * @param {Function} [onApprove]         — callback(candidate)
 * @param {Function} [onReject]          — callback(candidate)
 * @param {Function} [onRevokeApproval]  — callback(candidate)
 * @param {Function} [onLock]            — callback(candidate)
 * @param {Function} [onDelete]          — callback(candidate)
 */
function CandidateDetailPanel({
    candidate,
    onClose,
    onApprove,
    onReject,
    onRevokeApproval,
    onLock,
    onDelete,
}) {
    const [tab, setTab] = useState('account')      // 'account' | 'profile'
    const [approvalOpen, setApprovalOpen] = useState(true)
    const [closing, setClosing] = useState(false)

    // Khóa cuộn trang khi mở panel
    useEffect(() => {
        if (candidate) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [candidate])

    if (!candidate) return null

    const st = getStatusMeta(candidate.status)
    const cccd = candidate.cccd ?? {}
    const student = candidate.student ?? {}
    const isApproved = candidate.status === 'approved'

    // ── Đóng có animation trượt ra ──
    function handleClose() {
        setClosing(true)
        setTimeout(() => { onClose?.(); setClosing(false) }, 240)
    }

    function act(fn) {
        return () => { fn?.(candidate); handleClose() }
    }

    return (
        <div className={styles.overlay} onClick={handleClose} data-lenis-prevent="true">
            <aside
                className={`${styles.panel} ${closing ? styles.panelClosing : ''}`}
                onClick={e => e.stopPropagation()}
                data-lenis-prevent="true"
            >
                {/* ── Header ── */}
                <div className={styles.header}>
                    <h3 className={styles.headerTitle}>Thông tin chi tiết thí sinh</h3>
                    <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
                        <X size={22} weight="bold" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className={styles.body} data-lenis-prevent="true">

                    {/* Hồ sơ tóm tắt */}
                    <div className={styles.profile}>
                        {candidate.avatarUrl
                            ? <img className={styles.profileAvatar} src={candidate.avatarUrl} alt="" />
                            : <span className={styles.profileAvatar} />
                        }
                        <div>
                            <h4 className={styles.profileName}>{candidate.name}</h4>
                            <div className={styles.profileContact}>
                                <span>{candidate.email}</span>
                                <span>{candidate.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabsWrapper}>
                        <SegmentedControl
                            options={[
                                { value: 'account', label: 'Thông tin tài khoản' },
                                { value: 'profile', label: 'Thông tin hồ sơ' }
                            ]}
                            value={tab}
                            onChange={setTab}
                        />
                    </div>

                    {/* ── Tab: Thông tin tài khoản ── */}
                    {tab === 'account' && (
                        <>
                            <div className={styles.metaGrid}>
                                <InfoField label="Ngày tham gia" value={candidate.joinedAt} icon={Calendar} />
                                <div className={styles.field}>
                                    <span className={styles.fieldLabel}>Trạng thái</span>
                                    <div>
                                        <Badge variant={st.variant} label={st.label} size="md" />
                                    </div>
                                </div>
                                <InfoField label="Vai trò" value={candidate.role} icon={IdentificationBadge} />
                                <InfoField label="Đội thi" value={candidate.team} icon={UsersThree} />
                            </div>

                            {/* Thông tin CCCD */}
                            <div className={styles.section}>
                                <SectionBanner icon={IdentificationCard} title="Thông tin CCCD" />
                                <div className={styles.imageRow}>
                                    <ImageBox src={cccd.frontImage} alt="Mặt trước CCCD" />
                                    <ImageBox src={cccd.backImage} alt="Mặt sau CCCD" />
                                </div>
                                <div className={styles.metaGrid}>
                                    <InfoField label="Họ và tên" value={cccd.fullName} icon={User} />
                                    <InfoField label="Số CCCD" value={cccd.number} icon={IdentificationCard} />
                                    <InfoField label="Ngày tháng năm sinh" value={cccd.dob} icon={Calendar} />
                                    <InfoField label="Giới tính" value={cccd.gender} icon={GenderIntersex} />
                                    <InfoField label="Địa chỉ thường trú" value={cccd.address} icon={MapPin} full />
                                </div>
                            </div>

                            {/* Thông tin sinh viên */}
                            <div className={styles.section}>
                                <SectionBanner icon={Student} title="Thông tin sinh viên" />
                                <div className={styles.metaGrid}>
                                    <InfoField label="Mã số sinh viên" value={student.studentId} icon={IdentificationBadge} />
                                    <div className={styles.field}>
                                        <span className={styles.fieldLabel}>Thẻ sinh viên</span>
                                        <ImageBox src={student.cardImage} alt="Thẻ sinh viên" />
                                    </div>
                                    <InfoField label="Trường đại học" value={student.university} icon={Buildings} full />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Tab: Thông tin hồ sơ ── */}
                    {tab === 'profile' && (
                        <div className={styles.profileBottomSection}>
                            {/* Bio */}
                            <div className={styles.bioSection}>
                                <div className={styles.sectionHeader}>
                                    <User size={24} weight="duotone" className={styles.sectionIcon} />
                                    <p className={styles.sectionTitle}>Tiểu sử</p>
                                </div>
                                {candidate.profile?.bio ? (
                                    <p className={styles.bioText}>{candidate.profile.bio}</p>
                                ) : (
                                    <p className={styles.emptyText}>Thí sinh chưa cập nhật tiểu sử.</p>
                                )}
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.tagsGrid}>
                                {/* Tech Tags */}
                                <div className={styles.profileTagSection}>
                                    <div className={styles.sectionHeader}>
                                        <Code size={24} weight="duotone" className={styles.sectionIcon} />
                                        <p className={styles.sectionTitle}>Công nghệ sử dụng</p>
                                    </div>
                                    {candidate.profile?.techTags && Object.values(candidate.profile.techTags).flat().length > 0 ? (
                                        <div className={styles.tagsContainer}>
                                            {Object.values(candidate.profile.techTags).flat().map((tag, idx) => (
                                                <span key={idx} className={`${styles.badgeItem} ${styles.blueBadge}`}>{tag}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.emptyText}>Chưa có thông tin</p>
                                    )}
                                </div>

                                {/* Topics */}
                                <div className={`${styles.profileTagSection} ${styles.orange}`}>
                                    <div className={styles.sectionHeader}>
                                        <Heart size={24} weight="duotone" className={styles.sectionIcon} />
                                        <p className={styles.sectionTitle}>Lĩnh vực quan tâm</p>
                                    </div>
                                    {candidate.profile?.topics?.length > 0 ? (
                                        <div className={styles.tagsContainer}>
                                            {candidate.profile.topics.map((topic, idx) => (
                                                <span key={idx} className={`${styles.badgeItem} ${styles.orangeBadge}`}>{topic}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.emptyText}>Chưa có thông tin</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.divider} />
                            
                            <div className={styles.tagsGrid}>
                                {/* Positions */}
                                <div className={styles.profileTagSection}>
                                    <div className={styles.sectionHeader}>
                                        <SuitcaseSimple size={24} weight="duotone" className={styles.sectionIcon} />
                                        <p className={styles.sectionTitle}>Vị trí</p>
                                    </div>
                                    {candidate.profile?.positions?.length > 0 ? (
                                        <div className={styles.tagsContainer}>
                                            {candidate.profile.positions.map((pos, idx) => (
                                                <span key={idx} className={`${styles.badgeItem} ${styles.blueBadge}`}>{pos}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.emptyText}>Chưa có thông tin</p>
                                    )}
                                </div>

                                {/* CV */}
                                <div className={styles.profileTagSection}>
                                    <div className={styles.sectionHeader}>
                                        <Link size={24} weight="duotone" className={styles.sectionIcon} />
                                        <p className={styles.sectionTitle}>CV / Portfolio</p>
                                    </div>
                                    {candidate.profile?.cvLink ? (
                                        <a href={candidate.profile.cvLink} target="_blank" rel="noreferrer" className={styles.cvLink}>Xem chi tiết</a>
                                    ) : (
                                        <p className={styles.emptyText}>Chưa cập nhật</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer hành động ── */}
                <div className={styles.footer}>
                    {/* Hộp xử lý yêu cầu xét duyệt (thu gọn được) */}
                    <div className={styles.approvalBox}>
                        <button
                            type="button"
                            className={styles.approvalHead}
                            onClick={() => setApprovalOpen(o => !o)}
                        >
                            <span>Xử lý yêu cầu xét duyệt tài khoản</span>
                            {approvalOpen
                                ? <CaretUp size={18} weight="bold" />
                                : <CaretDown size={18} weight="bold" />
                            }
                        </button>
                        {approvalOpen && (
                            <div className={styles.approvalBody}>
                                <Button
                                    className={styles.fullBtn}
                                    label="Từ chối"
                                    labelSize={16}
                                    color="grey"
                                    variant="outline"
                                    onClick={act(onReject)}
                                />
                                {isApproved ? (
                                    <Button
                                        className={styles.fullBtn}
                                        label="Hủy chấp nhận"
                                        labelSize={16}
                                        color="orange"
                                        variant="outline"
                                        icon={ArrowUUpLeft}
                                        onClick={act(onRevokeApproval)}
                                    />
                                ) : (
                                    <Button
                                        className={styles.fullBtn}
                                        label="Chấp nhận"
                                        labelSize={16}
                                        color="green"
                                        onClick={act(onApprove)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default CandidateDetailPanel
