import { useEffect, useState } from 'react'
import { Info, PaperPlaneTilt, Plus } from '@phosphor-icons/react'
import SectionHeader from '../../../../../components/shared/SectionHeader'
import Banner from '../../../../../components/shared/Banner'
import Button from '../../../../../components/shared/Button'
import MentorRow from '../../../../../components/coordinator/events/create/MentorRow'
import JudgeRow from '../../../../../components/coordinator/events/create/JudgeRow'
import AddPersonModal from '../../../../../components/coordinator/events/create/AddPersonModal'
import styles from './Step7MentorJudge.module.css'

import axiosClient from '../../../../../api/axiosClient'

async function fetchLecturers(query) {
    const res = await axiosClient.get('/user/lecturers', { params: { q: query } })
    return res.data
}

function createMentor(person, categoryId) {
    return { ...person, categoryId, inviteStatus: 'pending', inviteSentAt: null }
}

function createJudge(person, roundId) {
    return { ...person, categoryIds: [], roundIds: [roundId], inviteStatus: 'pending', inviteSentAt: null }
}

function Step7MentorJudge({ formData, onFormChange }) {
    const [mentors, setMentors] = useState(() => formData?.mentors ?? [])
    const [judges, setJudges] = useState(() => formData?.judges ?? [])

    useEffect(() => { setMentors(formData?.mentors ?? []) }, [formData?.mentors])
    useEffect(() => { setJudges(formData?.judges ?? []) }, [formData?.judges])

    const categories = (formData?.categories ?? [])
        .filter(c => c.name?.trim())
        .map(c => ({ value: c.id ?? c, label: c.name ?? c }))
    const rounds = (formData?.rounds ?? [])
        .filter(r => r.name?.trim())
        .map(r => ({ value: r.id ?? r, label: r.name ?? r }))

    // Modal state
    const [modalConfig, setModalConfig] = useState(null) // { role: 'mentor'|'judge', targetId: string|number }
    const [persons, setPersons] = useState([])
    const [searching, setSearching] = useState(false)

    async function handleSearch(query) {
        setSearching(true)
        const results = await fetchLecturers(query)
        setPersons(results)
        setSearching(false)
    }

    function openModal(role, targetId) {
        setPersons([])
        setModalConfig({ role, targetId })
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

    // --- MENTOR ---
    function addMentors(selected) {
        const targetCategoryId = modalConfig.targetId
        const existing = new Set(mentors.map(m => m.id))
        const newOnes = selected.filter(p => !existing.has(p.id)).map(p => createMentor(p, targetCategoryId))
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


        if (!categoryId || categoryId === 'undefined') {
            alert("Thao tác thất bại: Bạn chưa cấu hình Hạng mục (Category) cho Mentor này!");
            return;
        }

        syncMentors(mentors.map(m => (m.id === id && m.categoryId === categoryId)
            ? { ...m, inviteStatus: 'sent', inviteSentAt: new Date().toISOString() }
            : m
        ));
        console.log(categoryId)

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

    // 3. Gửi lời mời hàng loạt cho Mentor toàn bộ
    function sendAllPendingMentorsGlobal() {
        if (!formData.id) return;
        
        const pending = mentors.filter(m => m.inviteStatus === 'pending' && m.categoryId);
        if (pending.length === 0) return;

        const now = new Date().toISOString();
        syncMentors(mentors.map(m => (m.inviteStatus === 'pending' && m.categoryId)
            ? { ...m, inviteStatus: 'sent', inviteSentAt: now }
            : m
        ));

        const grouped = pending.reduce((acc, m) => {
            if (!acc[m.categoryId]) acc[m.categoryId] = [];
            acc[m.categoryId].push(m);
            return acc;
        }, {});

        Object.keys(grouped).forEach(catId => {
            const body = {
                eventId: Number(formData.id),
                trackId: Number(catId),
                ids: grouped[catId].map(m => Number(m.id))
            };
            axiosClient.post('/mentor-judge/mentors/invite-bulk', body)
                .then(res => console.log(`Bulk invite mentor thành công cho Track ${catId}:`, res.data))
                .catch(err => console.error(`Lỗi gửi bulk invite mentor Track ${catId}:`, err));
        });
    }

    // --- JUDGE ---
    function addJudges(selected) {
        const targetRoundId = modalConfig.targetId
        const newJudges = [...judges]
        selected.forEach(person => {
            const existingJudge = newJudges.find(j => j.id === person.id)
            if (existingJudge) {
                if (!existingJudge.roundIds.includes(targetRoundId)) {
                    existingJudge.roundIds.push(targetRoundId)
                }
            } else {
                newJudges.push(createJudge(person, targetRoundId))
            }
        })
        syncJudges(newJudges)
    }

    function updateJudge(updated) {
        syncJudges(judges.map(j => j.id === updated.id ? updated : j))
    }

    function deleteJudge(id, roundId) {
        const newJudges = judges.map(j => {
            if (j.id === id) {
                return { ...j, roundIds: j.roundIds.filter(r => r !== roundId) }
            }
            return j;
        }).filter(j => j.roundIds.length > 0)
        syncJudges(newJudges)
    }

    function sendJudgeInvite(id, roundId) {
        if (!formData.id) return;
        const targetJudge = judges.find(j => j.id === id);
        // Vì cấu hình Judge lưu dạng mảng, lấy phần tử đầu tiên đang được chọn
        const categoryId = targetJudge?.categoryIds?.[0];

        if (!categoryId || categoryId === 'undefined' || !roundId || roundId === 'undefined') {
            alert("Thao tác thất bại: Giám khảo này chưa được cấu hình đầy đủ Hạng mục HOẶC Vòng thi!");
            return;
        }

        syncJudges(judges.map(j => j.id === id
            ? { ...j, inviteStatus: 'sent', inviteSentAt: new Date().toISOString() }
            : j
        ));

        const url = `/mentor-judge/judges/${id}/invite?eventId=${formData.id}&roundId=${roundId}`
            + (categoryId !== null ? `&trackId=${categoryId}` : ``);
        axiosClient.post(url).catch((err) => console.error("Lỗi mời judge lẻ:", err));
    }

    // 4. Rút lại lời mời cho Judge
    function withdrawJudgeInvite(id, roundId) {
        if (!formData.id) return;

        const targetJudge = judges.find(j => j.id === id);
        const categoryId = (targetJudge?.categoryIds?.length > 0) ? targetJudge.categoryIds[0] : null;

        if (!categoryId || categoryId === 'undefined' || !roundId || roundId === 'undefined') return;

        syncJudges(judges.map(j => j.id === id
            ? { ...j, inviteStatus: 'pending', inviteSentAt: null }
            : j
        ));

        const url = `/mentor-judge/judges/${id}/invite?eventId=${formData.id}&roundId=${roundId}`
            + (categoryId !== null ? `&trackId=${categoryId}` : ``);
        axiosClient.delete(url)
            .then((res) => console.log("Rút lời mời judge thành công:", res.data))
            .catch((err) => console.error("Lỗi rút lời mời judge:", err));
    }

    // 6. Gửi lời mời hàng loạt cho Judge toàn bộ
    function sendAllPendingJudgesGlobal() {
        if (!formData.id) return;
        
        const pending = judges.filter(j => j.inviteStatus === 'pending' && j.roundIds?.length > 0);
        if (pending.length === 0) return;

        const now = new Date().toISOString();
        syncJudges(judges.map(j => (j.inviteStatus === 'pending' && j.roundIds?.length > 0)
            ? { ...j, inviteStatus: 'sent', inviteSentAt: now }
            : j
        ));

        rounds.forEach(round => {
            const judgesInRound = pending.filter(j => j.roundIds?.includes(round.value));
            if (judgesInRound.length === 0) return;

            const groupedMap = judgesInRound.reduce((acc, j) => {
                const trackId = (j.categoryIds?.length > 0) ? j.categoryIds[0] : 'ALL';
                if (!acc[trackId]) acc[trackId] = [];
                acc[trackId].push(j);
                return acc;
            }, {});

            Object.keys(groupedMap).forEach(trackId => {
                const body = {
                    eventId: Number(formData.id),
                    roundId: Number(round.value),
                    userIds: groupedMap[trackId].map(j => Number(j.id))
                };
                if (trackId !== 'ALL') {
                    body.trackId = Number(trackId);
                }

                axiosClient.post('/mentor-judge/judges/invite-bulk', body)
                    .then(res => console.log(`Bulk invite judges thành công cho nhóm ${trackId}-${round.value}:`, res.data))
                    .catch(err => console.error(`Lỗi gửi bulk invite judges nhóm ${trackId}-${round.value}:`, err));
            });
        });
    }

    // --- UTILS ---
    function getCategoriesForJudgeDropdown(judgeId) {
        const mentorCatId = mentors.find(m => m.id === judgeId)?.categoryId;
        const isMentorAtAll = mentorCatId != null;
        const categoryOptions = categories.map(c => ({
            ...c,
            disabled: c.value === mentorCatId
        }));

        return isMentorAtAll
            ? categoryOptions
            : [{ value: null, label: 'Tất cả hạng mục', disabled: false }, ...categoryOptions]
    }

    function getAlreadyAddedForModal() {
        if (!modalConfig) return [];
        if (modalConfig.role === 'mentor') {
            const allMentors = mentors.map(m => ({ id: m.id, reason: 'Đang làm Mentor' }));
            const blockedJudges = judges.filter(j => {
                const cats = j.categoryIds || [];
                return cats.includes(null) || cats.includes(modalConfig.targetId);
            }).map(j => ({ id: j.id, reason: 'Đang chấm thi hạng mục này' }));
            return [...allMentors, ...blockedJudges];
        } else {
            // Role judge: chặn những người đã làm judge trong CHÍNH vòng thi này
            const addedJudgesInRound = judges.filter(j => j.roundIds?.includes(modalConfig.targetId)).map(j => ({ id: j.id, reason: 'Đã thêm' }));

            // Nếu sự kiện chỉ có 1 hạng mục, những ai làm mentor (cho hạng mục duy nhất đó)
            // sẽ không còn hạng mục nào khác để chấm -> Không thể làm giám khảo.
            if (categories.length <= 1) {
                const allMentors = mentors.map(m => ({ id: m.id, reason: 'Đang làm Mentor' }));
                return [...addedJudgesInRound, ...allMentors];
            }
            return addedJudgesInRound;
        }
    }

    const MENTOR_COLS = ['Mentor', '']
    const JUDGE_COLS = ['Giám khảo', 'Hạng mục', '']

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Mentor & Giám khảo</h1>

            <Banner
                color="blue" variant="flat" icon={Info} iconSize={32}
                detail="Sau khi tạo sự kiện, bạn có thể assign mentor cho từng đội cụ thể trong trang Quản lý sự kiện. Bước này không bắt buộc."
            />

            <SectionHeader level="h1" title="Mentor" />

            <div className={styles.groupCard}>
                <div className={styles.groupHeader}>
                    <div className={styles.groupTitleRow}>
                        <h3 className={styles.groupTitle}>Mentor</h3>
                        <span className={styles.badgeCount}>{mentors.length} người</span>
                    </div>
                    <div className={styles.groupActions}>
                        <Button
                            label={`Gửi lời mời tất cả (${mentors.filter(m => m.inviteStatus === 'pending').length})`}
                            variant="primary" color="blue" labelSize={14}
                            icon={PaperPlaneTilt} iconPosition="left" iconSize={14}
                            onClick={sendAllPendingMentorsGlobal}
                            disabled={mentors.filter(m => m.inviteStatus === 'pending').length === 0}
                        />
                    </div>
                </div>

                <div className={styles.table}>
                    {categories.length === 0 ? (
                        <div className={styles.emptyStateGlobal}>Vui lòng cấu hình Hạng mục ở Bước 5 trước.</div>
                    ) : (
                        categories.map((cat, index) => {
                            const mentorsInCat = mentors.filter(m => String(m.categoryId) === String(cat.value))
                            return (
                                <div key={cat.value} className={styles.categoryGroup}>
                                    <div className={styles.groupSeparator}>
                                        <div className={styles.numberBadge}>{index + 1}</div>
                                        <span className={styles.separatorLabel}>{cat.label}</span>
                                        <span className={styles.separatorCount}>{mentorsInCat.length} mentor</span>
                                    </div>
                                    
                                    {mentorsInCat.map(m => (
                                        <MentorRow
                                            key={m.id}
                                            mentor={m}
                                            onChange={updateMentor}
                                            onDelete={() => deleteMentor(m.id)}
                                            onSendInvite={() => sendInvite(m.id)}
                                            onWithdrawInvite={() => withdrawMentorInvite(m.id)}
                                        />
                                    ))}
                                    
                                    {mentorsInCat.length === 0 && (
                                        <div className={styles.emptyRow}>Chưa có mentor nào</div>
                                    )}
                                    
                                    <button className={styles.dashedAddBtn} onClick={() => openModal('mentor', cat.value)}>
                                        <Plus size={16} weight="bold" /> Thêm Mentor cho {cat.label}
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            <SectionHeader level="h1" title="Giám khảo" />

            <div className={styles.groupCard}>
                <div className={styles.groupHeader}>
                    <div className={styles.groupTitleRow}>
                        <h3 className={styles.groupTitle}>Giám khảo</h3>
                        <span className={styles.badgeCount}>{judges.length} người</span>
                    </div>
                    <div className={styles.groupActions}>
                        <Button
                            label={`Gửi lời mời tất cả (${judges.filter(j => j.inviteStatus === 'pending').length})`}
                            variant="primary" color="blue" labelSize={14}
                            icon={PaperPlaneTilt} iconPosition="left" iconSize={14}
                            onClick={sendAllPendingJudgesGlobal}
                            disabled={judges.filter(j => j.inviteStatus === 'pending').length === 0}
                        />
                    </div>
                </div>

                <div className={styles.table}>
                    {rounds.length === 0 ? (
                        <div className={styles.emptyStateGlobal}>Vui lòng cấu hình Vòng thi ở Bước 4 trước.</div>
                    ) : (
                        rounds.map((round, index) => {
                            const judgesInRound = judges.filter(j => j.roundIds?.some(rId => String(rId) === String(round.value)))
                            return (
                                <div key={round.value} className={styles.categoryGroup}>
                                    <div className={styles.groupSeparator}>
                                        <div className={styles.numberBadge}>{index + 1}</div>
                                        <span className={styles.separatorLabel}>{round.label}</span>
                                        <span className={styles.separatorCount}>{judgesInRound.length} giám khảo</span>
                                    </div>
                                    
                                    {judgesInRound.map(j => (
                                        <JudgeRow
                                            key={`${j.id}-${round.value}`}
                                            judge={j}
                                            categories={getCategoriesForJudgeDropdown(j.id)}
                                            onChange={updateJudge}
                                            onDelete={() => deleteJudge(j.id, round.value)}
                                            onSendInvite={() => sendJudgeInvite(j.id, round.value)}
                                            onWithdrawInvite={() => withdrawJudgeInvite(j.id, round.value)}
                                        />
                                    ))}
                                    
                                    {judgesInRound.length === 0 && (
                                        <div className={styles.emptyRow}>Chưa có giám khảo nào</div>
                                    )}
                                    
                                    <button className={styles.dashedAddBtn} onClick={() => openModal('judge', round.value)}>
                                        <Plus size={16} weight="bold" /> Thêm Giám khảo cho {round.label}
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalConfig && (
                <AddPersonModal
                    role={modalConfig.role}
                    persons={persons}
                    loading={searching}
                    alreadyAdded={getAlreadyAddedForModal()}
                    onSearch={handleSearch}
                    onAdd={modalConfig.role === 'mentor' ? addMentors : addJudges}
                    onClose={() => setModalConfig(null)}
                />
            )}
        </div>
    )
}

export default Step7MentorJudge
