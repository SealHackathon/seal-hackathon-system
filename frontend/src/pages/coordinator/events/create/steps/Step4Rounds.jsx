import { useState } from 'react'
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
    CalendarBlank, MapPin, WifiHigh, Trophy,
    Folder, ArrowCounterClockwise, ListChecks, ClipboardText
} from '@phosphor-icons/react'
import { getRecentLocations, saveRecentLocation } from '../../../../../utils/useRecentLocation'
import styles from './Step4Rounds.module.css'

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
    }
}

const FORMAT_OPTIONS = [
    { value: 'offline', icon: MapPin, label: 'Offline', description: 'Tổ chức trực tiếp tại một địa điểm' },
    { value: 'online', icon: WifiHigh, label: 'Online', description: 'Tổ chức trực tuyến' },
]

const SUBMISSION_OPTIONS = [
    { value: 'new', icon: Folder, label: 'Nộp bài mới', description: 'Các đội nộp bài trong vòng này' },
    { value: 'previous', icon: ArrowCounterClockwise, label: 'Dùng bài vòng trước', description: 'Chấm điểm dựa trên bài đã nộp, không yêu cầu nộp mới' },
]

// ── Form cho 1 vòng thi
function RoundForm({ round, onChange, isLast }) {
    const [recents, setRecents] = useState(() => getRecentLocations())

    function update(field, val) {
        onChange({ ...round, [field]: val })
    }

    function handleLocationChange(place) {
        update('location', place)
        if (place) {
            saveRecentLocation(place)
            setRecents(getRecentLocations())
        }
    }

    // ── Validate thời gian vòng thi
    const endDateError = (() => {
        if (!round.startDate || !round.endDate) return null
        if (round.endDate <= round.startDate) return 'Ngày kết thúc phải sau ngày bắt đầu'
        return null
    })()

    // ── Validate thời gian nộp bài
    const submissionDeadlineError = (() => {
        if (!round.submissionOpen || !round.submissionDeadline) return null
        if (round.submissionDeadline <= round.submissionOpen) return 'Hạn nộp bài phải sau thời điểm mở nộp'
        return null
    })()

    return (

        <div className={styles.roundForm}>

            {/* ============ THÔNG TIN CHUNG ============ */}
            <section>
                <SectionHeader level="h1" title="Thông tin chung" />
                <div className={styles.sectionBody}>

                    <FormInput
                        label="Tên vòng"
                        required
                        hint="Tên vòng cũng hiển thị trên tab bên trên, chỉnh ở đây sẽ tự cập nhật."
                        value={round.name}
                        onChange={e => update('name', e?.target ? e.target.value : e)}
                        placeholder="SEAL Hackathon Summer 2026"
                    />

                    <FieldGroup icon={CalendarBlank} title="Thời gian" required>
                        <DateTimePicker
                            label="Ngày bắt đầu"
                            required
                            value={round.startDate}
                            onChange={val => update('startDate', val)}
                        />
                        <DateTimePicker
                            label="Ngày kết thúc"
                            required
                            value={round.endDate}
                            onChange={val => update('endDate', val)}
                            error={endDateError}
                        />
                    </FieldGroup>

                    <FieldGroup icon={Trophy} title="Trao giải">
                        {isLast ? (
                            <Banner
                                color="orange" variant="solid" icon={Trophy}
                                title="Vòng trao giải"
                                message="Đây là vòng cuối cùng, kết quả sẽ được công bố tại đây."
                            />
                        ) : (
                            <Banner
                                color="blue" variant="flat" icon={Trophy}
                                title="Không phải vòng trao giải"
                                message="Vòng này không phải vòng trao giải, vòng trao giải sẽ là vòng cuối cùng."
                            />
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
                            options={SUBMISSION_OPTIONS}
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
                            <FieldGroup icon={CalendarBlank} title="Thời gian nộp bài">
                                <DateTimePicker
                                    label="Mở nộp bài"
                                    value={round.submissionOpen}
                                    onChange={val => update('submissionOpen', val)}
                                />
                                <DateTimePicker
                                    label="Hạn nộp bài"
                                    required
                                    value={round.submissionDeadline}
                                    onChange={val => update('submissionDeadline', val)}
                                    error={submissionDeadlineError}
                                />
                            </FieldGroup>

                            <FieldGroup icon={ClipboardText} title="Hướng dẫn nộp bài">
                                <RichTextEditor
                                    value={round.submissionGuide}
                                    onChange={html => update('submissionGuide', html)}
                                    placeholder="Mô tả các hạng mục cần nộp và lưu ý"
                                />
                            </FieldGroup>

                            <FieldGroup icon={ListChecks} title="Rubric chấm điểm">
                                <div className={styles.rubricPlaceholder}>
                                    Chọn rubric
                                </div>
                            </FieldGroup>
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
                    />
                </div>
            </section>

        </div>
    )
}

// ── Container chính
function Step4Rounds({ formData, onChange }) {
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

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Thông tin cơ bản</h1>

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
                />
            )}
        </div>
    )
}

export default Step4Rounds
