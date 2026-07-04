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

    // Lắng nghe sự kiện để xử lý riêng việc cuộn Dropdown (phải bắt ở capture phase để chặn Lenis)
    function handleDropdownScroll(e) {
      if (!contentInnerRef.current) return
      const el = contentInnerRef.current
      if (!el.contains(e.target)) return

      const getScrollableNode = (target, maxParent) => {
        let node = target
        while (node && node !== maxParent && node !== document.body) {
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

      const childScrollNode = getScrollableNode(e.target, el)
      if (childScrollNode) {
        e.stopPropagation()
        e.preventDefault()
        childScrollNode.scrollTop += e.deltaY
      }
    }

    page.addEventListener('wheel', handleDropdownScroll, { passive: false, capture: true })
    page.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      page.removeEventListener('wheel', handleDropdownScroll, { capture: true })
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
    notes: [
      {
        id: Date.now(),
        title: 'Thông tin đội thi không thể thay đổi sau khi chốt',
        desc: 'Để đảm bảo tính công bằng và minh bạch cho cuộc thi, sau khi thời hạn chốt đội kết thúc, mọi thông tin liên quan đến thành viên và thông tin chung của đội sẽ bị khóa hoàn toàn. Ban tổ chức sẽ không giải quyết bất kỳ yêu cầu thay đổi nào trừ các trường hợp bất khả kháng.'
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
      { id: 'cat-1', name: '', desc: '', teamLimit: '' }
    ]
  })
  const [status, setStatus] = useState('draft')

  function addToast(toast) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...toast }])
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function handleFormChange(field, val) {
    setFormData(prev => ({ ...prev, [field]: val }))
    setStepErrors(prev => ({ ...prev, [field]: undefined })) // Clear error when user types
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
    let isValid = true;
    const errors = {};
    let requiredCount = 0;
    let filledCount = 0;

    if (step === 1) {
      requiredCount = formData.deadlineSameAsClose === false ? 8 : 7;
      let invalidCount = 0;

      // name
      if (!formData.name?.trim()) { errors.name = 'Vui l\u00f2ng nh\u1eadp t\u00ean cu\u1ed9c thi'; invalidCount++; isValid = false; }

      // openDate
      if (!formData.openDate) { errors.openDate = 'Vui l\u00f2ng ch\u1ecdn ng\u00e0y m\u1edf'; invalidCount++; isValid = false; }

      // closeDate — c\u1ea3 tr\u1ed1ng l\u1eabn sai logic \u0111\u1ec1u tính l\u00e0 invalid
      if (!formData.closeDate) { errors.closeDate = 'Vui l\u00f2ng ch\u1ecdn ng\u00e0y \u0111\u00f3ng'; invalidCount++; isValid = false; }
      else if (formData.openDate && new Date(formData.closeDate).getTime() <= new Date(formData.openDate).getTime()) {
        errors.closeDate = 'Ng\u00e0y \u0111\u00f3ng ph\u1ea3i sau ng\u00e0y m\u1edf'; invalidCount++; isValid = false;
      }

      const min = formData.minMembers
      const max = formData.maxMembers

      // minMembers — tr\u1ed1ng ho\u1eb7c gi\u00e1 tr\u1ecb sai \u0111\u1ec1u tính invalid
      if (min === '' || min === undefined || min === null) { errors.minMembers = 'B\u1eaft bu\u1ed9c'; invalidCount++; isValid = false; }
      else if (Number(min) < 1) { errors.minMembers = '>=1'; invalidCount++; isValid = false; }

      // maxMembers — tr\u1ed1ng, gi\u00e1 tr\u1ecb sai, ho\u1eb7c max < min \u0111\u1ec1u tính invalid
      if (max === '' || max === undefined || max === null) { errors.maxMembers = 'B\u1eaft bu\u1ed9c'; invalidCount++; isValid = false; }
      else if (Number(max) < 1) { errors.maxMembers = '>=1'; invalidCount++; isValid = false; }
      else if (Number(min) >= 1 && Number(min) > Number(max)) { errors.maxMembers = 'Max \u003e= Min'; invalidCount++; isValid = false; }

      // avatarFile & coverFile
      if (!formData.avatarFile) { errors.avatarFile = 'Vui l\u00f2ng ch\u1ecdn logo'; invalidCount++; isValid = false; }
      if (!formData.coverFile) { errors.coverFile = 'Vui l\u00f2ng ch\u1ecdn banner'; invalidCount++; isValid = false; }

      // teamDeadline — c\u1ea3 tr\u1ed1ng l\u1eabn tr\u01b0\u1edbc ng\u00e0y \u0111\u00f3ng \u0111\u1ec1u invalid
      if (formData.deadlineSameAsClose === false) {
        if (!formData.teamDeadline) { errors.teamDeadline = 'B\u1eaft bu\u1ed9c ch\u1ecdn'; invalidCount++; isValid = false; }
        else if (formData.closeDate && new Date(formData.teamDeadline).getTime() < new Date(formData.closeDate).getTime()) {
          errors.teamDeadline = 'H\u1ea1n ch\u00f3t ch\u1ed1t \u0111\u1ed9i kh\u00f4ng \u0111\u01b0\u1ee3c tr\u01b0\u1edbc h\u1ea1n \u0111\u00f3ng \u0111\u0103ng k\u00fd'; invalidCount++; isValid = false;
        }
      }

      filledCount = requiredCount - invalidCount;
      return { isValid, errors, requiredCount, filledCount }
    }
    if (step === 2) {
      const rules = formData.generalRules ?? ''
      const isEmpty = !rules.trim() || rules === '<p></p>' || rules === '<p><br></p>'
      if (isEmpty) {
        errors.generalRules = 'Vui lòng nhập quy định chung của cuộc thi'
        isValid = false
      }

      const notes = formData.notes ?? []
      if (!notes.every(n => n.title?.trim())) isValid = false
      return { isValid, errors, requiredCount: 1, filledCount: isValid ? 1 : 0 }
    }
    if (step === 3) {
      const mainPrizes = formData.mainPrizes ?? []
      const rankCount = formData.rankCount ?? 3
      requiredCount = rankCount;

      if (mainPrizes.length < rankCount) isValid = false

      let count = 0;
      const mainValid = mainPrizes.every((p, idx) => {
        const isOk = p.name?.trim() && p.quantity !== '' && p.quantity !== undefined && p.quantity !== null && Number(p.quantity) >= 1;
        if (isOk && idx < rankCount) count++;
        return isOk;
      })
      if (!mainValid) isValid = false

      const extendedPrizes = formData.extendedPrizes ?? []
      const extValid = extendedPrizes.every(p =>
        p.name?.trim() && p.quantity !== '' && p.quantity !== undefined && p.quantity !== null && Number(p.quantity) >= 1
      )
      if (!extValid) isValid = false

      filledCount = count;
      return { isValid, errors, requiredCount, filledCount }
    }
    if (step === 4) {
      const rounds = formData.rounds ?? []
      requiredCount = rounds.length;
      if (rounds.length === 0) return { isValid: false, errors, requiredCount: 1, filledCount: 0 }

      let count = 0;
      isValid = rounds.every((r, idx) => {
        let roundValid = true;
        if (!r.name?.trim()) roundValid = false
        if (!r.startDate || !r.endDate) roundValid = false

        const start = new Date(r.startDate).getTime()
        const end = new Date(r.endDate).getTime()
        if (end <= start) roundValid = false
        if (idx > 0) {
          const prevEnd = new Date(rounds[idx - 1].endDate).getTime()
          if (start < prevEnd) roundValid = false
        }

        if (r.format === 'offline' && !r.location) roundValid = false
        if (r.format === 'online' && !r.meetingLink?.trim()) roundValid = false

        if (r.submissionType === 'new') {
          if (!r.submissionDeadline) roundValid = false
          const subDeadline = new Date(r.submissionDeadline).getTime()
          if (subDeadline <= start || subDeadline >= end) roundValid = false
          if (r.submissionOpen) {
            const subOpen = new Date(r.submissionOpen).getTime()
            if (subDeadline <= subOpen) roundValid = false
            if (subOpen < start) roundValid = false
          }
        }

        const agenda = r.agenda ?? []
        const agendaValid = agenda.every((item, i) => {
          if (i === 0) return true
          const prev = agenda[i - 1]
          if (prev.startTime && item.startTime && item.startTime <= prev.startTime) return false
          return true
        })
        if (!agendaValid) roundValid = false

        if (roundValid) count++;
        return roundValid;
      })
      filledCount = count;
      return { isValid, errors, requiredCount, filledCount }
    }
    if (step === 5) {
      const categories = formData.categories ?? []
      requiredCount = categories.length;
      if (categories.length === 0) return { isValid: false, errors, requiredCount: 1, filledCount: 0 }

      let count = 0;
      isValid = categories.every(c => {
        let catValid = true;
        if (!c.name?.trim()) catValid = false
        if (c.teamLimit !== '' && c.teamLimit !== undefined && c.teamLimit !== null) {
          if (Number(c.teamLimit) < 1) catValid = false
        }
        if (catValid) count++;
        return catValid;
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
      case 3: return <Step3Prizes formData={formData} onFormChange={handleFormChange} />
      case 4: return <Step4Rounds formData={formData} onChange={setFormData} />
      case 5: return <Step5Categories formData={formData} onFormChange={handleFormChange} />
      case 6: return <Step6Timeline formData={formData} onFormChange={handleFormChange} />
      case 7: return <Step7MentorJudge formData={formData} onFormChange={handleFormChange} />
      default: return null
    }
  }
  const isPublishDisabled = ![1, 2, 3, 4, 5].every(step => validateStep(step).isValid)
  return (
    // <CoordinatorLayout>
    // </CoordinatorLayout>

    <div ref={pageRef} className={styles.page}>

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
        requiredCount={validateStep(currentStep).requiredCount}
        filledCount={validateStep(currentStep).filledCount}
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