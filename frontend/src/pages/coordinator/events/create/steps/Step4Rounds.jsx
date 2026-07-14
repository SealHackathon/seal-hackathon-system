import { useState, useEffect, useMemo } from 'react'
import SectionHeader from '../../../../../components/shared/SectionHeader'
import FieldGroup from '../../../../../components/shared/FieldGroup'
import FormInput from '../../../../../components/shared/FormInput'
import RoundTabs from '../../../../../components/shared/RoundTabs'
import RadioCardGroup from '../../../../../components/shared/RadioCardGroup'
import LocationSearch from '../../../../../components/shared/LocationSearch'
import AgendaTable from '../../../../../components/shared/AgendaTable'
import Banner from '../../../../../components/shared/Banner'
import DateTimePicker from '../../../../../components/shared/DateTimePicker'
import RichTextEditor from '../../../../../components/shared/RichTextEditor'
import {
    CalendarBlank, MapPin, Broadcast, Trophy,
    Folder, ArrowCounterClockwise, ListChecks, ClipboardText, Textbox, Trash, Plus
} from '@phosphor-icons/react'
import { getRecentLocations, saveRecentLocation } from '../../../../../utils/useRecentLocation'
import styles from './Step4Rounds.module.css'
import SelectRubricModal from './SelectRubricModal'

// ── Tạo round mới với giá trị mặc định
function createRound(name = 'Vòng mới') {
    return {
        id: Date.now() + Math.random(),
        name,
        startDate: null,
        endDate: null,
        format: 'offline',
        location: null,
        submissionType: 'new',
        submissionOpen: null,
        submissionDeadline: null,
        submissionGuide: '',
        agenda: [],
        meetingLink: '',
        topTeamPass: '',
        rubricId: null,
        locationName: '',
    }
}

const FORMAT_OPTIONS = [
    { value: 'offline', icon: MapPin, label: 'Offline', description: 'Tổ chức trực tiếp tại một địa điểm' },
    { value: 'online', icon: Broadcast, label: 'Online', description: 'Tổ chức trực tuyến' },
]

const SUBMISSION_OPTIONS = [
    { value: 'new', icon: Folder, label: 'Nộp bài mới', description: 'Các đội nộp bài trong vòng này' },
    { value: 'previous', icon: ArrowCounterClockwise, label: 'Dùng bài vòng trước', description: 'Chấm điểm dựa trên bài đã nộp, không yêu cầu nộp mới' },
]

// ── Form cho 1 vòng thi
function RoundForm({ round, onChange, isLast, prevRound, errors, roundIndex, teamDeadline, closeDate, deadlineSameAsClose, highlightRanges, clearError }) {
    const [recents, setRecents] = useState(() => getRecentLocations())
    const [showRubricModal, setShowRubricModal] = useState(false)

    function update(field, val) {
        let updatedRound = { ...round, [field]: val }
        
        // Luôn đồng bộ hoạt động đầu tiên với thời gian bắt đầu vòng thi
        if (field === 'startDate' && val) {
            if (updatedRound.agenda && updatedRound.agenda.length > 0) {
                const newAgenda = [...updatedRound.agenda]
                newAgenda[0] = { ...newAgenda[0], startTime: new Date(val) }
                updatedRound.agenda = newAgenda
            }
        }
        
        onChange(updatedRound)
        clearError?.(`round-${roundIndex}-${field}`)
    }

    function handleLocationChange(place) {
        const updatedRound = { ...round, location: place }
        if (place) {
            if (!round.location || round.location.name !== place.name) {
                updatedRound.locationName = place.name
                clearError?.(`round-${roundIndex}-locationName`)
            }
            saveRecentLocation(place)
            setRecents(getRecentLocations())
        } else {
            updatedRound.locationName = ''
            clearError?.(`round-${roundIndex}-locationName`)
        }
        onChange(updatedRound)
        clearError?.(`round-${roundIndex}-location`)
    }

    // ── Không cho phép nộp bài vòng trước nếu là vòng đầu tiên
    useEffect(() => {
        if (!prevRound && round.submissionType === 'previous') {
            update('submissionType', 'new')
        }
    }, [prevRound, round.submissionType])

    const submissionOptions = SUBMISSION_OPTIONS.map(opt => {
        if (opt.value === 'previous' && !prevRound) {
            return { ...opt, disabled: true, description: 'Chỉ áp dụng từ vòng thứ 2 trở đi' }
        }
        return opt
    })

    // ── Validate ngày bắt đầu so với vòng trước và so với thời gian chốt đội
    const startDateError = errors?.[`round-${roundIndex}-startDate`] || (() => {
        if (!round.startDate) return null
        const start = new Date(round.startDate)

        const lockTime = deadlineSameAsClose === false 
            ? (teamDeadline ? new Date(teamDeadline) : null) 
            : (closeDate ? new Date(closeDate) : null);
        const lockTimeName = deadlineSameAsClose === false ? 'thời gian chốt đội' : 'thời gian đóng đăng ký';

        if (lockTime) {
            if (start <= lockTime) {
                return `Ngày bắt đầu phải sau ${lockTimeName} (${lockTime.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })})`
            }
        }

        if (prevRound && prevRound.endDate) {
            const prevEnd = new Date(prevRound.endDate)
            if (start < prevEnd) {
                return `Ngày bắt đầu phải sau hoặc bằng ngày kết thúc của vòng trước (${prevEnd.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })})`
            }
        }
        return null
    })()

    // ── Validate thời gian vòng thi
    const endDateError = errors?.[`round-${roundIndex}-endDate`] || (() => {
        if (!round.startDate || !round.endDate) return null
        const start = new Date(round.startDate)
        const end = new Date(round.endDate)
        if (end <= start) return 'Thời gian kết thúc phải sau thời gian bắt đầu'
        return null
    })()

    // ── Validate thời gian mở nộp bài
    const submissionOpenError = errors?.[`round-${roundIndex}-submissionOpen`] || (() => {
        if (!round.submissionOpen) return null

        if (!round.startDate) {
            return 'Vui lòng chọn thời gian bắt đầu vòng thi trước'
        }

        const subOpen = new Date(round.submissionOpen)
        if (round.startDate) {
            const start = new Date(round.startDate)
            if (subOpen < start) {
                return 'Thời gian mở nộp bài phải từ thời điểm bắt đầu vòng thi'
            }
        }
        return null
    })()

    // ── Validate thời gian nộp bài
    const submissionDeadlineError = errors?.[`round-${roundIndex}-submissionDeadline`] || (() => {
        if (!round.submissionDeadline) return null
        const subDeadline = new Date(round.submissionDeadline)

        if (!round.startDate || !round.endDate) {
            return 'Vui lòng chọn thời gian bắt đầu và kết thúc vòng thi trước'
        }

        if (round.startDate && round.endDate) {
            const start = new Date(round.startDate)
            const end = new Date(round.endDate)
            if (subDeadline <= start || subDeadline >= end) {
                return 'Hạn nộp bài phải nằm trong thời gian vòng thi'
            }
        }

        if (round.submissionOpen) {
            const subOpen = new Date(round.submissionOpen)
            if (subDeadline <= subOpen) {
                return 'Hạn nộp bài phải sau thời điểm mở nộp'
            }
        }
        return null
    })()

    return (

        <div className={styles.roundForm}>

            {/* ============ THÔNG TIN CHUNG ============ */}
            <section>
                <SectionHeader level="h1" title="Thông tin chung" />
                <div className={styles.sectionBody}>
                    <FieldGroup icon={Textbox} layout='row' title="Tên vòng" required>
                        <FormInput
                            value={round.name}
                            onChange={e => update('name', e?.target ? e.target.value : e)}
                            placeholder="SEAL Hackathon Summer 2026"
                            error={errors?.[`round-${roundIndex}-name`]}
                        />
                    </FieldGroup>
                    <FieldGroup icon={CalendarBlank} layout='row' title="Thời gian" required>
                        <DateTimePicker
                            label="Ngày bắt đầu"
                            required
                            value={round.startDate}
                            onChange={val => update('startDate', val)}
                            error={startDateError}
                            highlightRanges={highlightRanges}
                        />
                        <DateTimePicker
                            label="Ngày kết thúc"
                            required
                            value={round.endDate}
                            onChange={val => update('endDate', val)}
                            error={endDateError}
                            highlightRanges={highlightRanges}
                        />
                    </FieldGroup>

                    <FieldGroup icon={Trophy} title="Trao giải">
                        {isLast ? (
                            <Banner
                                color="green" variant="solid" icon={Trophy}
                                title="Vòng trao giải"
                                message="Đây là vòng cuối cùng, sẽ được dùng để trao giải cho các đội thi."
                            />
                        ) : (
                            <>
                                <Banner
                                    color="blue" variant="flat" icon={Trophy}
                                    title="Không phải vòng trao giải"
                                    message="Vòng này không phải vòng trao giải, vòng trao giải sẽ là vòng cuối cùng."
                                />
                                <div style={{ marginTop: '1rem' }}>
                                    <FormInput
                                        label="Số đội được vào vòng tiếp theo"
                                        type="number"
                                        min={1}
                                        required
                                        placeholder="Ví dụ: 10"
                                        value={round.topTeamPass || ''}
                                        onChange={e => update('topTeamPass', e?.target ? e.target.value : e)}
                                        status={errors?.[`round-${roundIndex}-topTeamPass`] ? 'error' : 'default'}
                                        message={errors?.[`round-${roundIndex}-topTeamPass`]}
                                    />
                                </div>
                            </>
                        )}
                    </FieldGroup>

                </div>
            </section>

            {/* ============ HÌNH THỨC & ĐỊA ĐIỂM ============ */}
            <section>
                <SectionHeader level="h1" title="Hình thức và địa điểm" />
                <div className={styles.sectionBody}>

                    <RadioCardGroup
                        options={FORMAT_OPTIONS}
                        value={round.format}
                        onChange={val => update('format', val)}
                    />

                    {round.format === 'offline' && (
                            <LocationSearch
                                label="Địa điểm tổ chức"
                                required
                                value={round.location}
                                onChange={handleLocationChange}
                                recentPlaces={recents}
                                error={errors?.[`round-${roundIndex}-location`]}
                                renderBelowSearch={
                                    round.location && round.location.lat && round.location.lng ? (
                                        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                            <FormInput
                                                label="Tên địa điểm hiển thị"
                                                labelVariant="small"
                                                required
                                                hint="Tên này sẽ được hiển thị cho thí sinh, thay cho tên địa điểm gốc."
                                                placeholder="Tên địa điểm BTC tự đặt..."
                                                value={round.locationName ?? ''}
                                                onChange={e => update('locationName', e?.target ? e.target.value : e)}
                                                status={errors?.[`round-${roundIndex}-locationName`] ? 'error' : 'default'}
                                                message={errors?.[`round-${roundIndex}-locationName`]}
                                            />
                                        </div>
                                    ) : null
                                }
                            />
                    )}

                    {round.format === 'online' && (
                        <FormInput
                            label="Link tham gia"
                            required
                            hint="Link Zoom, Google Meet hoặc nền tảng họp trực tuyến khác."
                            placeholder="https://meet.google.com/..."
                            value={round.meetingLink ?? ''}
                            onChange={e => update('meetingLink', e?.target ? e.target.value : e)}
                            error={errors?.[`round-${roundIndex}-meetingLink`]}
                        />
                    )}

                </div>
            </section>

            {/* ============ NỘP BÀI & CHẤM ĐIỂM ============ */}
            <section>
                <SectionHeader level="h1" title="Nộp bài và chấm điểm" />
                <div className={styles.sectionBody}>

                    <FieldGroup icon={Folder} title="Cách thức nộp bài" required>
                        <RadioCardGroup
                            options={submissionOptions}
                            value={round.submissionType}
                            onChange={val => update('submissionType', val)}
                        />

                        {round.submissionType === 'previous' && (
                            <Banner
                                color="blue"
                                variant="flat"
                                title="Vòng này sử dụng bài đã nộp từ vòng trước."
                                message="Hướng dẫn nộp bài không áp dụng cho vòng này."
                            />
                        )}
                    </FieldGroup>

                    {round.submissionType === 'new' && (
                        <>
                            <FieldGroup icon={CalendarBlank} layout='row' title="Thời gian nộp bài">
                                <DateTimePicker
                                    label="Mở nộp bài"
                                    value={round.submissionOpen}
                                    onChange={val => update('submissionOpen', val)}
                                    error={submissionOpenError}
                                    status={submissionOpenError ? 'error' : 'default'}
                                    highlightRanges={highlightRanges}
                                />
                                <DateTimePicker
                                    label="Hạn nộp bài"
                                    required
                                    value={round.submissionDeadline}
                                    onChange={val => update('submissionDeadline', val)}
                                    error={submissionDeadlineError}
                                    highlightRanges={highlightRanges}
                                />
                            </FieldGroup>

                            <FieldGroup icon={ClipboardText} title="Hướng dẫn nộp bài">
                                <RichTextEditor
                                    value={round.submissionGuide}
                                    onChange={html => update('submissionGuide', html)}
                                    placeholder="Mô tả các hạng mục cần nộp và lưu ý"
                                />
                            </FieldGroup>

                            <FieldGroup icon={ListChecks} title="Bộ tiêu chí chấm điểm">
                                {round.rubricId ? (
                                    <div className={styles.rubricSelected}>
                                        <div className={styles.rubricInfo}>
                                            <span className={styles.rubricLabel}>{round.rubricName || `Bộ tiêu chí đã chọn`}</span>
                                        </div>
                                        <div className={styles.rubricActions}>
                                            <button className={styles.rubricChangeBtn} onClick={() => setShowRubricModal(true)}>
                                                Thay đổi
                                            </button>
                                            <button className={styles.rubricRemoveBtn} onClick={() => {
                                                onChange({ ...round, rubricId: null, rubricName: null })
                                            }}>
                                                <Trash size={20} weight='fill' />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.rubricPlaceholder} onClick={() => setShowRubricModal(true)}>
                                        <Plus size={20} />
                                        <span>Chọn bộ tiêu chí</span>
                                    </div>
                                )}
                            </FieldGroup>

                            {showRubricModal && (
                                <SelectRubricModal
                                    onClose={() => setShowRubricModal(false)}
                                    selectedRubricId={round.rubricId}
                                    onSelect={(selected) => {
                                        onChange({ ...round, rubricId: selected.id, rubricName: selected.name, criteria: selected.criteria })
                                        setShowRubricModal(false)
                                    }}
                                />
                            )}
                        </>
                    )}

                </div>
            </section>

            {/* ============ LỊCH TRÌNH ============ */}
            <section>
                <SectionHeader level="h1" title="Lịch trình" />
                <div className={styles.sectionBody}>
                    <AgendaTable
                        items={round.agenda}
                        onChange={val => update('agenda', val)}
                        roundStartDate={round.startDate}
                        roundEndDate={round.endDate}
                        highlightRanges={highlightRanges}
                    />
                </div>
            </section>

        </div>
    )
}

// ── Container chính
function Step4Rounds({ formData, onChange, errors, clearError }) {
    // Khởi tạo 1 lần — tránh render loop
    const [rounds, setRounds] = useState(() =>
        formData.rounds?.length
            ? formData.rounds
            : [
                createRound('Vòng Sơ khảo'),
                createRound('Vòng Chung kết'),
            ]
    )
    const [activeId, setActiveId] = useState(() => rounds[0]?.id)

    useEffect(() => {
        if (!formData.rounds?.length) {
            onChange?.({ ...formData, rounds })
        }
    }, [])

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

    function syncAndSet(newRounds) {
        setRounds(newRounds)
        onChange?.({ ...formData, rounds: newRounds })
    }

    function handleAdd() {
        const r = createRound(`Vòng ${rounds.length + 1}`)
        const updated = [...rounds, r]
        syncAndSet(updated)
        setActiveId(r.id)
    }

    function handleDelete(id) {
        const updated = rounds.filter(r => r.id !== id)
        syncAndSet(updated)
        if (id === activeId) setActiveId(updated[updated.length - 1]?.id)
    }

    function handleRoundChange(updated) {
        syncAndSet(rounds.map(r => r.id === updated.id ? updated : r))
    }

    const activeRound = rounds.find(r => r.id === activeId) ?? rounds[0]
    const isLast = rounds[rounds.length - 1]?.id === activeRound?.id
    const activeIndex = rounds.findIndex(r => r.id === activeRound?.id)
    const prevRound = activeIndex > 0 ? rounds[activeIndex - 1] : null

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Vòng thi</h1>

            <Banner
                color="blue" variant="dashed"
                title="Cấu hình vòng thi"
                message="Mỗi vòng thi có thể có hình thức, địa điểm và cách nộp bài riêng. Mặc định vòng cuối cùng sẽ là vòng trao giải."
            />

            <RoundTabs
                rounds={rounds}
                activeId={activeId}
                onSelect={setActiveId}
                onAdd={handleAdd}
                onDelete={handleDelete}
            />

            {activeRound && (
                <RoundForm
                    key={activeRound.id}
                    round={activeRound}
                    onChange={handleRoundChange}
                    isLast={isLast}
                    prevRound={prevRound}
                    roundIndex={activeIndex}
                    errors={errors}
                    teamDeadline={formData.teamDeadline}
                    closeDate={formData.closeDate}
                    deadlineSameAsClose={formData.deadlineSameAsClose}
                    highlightRanges={highlightRanges}
                    clearError={clearError}
                />
            )}
        </div>
    )
}

export default Step4Rounds
