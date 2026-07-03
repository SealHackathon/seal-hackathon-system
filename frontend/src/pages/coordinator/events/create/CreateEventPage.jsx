import { useState, useEffect } from 'react'
// import CoordinatorLayout from '../../../../layouts/CoordinatorLayout'
import CreateEventSidebar from '../../../../components/coordinator/events/create/CreateEventSidebar'
import CreateEventHeader from '../../../../components/coordinator/events/create/CreateEventHeader'
import CreateEventStickyHeader from '../../../../components/coordinator/events/create/CreateEventStickyHeader'
import CreateEventFooter from '../../../../components/coordinator/events/create/CreateEventFooter'
import Step1BasicInfo from './steps/Step1BasicInfo'
import Step2Rules from './steps/Step2Rules'
import Step3Prizes from './steps/Step3Prizes'
import Step4Rounds from './steps/Step4Rounds'
import Step6Timeline from './steps/Step6Timeline';
import Step7MentorJudge from './steps/Step7MentorJudge';
import { handleSaveDraft } from '../../../../api/handleSaveDraft'
import styles from './CreateEventPage.module.css'
import Step5Categories from './steps/Step5Categories'
import axiosClient from '../../../../api/axiosClient'
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../../../../components/shared/ConfirmModal'
const TOTAL_STEPS = 7



// function StepPlaceholder({ step }) {
//   return (
//     <div className={styles.placeholder}>
//       <p className={styles.placeholderText}>Step {step} — Đang phát triển...</p>
//     </div>
//   )
// }

function CreateEventPage() {
  const navigate = useNavigate(); // 1. Khởi tạo hàm điều hướng
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [confirmModal, setConfirmModal] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentStep, setCurrentStep] = useState(1)
  const [visitedSteps, setVisitedSteps] = useState([1])
  const [errorSteps, setErrorSteps] = useState([])
  const [formData, setFormData] = useState({
    id: id ?? null,
    deadlineSameAsClose: true,
    minMembers: 3,
    maxMembers: 4,
    rankCount: 3,
    mainPrizes: [
      { id: 1, rank: 1, defaultName: 'Giải nhất', name: 'Giải nhất', quantity: 1, cash: '', desc: '' },
      { id: 2, rank: 2, defaultName: 'Giải nhì', name: 'Giải nhì', quantity: 1, cash: '', desc: '' },
      { id: 3, rank: 3, defaultName: 'Giải ba', name: 'Giải ba', quantity: 1, cash: '', desc: '' },
    ],
    extendedPrizes: [],
    rounds: [
      {
        id: 'round-1',
        name: 'Vòng Sơ khảo',
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
      },
      {
        id: 'round-2',
        name: 'Vòng Chung kết',
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
    ],
    categories: [
      { id: 'cat-1', name: '', desc: '', teamLimit: '' }
    ],
    mentors: [],
    judges: []
  })
  const [status, setStatus] = useState('draft')

  function handleFormChange(field, val) {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

  // chuẩn hóa lại dữ liệu ngày tháng từ backend về dạng Date object
  const parseBackendDate = (value) => {
    if (!value) return null
    if (value instanceof Date) return value
    if (typeof value === 'number') return new Date(value)

    const str = String(value).trim()
    const normalized = str
      .replace(/\s+/g, 'T')
      .replace(/\./g, ':')
      .replace(/\s*GMT.*$/i, '')

    const date = new Date(normalized)
    return Number.isFinite(date.getTime()) ? date : null
  }

  // hàm chuẩn hóa dữ liệu vòng thi từ API về định dạng mà formData mong muốn
  const normalizeRounds = (rawRounds) => {
    if (!Array.isArray(rawRounds)) return undefined
    return rawRounds.map((r, index) => ({
      id: r.roundId ?? r.id ?? `round-${index + 1}`,
      name: r.roundName ?? r.name ?? `Vòng ${index + 1}`,
      startDate: parseBackendDate(r.roundStartTime ?? r.timeStart ?? r.startDate),
      endDate: parseBackendDate(r.roundEndTime ?? r.timeEnd ?? r.endDate),
      format: r.format ?? (r.meetingLink ? 'online' : 'offline'),
      location: r.location ?? (r.position ? { name: r.position } : null),
      submissionType: r.submissionType ?? (r.submissionConfig?.hasSubmission ? 'new' : 'previous'),
      submissionOpen: parseBackendDate(r.submissionConfig?.openingTime ?? r.submissionOpen ?? r.submissionOpenTime),
      submissionDeadline: parseBackendDate(r.submissionConfig?.submissionDeadline ?? r.roundSubmissionDeadline ?? r.submissionDeadline),
      submissionGuide: r.submissionConfig?.submissionInstructions ?? r.submissionGuide ?? '',
      agenda: Array.isArray(r.agenda)
        ? r.agenda.map((item, idx) => ({
          id: item.id ?? `${r.roundId ?? index}-${idx}`,
          name: item.name ?? item.timelineName ?? '',
          desc: item.desc ?? item.description ?? '',
          startTime: item.startTime ?? item.timeStart ?? null,
        }))
        : [],
      meetingLink: r.meetingLink ?? '',
      topTeamPass: r.topTeamPass ?? 0,
      rubricId: r.rubricId ?? null,
    }))
  }

    // hàm chuẩn hóa dữ liệu vòng thi từ API về định dạng mà formData mong muốn

  const normalizeTracks = (rawTracks) => {
    if (!Array.isArray(rawTracks)) return undefined
    return rawTracks.map((track, index) => ({
      id: track.id ?? track.trackId ?? `cat-${index + 1}`,
      name: track.name ?? track.trackName ?? '',
      desc: track.des ?? track.description ?? '',
      teamLimit: track.maxTeamPerTrack ?? track.teamLimit ?? ''
    }))
  }

    // hàm chuẩn hóa dữ liệu vòng thi từ API về định dạng mà formData mong muốn

  const normalizePrizes = (rawPrizes) => {
    if (!Array.isArray(rawPrizes)) return undefined
    const main = []
    const extended = []
    rawPrizes.forEach((item, index) => {
      const typeKey = String(item.prizeType ?? item.type ?? '').trim().toLowerCase()
      const rankValue = item.rank ?? item.ordinal ?? item.prizeRank ?? null
      const isMainType = ['main', 'primary', 'rank', 'main_prize', 'mainprize'].includes(typeKey)
      const shouldBeMain = isMainType || Boolean(rankValue) || (!typeKey && index < 3)
      const assignedRank = shouldBeMain
        ? (rankValue ?? main.length + 1)
        : null

      const prize = {
        id: item.id ?? item.prizeId ?? index + 1,
        rank: assignedRank,
        defaultName: item.prizeName ?? item.name ?? item.title ?? `Giải ${index + 1}`,
        name: item.prizeName ?? item.name ?? item.title ?? `Giải ${index + 1}`,
        quantity: Number(item.quantity ?? item.prizeQuantity ?? item.amount ?? 1),
        cash: item.prizeValue ?? item.money ?? item.cash ?? item.amount ?? 0,
        desc: item.description ?? item.desc ?? item.detail ?? ''
      }
      if (shouldBeMain) {
        main.push(prize)
      } else {
        extended.push(prize)
      }
    })
    return { mainPrizes: main.length ? main : undefined, extendedPrizes: extended.length ? extended : undefined }
  }

  const parseReceiver = (receiver = {}) => ({
    id: receiver.id ?? receiver.userId ?? receiver.receiverId ?? null,
    name: receiver.fullName ?? receiver.name ?? receiver.username ?? receiver.email ?? '',
    title: receiver.title ?? receiver.position ?? receiver.role ?? '',
    org: receiver.orgName ?? receiver.organization ?? receiver.company ?? '',
    avatar: receiver.avatarUrl ?? receiver.avatar ?? receiver.profileImage ?? receiver.imageUrl ?? null,
  })

  const normalizeInviteStatus = (rawStatus, sentAt) => {
    const normalized = String(rawStatus ?? 'pending').trim().toLowerCase()
    if (sentAt && normalized === 'pending') return 'sent'
    if (['pending', 'sent', 'accepted', 'rejected', 'declined'].includes(normalized)) {
      return normalized
    }
    return 'pending'
  }

  const normalizeMentors = (rawMentors) => {
    if (!Array.isArray(rawMentors)) return []
    return rawMentors.map((item, index) => {
      const receiver = parseReceiver(item.receiver ?? item.user ?? item.person ?? {})
      return {
        id: receiver.id ?? item.receiverId ?? item.userId ?? item.id ?? item.mentorId ?? `mentor-${index + 1}`,
        name: receiver.name,
        title: receiver.title,
        org: receiver.org,
        avatar: receiver.avatar,
        categoryId: item.trackId ?? item.categoryId ?? item.category?.id ?? item.track?.id ?? null,
        inviteStatus: normalizeInviteStatus(item.status ?? item.requestStatus ?? item.inviteStatus ?? 'pending', item.sentAt ?? item.sentAtTime ?? item.inviteSentAt ?? null),
        inviteSentAt: item.sentAt ?? item.sentAtTime ?? item.inviteSentAt ?? null,
      }
    })
  }

  const normalizeJudges = (rawJudges) => {
    if (!Array.isArray(rawJudges)) return []
    return rawJudges.map((item, index) => {
      const receiver = parseReceiver(item.receiver ?? item.user ?? item.person ?? {})
      const categoryIds = Array.isArray(item.categoryIds ?? item.trackIds ?? item.categories ?? item.tracks)
        ? (item.categoryIds ?? item.trackIds ?? item.categories ?? item.tracks).map(x => x?.id ?? x)
        : []
      const roundIds = Array.isArray(item.roundIds ?? item.rounds)
        ? (item.roundIds ?? item.rounds).map(x => x?.id ?? x)
        : []
      const fallbackCategoryId = item.trackId ?? item.categoryId ?? item.category?.id ?? item.track?.id ?? null
      const fallbackRoundId = item.roundId ?? item.round?.id ?? null

      return {
        id: receiver.id ?? item.receiverId ?? item.userId ?? item.id ?? item.judgeId ?? `judge-${index + 1}`,
        name: receiver.name,
        title: receiver.title,
        org: receiver.org,
        avatar: receiver.avatar,
        categoryIds: categoryIds.length ? categoryIds : (fallbackCategoryId ? [fallbackCategoryId] : []),
        roundIds: roundIds.length ? roundIds : (fallbackRoundId ? [fallbackRoundId] : []),
        inviteStatus: normalizeInviteStatus(item.status ?? item.requestStatus ?? item.inviteStatus ?? 'pending', item.sentAt ?? item.sentAtTime ?? item.inviteSentAt ?? null),
        inviteSentAt: item.sentAt ?? item.sentAtTime ?? item.inviteSentAt ?? null,
      }
    })
  }

  const extractData = (response) => {
    if (!response) return null
    const payload = response.data ?? response
    return payload?.data ?? payload?.result ?? payload?.payload ?? payload
  }

  const tryLoad = async (requests) => {
    for (const request of requests) {
      try {
        const response = await axiosClient.get(request.url, { params: request.params })
        const data = extractData(response)
        if (data !== null && data !== undefined) {
          return data
        }
      } catch (error) {
        // ignore and try next
      }
    }
    return null
  }

  const loadEventNotes = async (eventId) => {
    const data = await tryLoad([
      { url: '/event-notes', params: { eventId } },
      { url: `/event-notes/${eventId}` },
      { url: '/event-notes', params: { id: eventId } },
    ])
    if (!data) return null
    if (Array.isArray(data)) {
      return { notes: data }
    }
    return {
      eventRules: data.rules ?? data.rules ?? data.generalRules ?? null,
      notes: data.notes ?? data.ruleNotes ?? (Array.isArray(data) ? data : null),
    }
  }

  const loadEventRounds = async (eventId) => {
    const data = await tryLoad([
      { url: '/round', params: { eventId } },
      { url: `/round/${eventId}` },
      { url: '/round', params: { id: eventId } },
    ])
    return normalizeRounds(data?.rounds ?? data?.roundList ?? data)
  }

  const loadEventTracks = async (eventId) => {
    const data = await tryLoad([
      { url: '/track', params: { eventId } },
      { url: `/track/${eventId}` },
      { url: '/track', params: { id: eventId } },
    ])
    return normalizeTracks(data?.tracks ?? data?.trackList ?? data)
  }

  useEffect(() => {
    if (!isEditing) return;

    const fetchEvent = async () => {
      try {
        const response = await axiosClient.get(`/event/${id}`)
        const raw = response.data
        const data = raw?.data ?? raw?.result ?? raw?.payload ?? raw
        if (!data) return

        const prizeData = normalizePrizes(data.prizes)
        let roundsData = normalizeRounds(data.rounds)
        let trackData = normalizeTracks(data.tracks)

        const fallbackNotes = await loadEventNotes(data.eventId ?? id)
        if (fallbackNotes) {
          if (!data.rules && fallbackNotes.eventRules) data.rules = fallbackNotes.eventRules
          if ((!Array.isArray(data.notes) || data.notes.length === 0) && Array.isArray(fallbackNotes.notes)) data.notes = fallbackNotes.notes
        }

        if (!roundsData) {
          roundsData = await loadEventRounds(data.eventId ?? id)
        }
        if (!trackData) {
          trackData = await loadEventTracks(data.eventId ?? id)
        }

        const fetchedOpenDate = parseBackendDate(data.openRegisterTime ?? data.openDate ?? data.registerOpenTime ?? data.startRegisterTime)
        const fetchedCloseDate = parseBackendDate(data.closeRegisterTime ?? data.closeDate ?? data.registerCloseTime ?? data.endRegisterTime)
        const fetchedTeamDeadline = parseBackendDate(data.cofirmTeamTime ?? data.teamDeadline ?? data.confirmTeamTime ?? data.teamDeadline)
        const deadlineSameAsClose = fetchedTeamDeadline && fetchedCloseDate
          ? fetchedTeamDeadline.getTime() === fetchedCloseDate.getTime()
          : true

        setFormData(prev => ({
          ...prev,
          id: data.eventId ?? id,
          name: data.eventName ?? data.name ?? prev.name,
          theme: data.eventTopic ?? data.topic ?? prev.theme,
          shortDesc: data.description ?? data.shortDesc ?? prev.shortDesc,
          detailDesc: data.descriptionDetails ?? data.detailDesc ?? prev.detailDesc,
          minMembers: data.minTeamMember ?? data.minMembers ?? prev.minMembers,
          maxMembers: data.maxTeamMember ?? data.maxMembers ?? prev.maxMembers,
          openDate: fetchedOpenDate ?? prev.openDate,
          closeDate: fetchedCloseDate ?? prev.closeDate,
          teamDeadline: fetchedTeamDeadline ?? prev.teamDeadline,
          deadlineSameAsClose,
          generalRules: data.rules ?? data.eventRules ?? data.generalRules ?? prev.generalRules,
          notes: data.notes ?? data.eventNotes ?? data.ruleNotes ?? prev.notes,
          benefits: data.participationBenefits ?? data.benefits ?? prev.benefits,
          status: data.eventStatus?.toLowerCase() ?? data.status?.toLowerCase() ?? prev.status,
          rounds: roundsData ?? prev.rounds,
          categories: trackData ?? prev.categories,
          mentors: normalizeMentors(data.mentors ?? data.mentorInvites ?? data.mentorRequests ?? prev.mentors),
          judges: normalizeJudges(data.judges ?? data.judgeInvites ?? data.judgeRequests ?? prev.judges),
          mainPrizes: prizeData?.mainPrizes ?? prev.mainPrizes,
          extendedPrizes: prizeData?.extendedPrizes ?? prev.extendedPrizes,
          rankCount: Number(data.rankCount ?? (prizeData?.mainPrizes?.length ?? prev.rankCount)) || prev.rankCount,
          keywords: data.keywords ?? data.tags ?? prev.keywords,
          avatarFile: data.thumbnailImage ?? data.thumbnail ?? data.thumbnailUrl ?? data.avatarFile ?? prev.avatarFile,
          coverFile: data.bannerImg ?? data.banner ?? data.coverFile ?? data.coverUrl ?? prev.coverFile,
        }))
        setStatus(data.eventStatus?.toLowerCase() ?? data.status?.toLowerCase() ?? 'draft')

        if (data.updatedAt) {
          const updatedAt = new Date(data.updatedAt)
          const pad = n => String(n).padStart(2, '0')
          setLastUpdated(`${pad(updatedAt.getDate())}/${pad(updatedAt.getMonth() + 1)}/${updatedAt.getFullYear()} ${pad(updatedAt.getHours())}:${pad(updatedAt.getMinutes())}`)
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sự kiện:', error)
        alert('Không tải được dữ liệu sự kiện. Vui lòng kiểm tra lại.')
      }
    }

    fetchEvent()
  }, [id, isEditing])


  // nếu chưa điền đủ các thông tin form ko cho nhảy bước
  function validateStep(step) {
    if (step === 1) {
      if (!formData.name?.trim()) return false
      if (!formData.openDate || !formData.closeDate) return false

      const open = new Date(formData.openDate).getTime()
      const close = new Date(formData.closeDate).getTime()
      if (close <= open) return false

      const min = formData.minMembers
      const max = formData.maxMembers
      if (min === '' || min === undefined || min === null) return false
      if (max === '' || max === undefined || max === null) return false
      if (Number(min) < 1 || Number(max) < 1) return false
      if (Number(min) >= Number(max)) return false

      if (!formData.avatarFile || !formData.coverFile) return false

      if (formData.deadlineSameAsClose === false) {
        if (!formData.teamDeadline) return false
        if (new Date(formData.teamDeadline).getTime() < close) return false
      }

      return true
    }
    if (step === 2) {
      const rules = formData.generalRules ?? ''
      const isEmpty = !rules.trim() || rules === '<p></p>' || rules === '<p><br></p>'
      if (isEmpty) return false

      const notes = formData.notes ?? []
      return notes.every(n => n.title?.trim())
    }
    if (step === 3) {
      const mainPrizes = formData.mainPrizes ?? []
      const rankCount = formData.rankCount ?? 3

      // Phải có đủ số giải theo dropdown
      if (mainPrizes.length < rankCount) return false

      // Mỗi giải chính phải điền đủ tên + số lượng
      const mainValid = mainPrizes.every(p =>
        p.name?.trim() &&
        p.quantity !== '' && p.quantity !== undefined && p.quantity !== null && Number(p.quantity) >= 1
      )
      if (!mainValid) return false

      // Giải phụ nếu có phải điền tên + số lượng
      const extendedPrizes = formData.extendedPrizes ?? []
      const extValid = extendedPrizes.every(p =>
        p.name?.trim() &&
        p.quantity !== '' && p.quantity !== undefined && p.quantity !== null && Number(p.quantity) >= 1
      )
      if (!extValid) return false

      return true
    }
    if (step === 4) {
      const rounds = formData.rounds ?? []
      if (rounds.length === 0) return false
      return rounds.every((r, idx) => {
        if (!r.name?.trim()) return false
        if (!r.startDate || !r.endDate) return false

        const start = new Date(r.startDate).getTime()
        const end = new Date(r.endDate).getTime()
        if (end <= start) return false
        // Kiểm tra thứ tự các vòng thi: Ngày bắt đầu vòng sau >= Ngày kết thúc vòng trước
        if (idx > 0) {
          const prevEnd = new Date(rounds[idx - 1].endDate).getTime()
          if (start < prevEnd) return false
        }

        if (r.format === 'offline' && !r.location) return false
        if (r.format === 'online' && !r.meetingLink?.trim()) return false

        if (r.submissionType === 'new') {
          if (!r.submissionDeadline) return false
          const subDeadline = new Date(r.submissionDeadline).getTime()

          // Hạn nộp bài phải nằm trong thời gian diễn ra vòng
          if (subDeadline <= start || subDeadline >= end) return false

          if (r.submissionOpen) {
            const subOpen = new Date(r.submissionOpen).getTime()
            if (subDeadline <= subOpen) return false
            if (subOpen < start) return false
          }
        }

        // Kiểm tra lịch trình (agenda) của vòng thi
        const agenda = r.agenda ?? []
        const agendaValid = agenda.every((item, i) => {
          if (i === 0) return true
          const prev = agenda[i - 1]
          if (prev.startTime && item.startTime && item.startTime <= prev.startTime) return false
          return true
        })
        if (!agendaValid) return false

        return true
      })
    }
    if (step === 5) {
      const categories = formData.categories ?? []
      if (categories.length === 0) return false
      return categories.every(c => {
        if (!c.name?.trim()) return false
        if (c.teamLimit !== '' && c.teamLimit !== undefined && c.teamLimit !== null) {
          if (Number(c.teamLimit) < 1) return false
        }
        return true
      })
    }
    return true
  }

  function goToStep(step) {
    const isValid = validateStep(currentStep)
    setVisitedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep])
    setErrorSteps(prev =>
      isValid
        ? prev.filter(s => s !== currentStep)
        : prev.includes(currentStep) ? prev : [...prev, currentStep]
    )
    setCurrentStep(step)
    setVisitedSteps(prev => prev.includes(step) ? prev : [...prev, step])
  }
  // --------------------------------------handleNext---------------------------
  async function handleNext() {
    // Chỉ validate form client trước khi cho phép bấm nút gửi
    // if (!validateStep(currentStep)) {
    //   alert("Vui lòng điền đầy đủ các thông tin bắt buộc trước khi tiếp tục!");
    //   return;
    // }

    // Chờ gọi API lưu dữ liệu thành công rồi mới cho phép chuyển bước
    const isSaveSuccess = await onSaveDraft();

    if (isSaveSuccess && currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }
  }
  // ------------------------------------------------------------------
  function handleBack() { if (currentStep > 1) goToStep(currentStep - 1) }



  // Trong component:
  async function onSaveDraft() {
    const isSuccess = await handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange });
    if (isSuccess) {
      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const timeString = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setLastUpdated(timeString);
    }
    return isSuccess;
  }
  //------------------------------------------------------------------------------------------------

  function handlePublish() { setStatus('live'); console.log('Công bố:', formData) }
  function handlePreview() { console.log('Xem trước:', formData) }
  function handleCancel() {
    setConfirmModal({
      title: 'Xác nhận hủy',
      message: 'Các thông tin cấu hình chưa được bạn Lưu nháp sẽ mất!',
      confirmLabel: 'Đồng ý',
      onConfirm: () => {
        if (formData.id != null) {
          axiosClient.delete(`/event/${formData.id}`).then(
            () => {
              console.log('cancel create event sucess !');
            }
          ).catch((error) => {
            console.log(error)
          })
        }
        navigate('/admin/coordinator/events');
        setConfirmModal(null)
      }
    })
  }

  function renderStep() {
    switch (currentStep) {
      case 1: return <Step1BasicInfo formData={formData} onFormChange={handleFormChange} />
      case 2: return <Step2Rules formData={formData} onFormChange={handleFormChange} />  // ← thêm
      case 3: return <Step3Prizes formData={formData} onFormChange={handleFormChange} />
      case 4: return <Step4Rounds formData={formData} onChange={setFormData} />
      case 5: return <Step5Categories formData={formData} onFormChange={handleFormChange} />
      case 6: return <Step6Timeline formData={formData} onFormChange={handleFormChange} />
      case 7: return <Step7MentorJudge formData={formData} onFormChange={handleFormChange} />
      default: return null
    }
  }
  const isPublishDisabled = ![1, 2, 3, 4, 5].every(step => validateStep(step))
  return (
    // <CoordinatorLayout>
    // </CoordinatorLayout>

    <div className={styles.page}>

      {/* ── Sticky Header ── */}
      <CreateEventStickyHeader isEditing={isEditing} lastUpdated={lastUpdated} />

      {/* ── Header ── */}
      <CreateEventHeader
        title={formData.name?.trim() || 'Sự kiện mới'}
        status={status}
        onPublish={handlePublish}
        onPreview={handlePreview}
        isPublishDisabled={isPublishDisabled}
      />

      {/* ── Body: create sidebar + step content ── */}
      <div className={styles.body}>

        <aside className={styles.sidebar}>
          <CreateEventSidebar
            currentStep={currentStep}
            visitedSteps={visitedSteps}
            errorSteps={errorSteps}
            onStepClick={goToStep}
          />
        </aside>

        <main className={styles.content}>
          {renderStep()}
        </main>

      </div>

      {/* ── Footer ── */}
      <CreateEventFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onCancel={handleCancel}
        onSaveDraft={onSaveDraft}
        onBack={handleBack}
        onNext={handleNext}
      />

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
        isNotification={confirmModal?.isNotification}
      />
    </div>
  )
}

export default CreateEventPage