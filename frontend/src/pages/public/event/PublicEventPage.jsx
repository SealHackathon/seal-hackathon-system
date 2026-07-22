import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../AuthContext'
import axiosClient from '../../../api/axiosClient'
import PublicNav from './sections/PublicNav'
import HeroSection from './sections/HeroSection'
import AboutSection from './sections/AboutSection'
import RulesSection from './sections/RulesSection'
import PrizesSection from './sections/PrizesSection'
import RoundsSection from './sections/RoundsSection'
import CategoriesSection from './sections/CategoriesSection'
import TimelineSection from './sections/TimelineSection'
import PeopleSection from './sections/PeopleSection'
import CtaSection from './sections/CtaSection'
import MarqueeSection from './sections/MarqueeSection'
import UserLayout from '../../../layouts/UserLayout'
import { API_EVENT_MOCK } from './publicEventMock'
import styles from './PublicEventPage.module.css'

// Mục điều hướng (id trùng với id section để cuộn tới)
const NAV_SECTIONS = [
  { id: 'about', label: 'Giới thiệu' },
  { id: 'rules', label: 'Thể lệ' },
  { id: 'prizes', label: 'Giải thưởng' },
  { id: 'rounds', label: 'Vòng thi' },
  { id: 'categories', label: 'Bảng đấu' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'people', label: 'Giám khảo' },
]

/**
 * PublicEventPage — trang công khai giới thiệu 1 sự kiện (landing page)
 * Toàn bộ dữ liệu nhận qua props để fullstack gắn API dễ dàng.
 */
function PublicEventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { userInfo, role } = useAuth()
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(true)

  const showRegisterBtn = !userInfo || role === 'USER';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axiosClient.get(`/event/${eventId}`)
        setApiData(res.data)
      } catch (error) {
        console.error("Failed to fetch event", error)
        setApiData(API_EVENT_MOCK) // Fallback for testing if API fails
      } finally {
        setLoading(false)
      }
    }
    if (eventId) fetchEvent()
    else {
      setApiData(API_EVENT_MOCK)
      setLoading(false)
    }
  }, [eventId])

  // Map data từ chuẩn backend sang chuẩn props của các sections cũ
  const { event, rules, prizes, rounds, categories, milestones, people } = useMemo(() => {
    const raw = apiData
    if (!raw) return {}

    const ev = {
      name: raw.eventName,
      theme: raw.eventTopic,
      shortDesc: raw.description,
      detailDesc: raw.descriptionDetails,
      bannerUrl: raw.bannerImg || null,
      thumbnailUrl: raw.thumbnailImage || null,
      registration: { open: raw.openRegisterTime, close: raw.closeRegisterTime },
      teamDeadline: raw.cofirmTeamTime,
      teamSize: { min: raw.minTeamMember, max: raw.maxTeamMember },
      location: raw.eventLocation || 'Trực tuyến & Trực tiếp',
    }

    const ru = {
      general: raw.rules || raw.eventRules,
      notes: (raw.notes || []).map(n => ({ title: n.title, desc: n.description || n.detail })),
    }

    const pr = {
      main: (raw.prizes || []).filter(p => p.prizeType === 'MAIN' || p.type === 'main').map((p, idx) => ({
        name: p.prizeName || p.name,
        count: p.quantity || p.amount,
        cash: p.prizeValue,
        perks: p.description,
        tier: p.rank === 1 ? 'gold' : p.rank === 2 ? 'silver' : p.rank === 3 ? 'bronze' : idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'default',
      })),
      extended: (raw.prizes || []).filter(p => p.prizeType === 'EXTENDED' || p.type === 'extended').map(p => ({
        name: p.prizeName || p.name,
        count: p.quantity || p.amount,
        cash: p.prizeValue,
        perks: p.description,
        tier: 'default',
      }))
    }

    const ro = (raw.rounds || []).map(r => ({
      id: r.roundId,
      name: r.roundName,
      start: r.roundStartTime || r.timeStart,
      end: r.roundEndTime || r.timeEnd,
      mode: r.format || (r.locationName ? 'offline' : 'online'),
      link: r.meetingLink,
      topTeamPass: r.topTeamPass,
      location: (r.locationName || r.detailLocation) ? {
        address: r.detailLocation || r.locationName,
        name: r.locationName || 'Địa điểm thi đấu',
        lat: r.lat, // Có thể undefined, LocationBanner sẽ tự lấy qua API
        lng: r.lng
      } : undefined,
      submissionType: r.submissionType,
      submission: r.submissionConfig ? {
        open: r.submissionConfig.openingTime,
        deadline: r.submissionConfig.submissionDeadline,
        guide: r.submissionConfig.submissionInstructions,
      } : undefined,
      agenda: (r.timelines || []).map(t => ({
        name: t.name || t.timelineName,
        time: t.timeStart,
        desc: t.description,
      })),
      criteria: r.criteria,
      details: r.details
    }))

    const ca = (raw.tracks || []).map(t => ({
      id: t.id || t.trackId,
      name: t.name || t.trackName,
      desc: t.des || t.description,
      maxTeams: t.maxTeamPerTrack,
      currentTeams: t.currentTeams || 0,
    }))

    const mi = (raw.milestones || []).map(m => ({
      name: m.milestoneName,
      start: m.dateStart || m.timeStart,
      end: m.dateEnd || m.timeEnd,
      desc: m.des || m.milestoneDes,
      link: m.link || (m.milestoneName?.toLowerCase().includes('workshop') ? 'https://meet.google.com/abc-xyz-def' : undefined),
    }))

    const pe = {
      mentors: (raw.mentors || []).map(m => ({
        name: m.receiver?.fullName,
        role: m.receiver?.title || m.receiver?.position,
        org: m.receiver?.orgName,
        avatar: m.receiver?.avatarUrl,
        track: m.trackId,
      })),
      judges: (raw.judges || []).map(j => ({
        name: j.receiver?.fullName,
        role: j.receiver?.title || j.receiver?.position,
        org: j.receiver?.orgName,
        avatar: j.receiver?.avatarUrl,
        round: j.roundId || j.roundIds?.[0]?.id,
      }))
    }

    return { event: ev, rules: ru, prizes: pr, rounds: ro, categories: ca, milestones: mi, people: pe }
  }, [apiData])

  const handleRegister = () => {
    if (!userInfo) {
      navigate('/register')
    } else {
      // Lưu lại id sự kiện mà user định tham gia để dashboard có thể bắt lấy
      localStorage.setItem('eventId', String(eventId))
      navigate('/user/dashboard')
    }
  }

  if (loading || !apiData) return <div className={styles.page}>Đang tải...</div>

  return (
    <UserLayout fullWidth showCard={false}>
      <div className={styles.page}>
        <PublicNav event={event} sections={NAV_SECTIONS} onRegister={handleRegister} showRegisterBtn={showRegisterBtn} />
        <HeroSection
          event={event}
          prizes={prizes}
          rounds={rounds}
          categories={categories}
          people={people}
          onRegister={handleRegister}
          showRegisterBtn={showRegisterBtn}
        />

        {event?.theme && <MarqueeSection text={event.theme} />}

        <main className={styles.main}>
          <AboutSection id="about" event={event} />
          <RulesSection id="rules" rules={rules} />
          <PrizesSection id="prizes" prizes={prizes} />
          <RoundsSection id="rounds" rounds={rounds} />
          <CategoriesSection id="categories" categories={categories} />
          <TimelineSection id="timeline" event={event} rounds={rounds} milestones={milestones} />
          <PeopleSection id="people" people={people} categories={categories} rounds={rounds} />
        </main>

        <CtaSection event={event} onRegister={handleRegister} showRegisterBtn={showRegisterBtn} />
      </div>
    </UserLayout>
  )
}

export default PublicEventPage
