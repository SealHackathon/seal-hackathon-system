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

    async function handleSearch(query) {
        setSearching(true)
        const results = await fetchLecturers(query)
        setPersons(results)
        setSearching(false)
    }

    function openModal(role) {
        setPersons([])
        setModal(role)
        handleSearch('')
    }

    // ── Sync helpers — cập nhật local state và đẩy lên formData
    function syncMentors(next) {
        setMentors(next)
        onFormChange?.('mentors', next)
    }
    function syncJudges(next) {
        setJudges(next)
        onFormChange?.('judges', next)
    }

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


    // 1. Gửi lời mời lẻ cho Mentor
    function sendInvite(id) {
        if (!formData.id) {
            console.log('Event chưa tồn tại');
            return;
        }

        // TỰ TÌM: Lấy trực tiếp đối tượng mentor đang lưu trong State ra để lấy categoryId
        const targetMentor = mentors.find(m => m.id === id);
        const categoryId = targetMentor?.categoryId;
        console.log(categoryId)

        if (!categoryId || categoryId === 'undefined') {
            alert("Thao tác thất bại: Bạn chưa cấu hình Hạng mục (Category) cho Mentor này!");
            return;
        }

        // Optimistic Update: Giữ nguyên thuộc tính categoryId của bạn
        syncMentors(mentors.map(m => (m.id === id && m.categoryId === categoryId)
            ? { ...m, inviteStatus: 'sent', inviteSentAt: new Date().toISOString() }
            : m
        ));

        // MAP: Chuyển categoryId từ Frontend thành trackId gửi lên Query Param của Backend
        axiosClient.post(`/mentor-judge/mentors/${id}/invite?eventId=${formData.id}&trackId=${categoryId}`)
            .then((res) => console.log("Invite mentor lẻ thành công:", res.data))
            .catch((err) => console.error("Lỗi mời mentor lẻ:", err));
    }


    // 2. Rút lại lời mời cho Mentor -> REFACTOR: Tự tìm categoryId
    function withdrawMentorInvite(id) {
        if (!formData.id) return;

        const targetMentor = mentors.find(m => m.id === id);
        const categoryId = targetMentor?.categoryId;

        // Nếu mentor chưa có categoryId thì không cần làm gì cả
        if (!categoryId || categoryId === 'undefined') return;

        syncMentors(mentors.map(m => m.id === id
            ? { ...m, inviteStatus: 'pending', inviteSentAt: null }
            : m
        ));

        axiosClient.delete(`/mentor-judge/mentors/${id}/invite?eventId=${formData.id}&trackId=${Number(categoryId)}`)
            .then((res) => console.log("Rút lời mời mentor thành công:", res.data))
            .catch((err) => console.error("Lỗi rút lời mời mentor:", err));
    }

    // 3. Gửi lời mời hàng loạt cho Mentor theo Category (Track)

    const pendingMentors = mentors.filter(m => m.inviteStatus === 'pending')
    function sendAllPendingMentors() {
        if (!formData.id) {
            console.log('Event chưa tồn tại');
            return;
        }

        // 1. Lọc ra toàn bộ Mentor đang chờ xử lý VÀ phải có categoryId hợp lệ
        const validPendingMentors = mentors.filter(
            m => m.inviteStatus === 'pending' && m.categoryId && m.categoryId !== 'undefined'
        );

        if (validPendingMentors.length === 0) {
            alert("Không có Mentor nào hợp lệ (hoặc chưa cấu hình Hạng mục) để gửi hàng loạt!");
            return;
        }

        // 2. Nhóm (Group) các Mentor theo từng categoryId riêng biệt bằng cấu trúc Object
        // Kết quả mong muốn: { "10": [mentorA, mentorB], "11": [mentorC] }
        const groupedByCat = validPendingMentors.reduce((acc, currentMentor) => {
            const catId = currentMentor.categoryId;
            if (!acc[catId]) {
                acc[catId] = [];
            }
            acc[catId].push(currentMentor);
            return acc;
        }, {});

        const now = new Date().toISOString();

        // 3. Cập nhật trạng thái hiển thị trên giao diện (Optimistic Update) cho tất cả người được chọn
        syncMentors(mentors.map(m =>
            (m.inviteStatus === 'pending' && m.categoryId && m.categoryId !== 'undefined')
                ? { ...m, inviteStatus: 'sent', inviteSentAt: now }
                : m
        ));

        // 4. Duyệt qua từng Track ID đã được nhóm để đóng gói đúng cấu trúc BulkMentorInviteRequest
        Object.keys(groupedByCat).forEach(catId => {
            const mentorsInCat = groupedByCat[catId];

            // Đóng gói Object map chuẩn 100% với BulkMentorInviteRequest của Backend
            const body = {
                eventId: Number(formData.id),          // long eventId
                trackId: Number(catId),                // long trackId
                ids: mentorsInCat.map(m => Number(m.id)) // List<Long> ids (Sửa m.id thành list ids)
            };

            // Bắn API riêng cho nhóm Track này
            axiosClient.post('/mentor-judge/mentors/invite-bulk', body)
                .then((res) => console.log(`Bulk invite thành công cho Track ${catId}:`, res.data))
                .catch((err) => console.error(`Lỗi gửi bulk invite cho Track ${catId}:`, err));
        });
    }
    
    // ==========================================
    // JUDGE HANDLERS (Giữ nguyên cấu trúc categoryIds, roundIds)
    // ==========================================

    function addJudges(selected) {
        const existing = new Set(judges.map(j => j.id))
        const newOnes = selected.filter(p => !existing.has(p.id)).map(createJudge)
        syncJudges([...judges, ...newOnes])
    }
    function updateJudge(updated) {
        syncJudges(judges.map(j => j.id === updated.id ? updated : j))
    }
    function deleteJudge(id) {
        syncJudges(judges.filter(j => j.id !== id))
    }

    // 4. Gửi lời mời lẻ cho Judge (Truyền vào cặp categoryId và roundId cụ thể đang thao tác trên UI)
    function sendJudgeInvite(id) {
        if (!formData.id) return;

        const targetJudge = judges.find(j => j.id === id);
        // Vì cấu hình Judge lưu dạng mảng, lấy phần tử đầu tiên đang được chọn
        const categoryId = targetJudge?.categoryIds?.[0];
        const roundId = targetJudge?.roundIds?.[0];

        if (!categoryId || categoryId === 'undefined' || !roundId || roundId === 'undefined') {
            alert("Thao tác thất bại: Giám khảo này chưa được cấu hình đầy đủ Hạng mục HOẶC Vòng thi!");
            return;
        }

        syncJudges(judges.map(j => j.id === id
            ? { ...j, inviteStatus: 'sent', inviteSentAt: new Date().toISOString() }
            : j
        ));

        axiosClient.post(`/mentor-judge/judges/${id}/invite?eventId=${formData.id}&trackId=${Number(categoryId)}&roundId=${Number(roundId)}`)
            .then((res) => console.log("Invite judge lẻ thành công:", res.data))
            .catch((err) => console.error("Lỗi mời judge lẻ:", err));
    }
    // 5. Rút lại lời mời cho Judge
    function withdrawJudgeInvite(id) {
        if (!formData.id) return;

        const targetJudge = judges.find(j => j.id === id);
        const categoryId = targetJudge?.categoryIds?.[0];
        const roundId = targetJudge?.roundIds?.[0];

        if (!categoryId || categoryId === 'undefined' || !roundId || roundId === 'undefined') return;

        syncJudges(judges.map(j => j.id === id
            ? { ...j, inviteStatus: 'pending', inviteSentAt: null }
            : j
        ));

        axiosClient.delete(`/mentor-judge/judges/${id}/invite?eventId=${formData.id}&trackId=${Number(categoryId)}&roundId=${Number(roundId)}`)
            .then((res) => console.log("Rút lời mời judge thành công:", res.data))
            .catch((err) => console.error("Lỗi rút lời mời judge:", err));
    }

    const pendingJudges = judges.filter(j => j.inviteStatus === 'pending')
    // 6. Gửi lời mời hàng loạt cho Judge theo cặp Category & Round đang chọn
    function sendAllPendingJudges() {
        if (!formData.id) return;

        const validPendingJudges = judges.filter(j =>
            j.inviteStatus === 'pending' &&
            j.categoryIds?.[0] && j.categoryIds[0] !== 'undefined' &&
            j.roundIds?.[0] && j.roundIds[0] !== 'undefined'
        );

        if (validPendingJudges.length === 0) {
            alert("Không có Giám khảo nào hợp lệ để gửi hàng loạt!");
            return;
        }

        // Tạo key tổng hợp theo định dạng "trackId-roundId" để gom nhóm chính xác
        const groupedMap = validPendingJudges.reduce((acc, j) => {
            const key = `${j.categoryIds[0]}-${j.roundIds[0]}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(j);
            return acc;
        }, {});

        const now = new Date().toISOString();

        syncJudges(judges.map(j => {
            const isValid = j.inviteStatus === 'pending' && j.categoryIds?.[0] && j.roundIds?.[0];
            return isValid ? { ...j, inviteStatus: 'sent', inviteSentAt: now } : j;
        }));

        // Bắn API bulk dựa theo từng nhóm cặp bài trùng
        Object.keys(groupedMap).forEach(key => {
            const [trackId, roundId] = key.split('-');
            const body = {
                eventId: formData.id,
                trackId: Number(trackId),
                roundId: Number(roundId),
                userIds: groupedMap[key].map(j => j.id)
            };

            axiosClient.post('/mentor-judge/judges/invite-bulk', body)
                .then((res) => console.log(`Bulk invite judges thành công cho nhóm ${key}:`, res.data))
                .catch((err) => console.error(`Lỗi gửi bulk invite judges nhóm ${key}:`, err));
        });
    }
    // ── Table column headers
    const MENTOR_COLS = ['MENTOR', 'HẠNG MỤC PHỤ TRÁCH', 'LỜI MỜI']
    const JUDGE_COLS = ['GIÁM KHẢO', 'HẠNG MỤC', 'VÒNG PHỤ TRÁCH', 'LỜI MỜI']

    return (
        <div className={styles.wrapper}>
            <SectionHeader level="h1" title="Mentor & Giám khảo" />

            <Banner
                color="blue" variant="flat" icon={Info} iconSize={20}
                detail="Sau khi tạo sự kiện, bạn có thể assign mentor cho từng đội cụ thể trong trang Quản lý sự kiện."
            />

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

export default Step7MentorJudge

