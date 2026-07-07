import { useState, useRef, useEffect } from 'react'
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
import useSticky from '../../../../hooks/useSticky'
import styles from './CreateEventPage.module.css'
import Step5Categories from './steps/Step5Categories'
import axiosClient from '../../../../api/axiosClient'
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../../../../components/shared/ConfirmModal'
import NestedSmoothScroll from '../../../../components/shared/NestedSmoothScroll';
import ToastContainer from '../../../../components/shared/ToastContainer';

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
  const [sentinelRef, isSidebarSticky] = useSticky('-73px 0px 0px 0px')
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [confirmModal, setConfirmModal] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('');
  const [currentStep, setCurrentStep] = useState(1)
  const [visitedSteps, setVisitedSteps] = useState([1])
  const [errorSteps, setErrorSteps] = useState([])
  const [stepErrors, setStepErrors] = useState({})
  const [toasts, setToasts] = useState([])
  const contentInnerRef = useRef(null)
  const pageRef = useRef(null)
  const [naturalHeight, setNaturalHeight] = useState(0)

  useEffect(() => {
    if (!contentInnerRef.current) return
    const observer = new ResizeObserver((entries) => {
      setNaturalHeight(entries[0].target.scrollHeight)
    })
    observer.observe(contentInnerRef.current)
    return () => observer.disconnect()
  }, [])

  // Scroll hijacking: khi content sticky, wheel bất kỳ đâu trên trang ⇒ redirect vào content
  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const handleWheel = (e) => {
      const el = contentInnerRef.current
      if (!el) return

      const maxWindowScroll = document.documentElement.scrollHeight - window.innerHeight
      const isWindowAtBottom = window.scrollY >= maxWindowScroll - 2
      const outsideContent = !el.contains(e.target)

      const isAtTop = el.scrollTop <= 0
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2

      if (e.deltaY > 0) {
        // Scroll xuống
        // Nếu chuột ở ngoài và window chưa chạm đáy -> để Lenis/browser tự cuộn window
        if (outsideContent && !isWindowAtBottom) return

        if (!isWindowAtBottom) {
          // Page vẫn còn scroll được → scroll page trước (cho tới khi info header khuất hết)
          e.preventDefault()
          window.scrollBy({ top: e.deltaY, behavior: 'auto' })
        } else if (!isAtBottom) {
          // Page đã chạm đáy → redirect vào inner content
          e.preventDefault()
          el.scrollTop += e.deltaY
        }
        // Cả hai đều ở đáy → không làm gì
      } else {
        // Scroll lên (bất kể chuột trong hay ngoài, ta đều muốn áp dụng logic đồng bộ)
        const isWindowAtTop = window.scrollY <= 0
        
        if (!isWindowAtTop) {
          // Window chưa chạm top -> Không preventDefault để Lenis cuộn window lên mượt mà
          // Đồng thời cuộn nhẹ inner content
          if (!isAtTop) {
            el.scrollTop += e.deltaY * 0.3
          }
        } else {
          // Window đã chạm top -> cuộn inner tốc độ bình thường
          if (!isAtTop) {
            e.preventDefault()
            el.scrollTop += e.deltaY
          }
        }
      }
    }

    // Lắng nghe sự kiện để xử lý riêng việc cuộn Dropdown và các popup (phải bắt ở capture phase để chặn Lenis)
    function handleDropdownScroll(e) {
      if (!contentInnerRef.current) return
      
      const portal = document.getElementById('root-portal')
      
      const isPortalScroll = portal && portal.contains(e.target)
      const isContentScroll = contentInnerRef.current.contains(e.target)
      
      if (!isPortalScroll && !isContentScroll) return

      const maxParent = isPortalScroll ? portal : contentInnerRef.current

      const getScrollableNode = (target, limitParent) => {
        let node = target
        while (node && node !== limitParent && node !== document.body && node !== document) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(node)
            const isScrollableY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight
            if (isScrollableY) return node
            if (style.position === 'absolute' || style.position === 'fixed') {
              const scrollableChild = Array.from(node.querySelectorAll('*')).find(n => {
                const childStyle = window.getComputedStyle(n)
                return (childStyle.overflowY === 'auto' || childStyle.overflowY === 'scroll') && n.scrollHeight > n.clientHeight
              })
              if (scrollableChild) return scrollableChild
            }
          }
          node = node.parentNode
        }
        return null
      }

      const childScrollNode = getScrollableNode(e.target, maxParent)
      if (childScrollNode) {
        e.stopPropagation()
        e.preventDefault()
        childScrollNode.scrollTop += e.deltaY
      } else if (isPortalScroll) {
        // Nếu cuộn bên trong portal (popup lịch) nhưng không có chỗ nào cuộn được, chặn luôn 
        // để không bị cuộn trang bên dưới.
        e.stopPropagation()
        e.preventDefault()
      }
    }

    // Attach handleDropdownScroll to window so it can intercept portal events
    window.addEventListener('wheel', handleDropdownScroll, { passive: false, capture: true })
    page.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleDropdownScroll, { capture: true })
      page.removeEventListener('wheel', handleWheel)
    }
  }, [])  // Chạy 1 lần, handler tự đọc state từ DOM


  // Ẩn window scrollbar khi ở trang này
  useEffect(() => {
    document.documentElement.classList.add('hide-scrollbar')
    return () => document.documentElement.classList.remove('hide-scrollbar')
  }, [])



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
    generalRules: '',
    notes: [
      {
        id: `note-${Date.now()}-1`,
        title: 'Quy định về tư cách tham gia',
        desc: 'Người tham gia phải là sinh viên hoặc người đi làm dưới 5 năm kinh nghiệm. Mỗi đội gồm từ 3 đến 5 thành viên.'
      },
      {
        id: `note-${Date.now()}-2`,
        title: 'Quy định về sản phẩm dự thi',
        desc: 'Sản phẩm chưa từng đoạt giải ở bất kỳ cuộc thi nào khác. Mã nguồn phải được công khai trên GitHub hoặc nền tảng tương tự.'
      }
    ],
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
      { id: 1, name: '', desc: '', teamLimit: '' }
    ],
    mentors: [],
    judges: []
  })
  const [blurredFormData, setBlurredFormData] = useState(formData)

  // Khóa nhận diện thay đổi cấu trúc (số lượng phần tử mảng, id)
  const structureKey = [
    formData.id,
    formData.rounds?.length,
    ...(formData.rounds?.map(r => r.agenda?.length) || []),
    formData.mainPrizes?.length,
    formData.extendedPrizes?.length,
    formData.categories?.length,
    formData.notes?.length,
    formData.manualMilestones?.length
  ].join('-')

  useEffect(() => {
    setBlurredFormData(formData)
  }, [currentStep, structureKey])
  const [status, setStatus] = useState('draft')

  function addToast(toast) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...toast }])
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function handleFormChange(field, val) {
    setFormData(prev => {
      const next = { ...prev, [field]: val }
      
      // Tự động đồng bộ teamDeadline nếu deadlineSameAsClose đang bật
      if (field === 'closeDate' && next.deadlineSameAsClose !== false) {
        next.teamDeadline = val
      }
      if (field === 'deadlineSameAsClose') {
        if (val !== false) {
          next.teamDeadline = next.closeDate ?? null
        } else {
          next.teamDeadline = null
        }
      }
      
      return next
    })
    setStepErrors(prev => ({ ...prev, [field]: undefined })) // xoá error khi user nhập
  }

  // chuẩn hóa lại dữ liệu ngày tháng từ backend về dạng Date object
  const parseBackendDate = (value) => {
    if (!value) return null
    if (value instanceof Date) return value
    if (typeof value === 'number') return new Date(value)

    // Normalize string and handle microseconds (e.g. 2026-07-07T23:34:55.178047)
    let str = String(value).trim()
    if (!str) return null

    // Remove surrounding quotes if any
    str = str.replace(/^"|"$/g, '')

    // Replace whitespace between date and time with 'T'
    str = str.replace(/\s+/g, 'T')

    // If fractional seconds have more than 3 digits (microseconds), truncate to milliseconds
    // e.g. .178047 -> .178
    str = str.replace(/(\.\d{3})\d+/, '$1')

    // Try direct parse first
    let date = new Date(str)
    if (Number.isFinite(date.getTime())) return date

    // Fallback: remove any fractional seconds entirely and try again
    const fallback = str.replace(/\.\d+/, '')
    date = new Date(fallback)
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
          startTime: parseBackendDate(item.startTime ?? item.timeStart ?? null),
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
    if (rawTracks.length === 0) {
      return [{ id: 1, name: '', desc: '', teamLimit: '' }]
    }
    return rawTracks.map((track, index) => ({
      id: track.id ?? track.trackId ?? (index + 1),
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

      const rawQuantity = item.quantity ?? item.prizeQuantity ?? item.amount

      const prize = {
        id: item.id ?? item.prizeId ?? index + 1,
        rank: assignedRank,
        defaultName: shouldBeMain ? `Giải ${index + 1}` : 'VD: Giải Sáng tạo, Giải Cống hiến...',
        name: item.prizeName ?? item.name ?? item.title ?? '',
        quantity: rawQuantity !== null && rawQuantity !== undefined && rawQuantity !== '' ? Number(rawQuantity) : '',
        cash: item.prizeValue ?? item.money ?? item.cash ?? item.amount ?? '',
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

  const normalizeMilestones = (rawMilestones, roundsData) => {
    if (!Array.isArray(rawMilestones)) return undefined
    const roundNames = (roundsData || []).map(r => r.name)
    const autoTitles = ['Mở cổng đăng ký', 'Đóng đăng ký', ...roundNames]
    
    // lọc những milestone được thêm tự động
    const manuals = rawMilestones.filter(m => {
      const title = m.name ?? m.title ?? m.milestoneName ?? ''
      return !autoTitles.includes(title)
    })
    
    return manuals.map((m, idx) => ({
      id: `manual-${Date.now()}-${idx}`,
      title: m.name ?? m.title ?? m.milestoneName ?? '',
      date: parseBackendDate(m.timeStart ?? m.dateStart ?? m.startDate ?? m.date),
      endDate: parseBackendDate(m.timeEnd ?? m.dateEnd ?? m.endDate),
      description: m.des ?? m.description ?? m.milestoneDes ?? ''
    }))
  }

  const loadEventMilestones = async (eventId, roundsData) => {
    const data = await tryLoad([
      { url: '/milestone', params: { eventId } },
      { url: `/milestone/${eventId}` },
      { url: '/milestone', params: { id: eventId } },
    ])
    // The backend sometimes wraps it or returns a raw array
    const raw = data?.milestones ?? data?.milestoneList ?? data
    return normalizeMilestones(raw, roundsData)
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
        
        // Fetch milestones thủ công
        let manualMilestonesData = normalizeMilestones(data.milestones, roundsData)
        if (!manualMilestonesData) {
           manualMilestonesData = await loadEventMilestones(data.eventId ?? id, roundsData)
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
          manualMilestones: manualMilestonesData ?? prev.manualMilestones,
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
  function validateStep(step, data = formData) {
    let isValid = true;
    const errors = {};
    let requiredCount = 0;
    let filledCount = 0;

    if (step === 1) {
      requiredCount = data.deadlineSameAsClose === false ? 8 : 7;
      let invalidCount = 0;

      // name
      if (!data.name?.trim()) { errors.name = 'Vui lòng nhập tên cuộc thi'; invalidCount++; isValid = false; }

      // openDate
      if (!data.openDate) { errors.openDate = 'Vui lòng chọn ngày mở'; invalidCount++; isValid = false; }

      // closeDate — cả trống lẫn sai logic đều tính là invalid
      if (!data.closeDate) { errors.closeDate = 'Vui lòng chọn ngày đóng'; invalidCount++; isValid = false; }
      else if (data.openDate && new Date(data.closeDate).getTime() <= new Date(data.openDate).getTime()) {
        errors.closeDate = 'Ngày đóng phải sau ngày mở'; invalidCount++; isValid = false;
      }

      const min = data.minMembers
      const max = data.maxMembers

      // minMembers — trống hoặc giá trị sai đều tính invalid
      if (min === '' || min === undefined || min === null) { errors.minMembers = 'Bắt buộc'; invalidCount++; isValid = false; }
      else if (Number(min) < 1) { errors.minMembers = '>=1'; invalidCount++; isValid = false; }

      // maxMembers — trống, giá trị sai, hoặc max < min đều tính invalid
      if (max === '' || max === undefined || max === null) { errors.maxMembers = 'Bắt buộc'; invalidCount++; isValid = false; }
      else if (Number(max) < 1) { errors.maxMembers = '>=1'; invalidCount++; isValid = false; }
      else if (Number(min) >= 1 && Number(min) > Number(max)) { errors.maxMembers = 'Max >= Min'; invalidCount++; isValid = false; }

      // avatarFile & coverFile
      if (!data.avatarFile) { errors.avatarFile = 'Vui lòng chọn logo'; invalidCount++; isValid = false; }
      if (!data.coverFile) { errors.coverFile = 'Vui lòng chọn banner'; invalidCount++; isValid = false; }

      // teamDeadline — cả trống lẫn trước ngày đóng đều invalid
      if (data.deadlineSameAsClose === false) {
        if (!data.teamDeadline) { errors.teamDeadline = 'Bắt buộc chọn'; invalidCount++; isValid = false; }
        else if (data.closeDate && new Date(data.teamDeadline).getTime() < new Date(data.closeDate).getTime()) {
          errors.teamDeadline = 'Hạn chót chốt đội không được trước hạn đóng đăng ký'; invalidCount++; isValid = false;
        }
      }

      filledCount = requiredCount - invalidCount;
      return { isValid, errors, requiredCount, filledCount }
    }
    if (step === 2) {
      const rules = data.generalRules ?? ''
      const isEmpty = !rules.trim() || rules === '<p></p>' || rules === '<p><br></p>'
      if (isEmpty) {
        errors.generalRules = 'Vui lòng nhập quy định chung của cuộc thi'
        isValid = false
      }

      const notes = data.notes ?? []
      if (!notes.every(n => n.title?.trim())) isValid = false
      return { isValid, errors, requiredCount: 1, filledCount: isValid ? 1 : 0 }
    }
    if (step === 3) {
      const mainPrizes = data.mainPrizes ?? []
      const rankCount = data.rankCount ?? 3
      const extendedPrizes = data.extendedPrizes ?? []
      
      requiredCount = (rankCount * 2) + (extendedPrizes.length * 2);

      if (mainPrizes.length < rankCount) isValid = false

      let count = 0;
      const mainValid = mainPrizes.every((p, idx) => {
        let pValid = true;
        if (idx < rankCount) {
          if (!p.name?.trim()) {
            errors[`mainPrize-${p.rank}-name`] = 'Vui lòng nhập tên giải thưởng';
            pValid = false;
          } else {
            count++;
          }
          
          if (p.quantity === '' || p.quantity === undefined || p.quantity === null || Number(p.quantity) < 1) {
            errors[`mainPrize-${p.rank}-quantity`] = 'Vui lòng nhập số lượng hợp lệ';
            pValid = false;
          } else {
            count++;
          }
        }
        return pValid;
      })
      if (!mainValid) isValid = false

      const extValid = extendedPrizes.every(p => {
        let pValid = true;
        if (!p.name?.trim()) {
          errors[`extPrize-${p.id}-name`] = 'Vui lòng nhập tên giải thưởng';
          pValid = false;
        } else {
          count++;
        }
        
        if (p.quantity === '' || p.quantity === undefined || p.quantity === null || Number(p.quantity) < 1) {
          errors[`extPrize-${p.id}-quantity`] = 'Vui lòng nhập số lượng hợp lệ';
          pValid = false;
        } else {
          count++;
        }
        return pValid;
      })
      if (!extValid) isValid = false

      filledCount = count;
      return { isValid, errors, requiredCount, filledCount }
    }
    if (step === 4) {
      const rounds = data.rounds ?? []
      if (rounds.length === 0) return { isValid: false, errors, requiredCount: 1, filledCount: 0 }

      let totalRequired = 0;
      let totalFilled = 0;
      isValid = true;

      rounds.forEach((r, idx) => {
        // Name
        totalRequired++;
        if (!r.name?.trim()) {
          errors[`round-${idx}-name`] = 'Vui lòng nhập tên vòng thi';
          isValid = false;
        } else {
          totalFilled++;
        }

        // startDate
        totalRequired++;
        let isStartValid = false;
        if (!r.startDate) {
          errors[`round-${idx}-startDate`] = 'Vui lòng chọn thời gian bắt đầu';
        } else {
          const start = new Date(r.startDate).getTime()
          const lockTime = data.deadlineSameAsClose === false 
                           ? (data.teamDeadline ? new Date(data.teamDeadline).getTime() : null) 
                           : (data.closeDate ? new Date(data.closeDate).getTime() : null);

          if (lockTime && start <= lockTime) {
            errors[`round-${idx}-startDate`] = 'Phải sau hạn chốt đội';
          } else if (idx > 0 && rounds[idx - 1].endDate) {
            const prevEnd = new Date(rounds[idx - 1].endDate).getTime()
            if (start < prevEnd) {
              errors[`round-${idx}-startDate`] = 'Phải sau vòng trước';
            } else {
              isStartValid = true;
            }
          } else {
            isStartValid = true;
          }
        }
        if (isStartValid) totalFilled++;
        else isValid = false;

        // endDate
        totalRequired++;
        let isEndValid = false;
        if (!r.endDate) {
          errors[`round-${idx}-endDate`] = 'Vui lòng chọn thời gian kết thúc';
        } else if (!r.startDate) {
          errors[`round-${idx}-endDate`] = 'Vui lòng chọn thời gian bắt đầu trước';
        } else if (r.startDate) {
          const start = new Date(r.startDate).getTime()
          const end = new Date(r.endDate).getTime()
          if (end <= start) {
            errors[`round-${idx}-endDate`] = 'Phải sau ngày bắt đầu';
          } else {
            isEndValid = true;
          }
        }
        if (isEndValid) totalFilled++;
        else isValid = false;

        // format
        totalRequired++;
        if (r.format === 'offline') {
          if (!r.location) {
            errors[`round-${idx}-location`] = 'Vui lòng chọn địa điểm';
            isValid = false;
          } else {
            totalFilled++;
          }
        } else if (r.format === 'online') {
          if (!r.meetingLink?.trim()) {
            errors[`round-${idx}-meetingLink`] = 'Vui lòng nhập link';
            isValid = false;
          } else {
            totalFilled++;
          }
        } else {
          isValid = false;
        }

        // submission
        if (r.submissionType === 'new') {
          totalRequired++;
          let isSubValid = false;
          if (!r.submissionDeadline) {
            errors[`round-${idx}-submissionDeadline`] = 'Vui lòng chọn hạn nộp bài';
          } else if (r.startDate && r.endDate) {
            const subDeadline = new Date(r.submissionDeadline).getTime()
            const start = new Date(r.startDate).getTime()
            const end = new Date(r.endDate).getTime()
            if (subDeadline <= start || subDeadline >= end) {
              errors[`round-${idx}-submissionDeadline`] = 'Phải trong thời gian vòng thi';
            } else if (r.submissionOpen) {
              const subOpen = new Date(r.submissionOpen).getTime()
              if (subDeadline <= subOpen) {
                errors[`round-${idx}-submissionDeadline`] = 'Phải sau khi mở nộp bài';
              } else if (subOpen < start) {
                errors[`round-${idx}-submissionOpen`] = 'Phải từ lúc bắt đầu vòng thi';
              } else {
                isSubValid = true;
              }
            } else {
              isSubValid = true;
            }
          } else {
            errors[`round-${idx}-submissionDeadline`] = 'Vui lòng chọn thời gian bắt đầu và kết thúc vòng thi trước';
          }
          if (isSubValid) totalFilled++;
          else isValid = false;
        }

        // agenda
        const agenda = r.agenda ?? []
        let agendaValid = true;
        agenda.forEach((item, i) => {
          totalRequired += 2;
          if (!item.name || item.name.trim() === '') {
            agendaValid = false;
          } else {
            totalFilled++;
          }
          if (!item.startTime) {
            agendaValid = false;
          } else {
            totalFilled++;
          }
          if (i > 0) {
            const prev = agenda[i - 1]
            if (prev.startTime && item.startTime && item.startTime <= prev.startTime) {
              agendaValid = false;
            }
          }
        })
        if (!agendaValid) isValid = false
      })

      return { isValid, errors, requiredCount: totalRequired, filledCount: totalFilled }
    }
    if (step === 5) {
      const categories = data.categories ?? []
      requiredCount = categories.length;
      if (categories.length === 0) return { isValid: false, errors, requiredCount: 1, filledCount: 0 }

      let count = 0;
      isValid = categories.every(c => {
        let catValid = true;
        if (!c.name?.trim()) {
           errors[`category-${c.id}-name`] = 'Vui lòng nhập tên hạng mục'
           catValid = false
        }
        if (c.teamLimit !== '' && c.teamLimit !== undefined && c.teamLimit !== null) {
          if (Number(c.teamLimit) < 1) {
             errors[`category-${c.id}-teamLimit`] = 'Tối thiểu 1'
             catValid = false
          }
        }
        if (catValid) count++;
        return catValid;
      })
      filledCount = count;
      return { isValid, errors, requiredCount, filledCount }
    }
    if (step === 6) {
      const manuals = data.manualMilestones ?? []
      requiredCount = manuals.length * 2;
      if (manuals.length === 0) return { isValid: true, errors, requiredCount: 0, filledCount: 0 }

      let count = 0;
      isValid = manuals.every(ms => {
        let msValid = true;
        if (!ms.title?.trim()) {
           errors[`manual-${ms.id}-title`] = 'Vui lòng nhập tên mốc'
           msValid = false
        } else {
           count++
        }

        if (!ms.date) {
           errors[`manual-${ms.id}-date`] = 'Vui lòng chọn thời gian bắt đầu'
           msValid = false
        } else {
           count++
        }

        if (ms.date && ms.endDate && new Date(ms.endDate).getTime() <= new Date(ms.date).getTime()) {
           errors[`manual-${ms.id}-endDate`] = 'Phải sau thời gian bắt đầu'
           msValid = false
        }
        
        return msValid;
      })
      filledCount = count;
      return { isValid, errors, requiredCount, filledCount }
    }
    return { isValid, errors, requiredCount: 0, filledCount: 0 }
  }

  function goToStep(step) {
    const { isValid } = validateStep(currentStep)
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
    // Luôn cho phép chuyển trang, nhưng vẫn hiển thị lỗi để user biết
    const { errors } = validateStep(currentStep)
    setStepErrors(errors)

    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }

    // Lưu ngầm background — không hiện thông báo khi nhấn Tiếp theo
    // Nếu đang ở bước cuối cùng: điều hướng về danh sách sự kiện ngay lập tức (không lưu nháp)
    if (currentStep >= TOTAL_STEPS) {
      navigate('/admin/coordinator/events');
      return;
    }

    handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange });
  }
  // ------------------------------------------------------------------
  function handleBack() { if (currentStep > 1) goToStep(currentStep - 1) }



  // Trong component:
  async function onSaveDraft() {
    // Validate để bôi đỏ/cam các ô nếu thiếu, nhưng vẫn cho qua lưu nháp
    const { errors, isValid, requiredCount, filledCount } = validateStep(currentStep)
    setStepErrors(errors)

    const isSuccess = await handleSaveDraft({ currentStep, formData, axiosClient, handleFormChange });

    const STEP_NAMES = ['Thông tin cơ bản', 'Thể lệ', 'Giải thưởng', 'Vòng thi', 'Bảng thi đấu', 'Lịch trình', 'Ban giám khảo']
    const stepName = STEP_NAMES[currentStep - 1] ?? `Trang ${currentStep}`

    if (isSuccess) {
      if (!isValid) {
        const missing = requiredCount - filledCount
        addToast({
          variant: 'success',
          title: `Đã lưu nháp “${stepName}” thành công`,
          message: `Còn ${missing} thông tin bắt buộc chưa điền hoặc chưa hợp lệ. Nếu muốn công bố sự kiện, vui lòng điền đầy đủ và chính xác các thông tin này.`,
          duration: 6000,
        })
      } else {
        addToast({
          variant: 'success',
          title: `Đã lưu nháp “${stepName}” thành công`,
          message: 'Tất cả thông tin của trang này đã được lưu lại.',
          duration: 3000,
        })
      }
    } else {
      addToast({
        variant: 'warning',
        title: 'Lưu nháp thất bại',
        message: 'Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.',
        duration: 6000,
      })
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
      case 1: return <Step1BasicInfo formData={formData} onFormChange={handleFormChange} errors={stepErrors} />
      case 2: return <Step2Rules formData={formData} onFormChange={handleFormChange} errors={stepErrors} />
      case 3: return <Step3Prizes formData={formData} onFormChange={handleFormChange} errors={stepErrors} />
      case 4: return <Step4Rounds formData={formData} onChange={setFormData} errors={stepErrors} />
      case 5: return <Step5Categories formData={formData} onFormChange={handleFormChange} errors={stepErrors} />
      case 6: return <Step6Timeline formData={formData} onChange={setFormData} errors={stepErrors} />
      case 7: return <Step7MentorJudge formData={formData} onFormChange={handleFormChange} />
      default: return null
    }
  }
  const isPublishDisabled = ![1, 2, 3, 4, 5].every(step => validateStep(step, blurredFormData).isValid)
  return (
    // <CoordinatorLayout>
    // </CoordinatorLayout>

    <div ref={pageRef} className={styles.page} onBlurCapture={() => setBlurredFormData(formData)}>

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
        {/* Sentinel element to track when sidebar becomes sticky */}
        <div ref={sentinelRef} className={styles.sidebarSentinel} />

        <NestedSmoothScroll
          className={`${styles.sidebar} ${isSidebarSticky ? styles.sidebarSticky : ''}`}
          innerClassName={styles.sidebarInner}
        >
          <CreateEventSidebar
            currentStep={currentStep}
            visitedSteps={visitedSteps}
            errorSteps={errorSteps}
            onStepClick={goToStep}
          />
        </NestedSmoothScroll>

        <main className={styles.contentWrapper}>
          <NestedSmoothScroll
            innerRef={contentInnerRef}
            className={`${styles.content} ${isSidebarSticky ? styles.contentSticky : ''}`}
          >
            {renderStep()}
            <div className={styles.extraSpace}></div>
          </NestedSmoothScroll>
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
        requiredCount={validateStep(currentStep, blurredFormData).requiredCount}
        filledCount={validateStep(currentStep, blurredFormData).filledCount}
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

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}

export default CreateEventPage