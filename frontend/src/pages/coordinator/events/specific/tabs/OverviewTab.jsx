import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosClient from '../../../../../api/axiosClient'

import EventInfoCard from '../../../../../components/coordinator/events/overview/EventInfoCard'
import EventBenefitsSection from '../../../../../components/coordinator/events/overview/EventBenefitsSection'
import PrizeStructureSection from '../../../../../components/coordinator/events/overview/PrizeStructureSection'
import GeneralRulesSection from '../../../../../components/coordinator/events/overview/GeneralRulesSection'
import EventTimelineCard from '../../../../../components/coordinator/events/overview/EventTimelineCard'
import RoundInfoCard from '../../../../../components/panelist/RoundInfoCard'
import ScoringCriteriaModal from '../../../../../components/panelist/event/judgeRoundDetail/ScoringCriteriaModal'
import styles from './OverviewTab.module.css'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

function getTier(index, type) {
  if (type === 'EXTENDED') return 'default';
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return 'default';
}

/**
 * OverviewTab — Tab Tổng quan của SpecificEventPage
 * Layout 2 cột: trái (nội dung chính) / phải (timeline + vòng tiếp theo)
 */
function OverviewTab() {
  const { eventId } = useParams()
  const [eventData, setEventData] = useState(null)
  const [eventNotes, setEventNotes] = useState(null)
  const [loading, setLoading] = useState(true)

  // State cho Modal Tiêu chí
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false)
  const [roundCriteria, setRoundCriteria] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, notesRes] = await Promise.all([
          axiosClient.get(`/event/${eventId}`),
          axiosClient.get(`/event-notes/${eventId}`).catch(() => null),
        ])
        
        const rawEvent = eventRes.data
        setEventData(rawEvent?.data ?? rawEvent?.result ?? rawEvent?.payload ?? rawEvent)

        if (notesRes) {
          const rawNotes = notesRes.data
          const parsedNotes = rawNotes?.data ?? rawNotes?.result ?? rawNotes?.payload ?? rawNotes
          if (Array.isArray(parsedNotes)) {
             setEventNotes({ notes: parsedNotes })
          } else {
             setEventNotes({
                rules: parsedNotes?.rules ?? parsedNotes?.generalRules,
                benefits: parsedNotes?.participationBenefits ?? parsedNotes?.benefits,
                notes: parsedNotes?.notes ?? parsedNotes?.ruleNotes
             })
          }
        }
      } catch (error) {
        console.error('Failed to fetch event info', error)
      } finally {
        setLoading(false)
      }
    }
    if (eventId) {
      fetchData()
    }
  }, [eventId])

  const handleViewRubric = async (roundId) => {
    if (!roundCriteria) {
      try {
        const res = await axiosClient.get(`/round/rounds/${roundId}`)
        setRoundCriteria(res.data?.criteria || [])
      } catch (error) {
        console.error("Failed to load criteria", error)
        setRoundCriteria([])
      }
    }
    setIsCriteriaModalOpen(true)
  }

  if (loading) {
    return <div className={styles.tab} style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
  }

  if (!eventData) {
    return <div className={styles.tab} style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy dữ liệu sự kiện</div>
  }

  // Tính tổng số đội thi từ mảng tracks (nếu teamQuantity = 0)
  const totalTeamsFromTracks = (eventData.tracks || []).reduce((sum, t) => sum + (t.currentTeams || 0), 0);

  // 1. EventInfo
  const mappedEvent = {
    banner: eventData.bannerImg,
    topic: eventData.eventTopic,
    introHtml: eventData.description,
    descriptionHtml: eventData.descriptionDetails,
    registerStart: formatDate(eventData.openRegisterTime),
    registerEnd: formatDate(eventData.closeRegisterTime),
    participantCount: eventData.candidateQuantity || 0,
    teamCount: eventData.teamQuantity || totalTeamsFromTracks || 0,
    teamLimit: eventData.tracks?.reduce((sum, t) => sum + (t.maxTeamPerTrack || 0), 0) || 0,
    tags: eventData.tracks?.map(t => t.name) || [],
  }

  // 2. Benefits
  const benefitsHtml = eventData.participationBenefits || eventNotes?.benefits

  // 3. Prizes
  const mappedPrizes = (eventData.prizes || []).map((p, i) => ({
    tier: getTier(i, p.prizeType),
    name: p.prizeName,
    cash: p.prizeValue,
    description: p.description,
    count: p.quantity
  }))
  const totalCash = mappedPrizes.reduce((sum, p) => sum + (p.cash * (p.count || 1)), 0)

  // 4. Rules
  const rulesHtml = eventData.rules || eventNotes?.rules

  // 5. Milestones
  const mappedMilestones = (eventData.milestones || []).map(m => ({
    id: m.id,
    title: m.milestoneName,
    date: new Date(m.dateStart),
    endDate: m.dateEnd ? new Date(m.dateEnd) : undefined,
    description: m.des,
    link: m.des && m.des.startsWith('http') ? m.des : undefined,
    location: m.des && !m.des.startsWith('http') && m.des !== 'Hệ thống tự động' ? m.des : undefined
  }))

  // 6. Next Round
  const sortedRounds = [...(eventData.rounds || [])].sort((a, b) => a.roundOrdinalNumber - b.roundOrdinalNumber)
  const nextRoundData = sortedRounds.find(r => r.status === 'IN_PROGRESS') || sortedRounds.find(r => r.status === 'UPCOMING')
  
  let mappedNextRound = null
  if (nextRoundData) {
    mappedNextRound = {
      index: nextRoundData.roundOrdinalNumber,
      total: nextRoundData.roundQuantity || sortedRounds.length,
      name: nextRoundData.roundName,
      phaseLabel: nextRoundData.status === 'IN_PROGRESS' ? 'Đang diễn ra' : 'Sắp diễn ra',
      submitDeadline: nextRoundData.roundSubmissionDeadline,
      submitted: `${nextRoundData.submissionQuantity || 0} / ${mappedEvent.teamCount}`,
      rubricName: 'Tiêu chí chấm thi',
      schedule: (nextRoundData.timelines || []).map(t => ({
        time: `${t.timeStart} - ${t.timeEnd}`,
        title: t.name,
        desc: t.description
      }))
    }
  }

  return (
    <div className={styles.tab}>
      <EventInfoCard event={mappedEvent} totalCash={totalCash} />
      {/* ── 2 cột chính ── */}
      <div className={styles.layout}>
        {/* ── Cột trái: nội dung sự kiện ── */}
        <div className={styles.leftCol}>
          <EventBenefitsSection html={benefitsHtml} />
          <PrizeStructureSection prizes={mappedPrizes} totalCash={totalCash} />
          <GeneralRulesSection html={rulesHtml} />
        </div>

        {/* ── Cột phải: Timeline + Vòng sắp diễn ra (gộp chung 1 container) ── */}
        <div className={styles.rightCol}>
          <div className={styles.timelineGroup}>
            <EventTimelineCard milestones={mappedMilestones} hasNext={!!mappedNextRound} />

            {/* Vòng sắp diễn ra — không có SectionHeader, nằm ngay dưới timeline */}
            {mappedNextRound && (
              <div className={styles.roundBox}>
                <RoundInfoCard 
                  round={mappedNextRound} 
                  onViewRubric={() => handleViewRubric(nextRoundData.roundId)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <ScoringCriteriaModal 
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        criteria={roundCriteria || []}
        showFooter={false}
      />
    </div>
  )
}

export default OverviewTab

