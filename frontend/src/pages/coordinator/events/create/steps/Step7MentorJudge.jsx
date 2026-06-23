import { useState } from 'react'
import { Info, PaperPlaneTilt, Plus } from '@phosphor-icons/react'
import SectionHeader from '../../../../../components/shared/SectionHeader'
import Banner from '../../../../../components/shared/Banner'
import Button from '../../../../../components/shared/Button'
import MentorRow from '../../../../../components/coordinator/events/create/MentorRow'
import JudgeRow from '../../../../../components/coordinator/events/create/JudgeRow'
import AddPersonModal from '../../../../../components/coordinator/events/create/AddPersonModal'
import styles from './Step7MentorJudge.module.css'
import axiosClient from '../../../../../api/axiosClient'
// ── Mock — thực tế gọi API từ backend
async function fetchLecturers(query) {
    const res = await axiosClient.get('/user/lecturers', { params: { q: query } })
    return res.data
}
function createMentor(person) {
    return { ...person, categoryId: null, inviteStatus: 'pending', inviteSentAt: null }
}
function createJudge(person) {
    return { ...person, categoryIds: [], roundIds: [], inviteStatus: 'pending', inviteSentAt: null }
}
​
/**
 * Step7MentorJudge
 * Props:
 *   formData : { mentors[], judges[], rounds[], categories[] }
 *   onFormChange : (field, value) => void
 */
function Step7MentorJudge({ formData, onFormChange }) {
    // ── Local state — giống pattern Step6Timeline
    const [mentors, setMentors] = useState(() => formData?.mentors ?? [])
    const [judges,  setJudges]  = useState(() => formData?.judges  ?? [])
​
    const categories = (formData?.categories ?? [])
        .filter(c => c.name?.trim())
        .map(c => ({ value: c.id ?? c, label: c.name ?? c }))
    const rounds     = (formData?.rounds     ?? [])
        .filter(r => r.name?.trim())
        .map(r => ({ value: r.id ?? r, label: r.name ?? r }))
​
    // Modal state
    const [modal,     setModal]     = useState(null)  // null | 'mentor' | 'judge'
    const [persons,   setPersons]   = useState([])
    const [searching, setSearching] = useState(false)
​
    async function handleSearch(query) {
        setSearching(true)
        const results = await fetchLecturers(query)
        setPersons(results)
        setSearching(false)
    }
​
    function openModal(role) {
        setPersons([])
        setModal(role)
        handleSearch('')
    }
​
    // ── Sync helpers — cập nhật local state và đẩy lên formData
    function syncMentors(next) {
        setMentors(next)
        onFormChange?.('mentors', next)
    }
    function syncJudges(next) {
        setJudges(next)
        onFormChange?.('judges', next)
    }
​
    // ── Mentor handlers
    function addMentors(selected) {
        const existing = new Set(mentors.map(m => m.id))
        const newOnes  = selected.filter(p => !existing.has(p.id)).map(createMentor)
        syncMentors([...mentors, ...newOnes])
    }
    function updateMentor(updated) {
        syncMentors(mentors.map(m => m.id === updated.id ? updated : m))
    }
    function deleteMentor(id) {
        syncMentors(mentors.filter(m => m.id !== id))
    }
    function sendInvite(id) {
        syncMentors(mentors.map(m => m.id === id
            ? { ...m, inviteStatus: 'sent', inviteSentAt: new Date().toISOString() }
            : m
        ))
        // TODO: api.post(`/mentors/${id}/invite`)
    }
    function withdrawMentorInvite(id) {
        syncMentors(mentors.map(m => m.id === id
            ? { ...m, inviteStatus: 'pending', inviteSentAt: null }
            : m
        ))
        // TODO: api.delete(`/mentors/${id}/invite`)
    }
    const pendingMentors = mentors.filter(m => m.inviteStatus === 'pending')
    function sendAllPendingMentors() {
        const now = new Date().toISOString()
        syncMentors(mentors.map(m =>
            m.inviteStatus === 'pending' ? { ...m, inviteStatus: 'sent', inviteSentAt: now } : m
        ))
        // TODO: api.post('/mentors/invite-bulk', { ids: pendingMentors.map(m => m.id) })
    }
​
    // ── Judge handlers
    function addJudges(selected) {
        const existing = new Set(judges.map(j => j.id))
        const newOnes  = selected.filter(p => !existing.has(p.id)).map(createJudge)
        syncJudges([...judges, ...newOnes])
    }
    function updateJudge(updated) {
        syncJudges(judges.map(j => j.id === updated.id ? updated : j))
    }
    function deleteJudge(id) {
        syncJudges(judges.filter(j => j.id !== id))
    }
    function withdrawJudgeInvite(id) {
        syncJudges(judges.map(j => j.id === id
            ? { ...j, inviteStatus: 'pending', inviteSentAt: null }
            : j
        ))
        // TODO: api.delete(`/judges/${id}/invite`)
    }
    function sendJudgeInvite(id) {
        syncJudges(judges.map(j => j.id === id
            ? { ...j, inviteStatus: 'sent', inviteSentAt: new Date().toISOString() }
            : j
        ))
        // TODO: api.post(`/judges/${id}/invite`)
    }
    const pendingJudges = judges.filter(j => j.inviteStatus === 'pending')
    function sendAllPendingJudges() {
        const now = new Date().toISOString()
        syncJudges(judges.map(j =>
            j.inviteStatus === 'pending' ? { ...j, inviteStatus: 'sent', inviteSentAt: now } : j
        ))
        // TODO: api.post('/judges/invite-bulk', { ids: pendingJudges.map(j => j.id) })
    }
​
    // ── Table column headers
    const MENTOR_COLS = ['MENTOR', 'HẠNG MỤC PHỤ TRÁCH', 'LỜI MỜI']
    const JUDGE_COLS  = ['GIÁM KHẢO', 'HẠNG MỤC', 'VÒNG PHỤ TRÁCH', 'LỜI MỜI']
​
    return (
        <div className={styles.wrapper}>
            <SectionHeader level="h1" title="Mentor & Giám khảo" />
​
            <Banner
                color="blue" variant="flat" icon={Info} iconSize={20}
                detail="Sau khi tạo sự kiện, bạn có thể assign mentor cho từng đội cụ thể trong trang Quản lý sự kiện."
            />
​
            {/* ── Mentor section ── */}
            <div className={styles.section}>
                <div className={styles.sectionHead}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionName}>Mentor</span>
                        <span className={styles.countBadge}>{mentors.length}</span>
                        {pendingMentors.length > 0 && (
                            <span className={styles.pendingBadge}>{pendingMentors.length} chưa mời</span>
                        )}
                    </div>
                    <Button
                        label="Thêm Mentor"
                        variant="outline" color="blue"
                        labelSize={14} icon={Plus} iconSize={14}
                        onClick={() => openModal('mentor')}
                    />
                </div>
                <p className={styles.sectionSub}>Phân công mentor cho từng hạng mục thi.</p>

                {mentors.length > 0 && (
                    <div className={styles.table}>
                        <div className={`${styles.tableHeader} ${styles.mentorGrid}`}>
                            {MENTOR_COLS.map(c => <span key={c} className={styles.colLabel}>{c}</span>)}
                        </div>
                        {mentors.map(m => (
                            <MentorRow
                                key={m.id}
                                mentor={m}
                                categories={categories}
                                onChange={updateMentor}
                                onDelete={() => deleteMentor(m.id)}
                                onSendInvite={() => sendInvite(m.id)}
                                onWithdrawInvite={() => withdrawMentorInvite(m.id)}
                            />
                        ))}
                    </div>
                )}

                {pendingMentors.length > 0 && (
                    <div className={styles.bulkRow}>
                        <Button
                            label={`Gửi lời mời cho ${pendingMentors.length} người chưa được mời`}
                            variant="outline" color="blue" labelSize={14}
                            icon={PaperPlaneTilt} iconPosition="left" iconSize={14}
                            onClick={sendAllPendingMentors}
                        />
                    </div>
                )}
            </div>

            {/* ── Judge section ── */}
            <div className={styles.section}>
                <div className={styles.sectionHead}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionName}>Giám khảo</span>
                        <span className={styles.countBadge}>{judges.length}</span>
                        {pendingJudges.length > 0 && (
                            <span className={styles.pendingBadge}>{pendingJudges.length} chưa mời</span>
                        )}
                    </div>
                    <Button
                        label="Thêm Giám khảo"
                        variant="outline" color="blue"
                        labelSize={14} icon={Plus} iconSize={14}
                        onClick={() => openModal('judge')}
                    />
                </div>
                <p className={styles.sectionSub}>Phân công giám khảo theo hạng mục và vòng thi.</p>

                {judges.length > 0 && (
                    <div className={styles.table}>
                        <div className={`${styles.tableHeader} ${styles.judgeGrid}`}>
                            {JUDGE_COLS.map(c => <span key={c} className={styles.colLabel}>{c}</span>)}
                        </div>
                        {judges.map(j => (
                            <JudgeRow
                                key={j.id}
                                judge={j}
                                categories={categories}
                                rounds={rounds}
                                onChange={updateJudge}
                                onDelete={() => deleteJudge(j.id)}
                                onSendInvite={() => sendJudgeInvite(j.id)}
                                onWithdrawInvite={() => withdrawJudgeInvite(j.id)}
                            />
                        ))}
                    </div>
                )}

                {pendingJudges.length > 0 && (
                    <div className={styles.bulkRow}>
                        <Button
                            label={`Gửi lời mời cho ${pendingJudges.length} người chưa được mời`}
                            variant="outline" color="blue" labelSize={14}
                            icon={PaperPlaneTilt} iconPosition="left" iconSize={14}
                            onClick={sendAllPendingJudges}
                        />
                    </div>
                )}
            </div>
​
            {/* ── Modal ── */}
            {modal && (
                <AddPersonModal
                    role={modal}
                    persons={persons}
                    loading={searching}
                    alreadyAdded={[
                        ...mentors.map(m => m.id),
                        ...judges.map(j => j.id),
                    ]}
                    onSearch={handleSearch}
                    onAdd={modal === 'mentor' ? addMentors : addJudges}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    )
}
​
export default Step7MentorJudge
​
