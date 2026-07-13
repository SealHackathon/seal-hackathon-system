import { useEffect, useState } from 'react'
import UserLayout from '../layouts/UserLayout'
import MilestoneBanner from '../components/dashboard/MilestoneBanner'
import LiveEventCard from '../components/dashboard/LiveEventCard'
import ProfilePendingModal from '../components/dashboard/ProfilePendingModal'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import axiosClient from '../api/axiosClient'
import DisclaimerStep from '../components/joinFlow/DisclaimerStep'
// import styles from './UserDashboard.module.css'

function mapApiEventToUi(apiEvent) {
    if (!apiEvent) return null

    const start = apiEvent.startDate || apiEvent.openDate || apiEvent.eventStartDate || apiEvent.eventStartTime || apiEvent.dateStart || apiEvent.milestones?.[0]?.dateStart
    const closingRegistrationMilestone = (apiEvent.milestones || []).find((milestone) => {
        const milestoneName = (milestone.milestoneName || milestone.name || '').trim().toLowerCase()
        return milestoneName === 'đóng đăng ký'
    })
    const end = apiEvent.endDate
        || apiEvent.closeDate
        || apiEvent.eventEndDate
        || apiEvent.eventEndTime
        || apiEvent.dateEnd
        || closingRegistrationMilestone?.dateStart
        || apiEvent.milestones?.slice(-1)?.[0]?.dateEnd

    const timeline = (apiEvent.milestones || []).map((milestone, index) => ({
        id: milestone.id ?? index + 1,
        name: milestone.milestoneName || milestone.name || 'Cột mốc',
        date: milestone.dateStart || milestone.startDate || milestone.date || null,
        note: milestone.des || milestone.description || milestone.note || null,
    }))

    return {
        id: apiEvent.eventId ?? apiEvent.id,
        name: apiEvent.eventName || 'Sự kiện chưa đặt tên',
        coverUrl: apiEvent.thumbnail || null,
        topic: apiEvent.eventTopic || 'Chưa xác định chủ đề',
        description: apiEvent.description || 'Chưa có mô tả',
        eventStatus: apiEvent.eventStatus || 'draft',
        startDate: start,
        endDate: end,
        location: apiEvent.eventLocation || 'Trực tuyến',
        prize: apiEvent.prize != null && !Array.isArray(apiEvent.prize)
            ? Number(apiEvent.prize)
            : (apiEvent.prizes || []).reduce((sum, p) => sum + ((p.prizeValue || 0) * (p.quantity || 1)), 0),
        maxTeamMember: apiEvent.maxTeamMember || apiEvent.maxMemberPerTeam || 5,
        teamCount: apiEvent.teamQuantity || 0,
        maxTeamLimit: apiEvent.maxTeamLimit || (apiEvent.tracks || []).reduce((sum, t) => sum + (t.maxTeamPerTrack || 0), 0) || 0,
        participantCount: apiEvent.candidateQuantity || 0,
        trackCount: apiEvent.trackQuantity || 0,
        roundCount: apiEvent.roundQuantity || 0,
        isCurrentUserRegistered: apiEvent.isCurrentUserRegistered || false,
        timeline,
        notes: apiEvent.notes || [],
    }
}

function UserDashboard() {
    const { userStatus } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [loading, setLoading] = useState(true)
    const [registeredEventId, setRegisteredEventId] = useState(() => localStorage.getItem('joinedEventId'))

    const [showPendingModal, setShowPendingModal] = useState(() => {
        if (userStatus === 'PENDING_APPROVAL') {
            const hasSeen = sessionStorage.getItem('hasSeenProfilePendingModal');
            return !hasSeen;
        }
        return false;
    });
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    useEffect(() => {
        let isMounted = true

        axiosClient.get('/event/live')
            .then(async (response) => {
                if (!isMounted) return

                const payload = response?.data
                const list = Array.isArray(payload) ? payload : payload ? [payload] : []
                let selected = list.find((item) => ['live', 'upcoming', 'active', 'published'].includes((item.eventStatus || '').toLowerCase())) || list[0] || null

                if (selected && (selected.eventId || selected.id)) {
                    const id = selected.eventId || selected.id
                    try {
                        const [eventRes, notesRes] = await Promise.all([
                            axiosClient.get(`/event/${id}`),
                            axiosClient.get(`/event-notes/${id}`).catch(() => null),
                        ])
                        const rawEvent = eventRes.data
                        const eventData = rawEvent?.data ?? rawEvent?.result ?? rawEvent?.payload ?? rawEvent
                        
                        let notesHtml = ''
                        if (notesRes) {
                            const rawNotes = notesRes.data
                            const parsedNotes = rawNotes?.data ?? rawNotes?.result ?? rawNotes?.payload ?? rawNotes
                            if (Array.isArray(parsedNotes)) {
                                notesHtml = parsedNotes[0] || ''
                            } else {
                                notesHtml = parsedNotes?.notes ?? parsedNotes?.ruleNotes ?? ''
                            }
                        }
                        
                        const liveMilestones = selected.milestones || []
                        const detailMilestones = eventData.milestones || []
                        const mergedMilestones = liveMilestones.length >= detailMilestones.length ? liveMilestones : detailMilestones
                        
                        selected = { ...selected, ...eventData, notesHtml, milestones: mergedMilestones }
                    } catch (error) {
                        console.error('Failed to load full event details:', error)
                    }
                }

                const mapped = mapApiEventToUi(selected)

                if (isMounted) {
                    setEvent(mapped)
                    setTimeline(mapped?.timeline || [])

                    if (mapped?.id) {
                        localStorage.setItem('eventId', String(mapped.id))
                    }
                }
            })
            .catch((error) => {
                console.error('Failed to load dashboard event:', error)
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const handleCloseModal = () => {
        setShowPendingModal(false);``
        sessionStorage.setItem('hasSeenProfilePendingModal', 'true');
    };

    const isRegistered = Boolean(event?.isCurrentUserRegistered)

    const handleJoinClick = () => {
        if (event?.id) {
            localStorage.setItem('eventId', String(event.id))
            localStorage.setItem('joinedEventId', String(event.id))
            localStorage.setItem(`eventRegistration:${event.id}`, 'true')
            setRegisteredEventId(String(event.id))
        }

        const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer')
        if (!hasSeenDisclaimer) {
            setShowDisclaimer(true)
        } else {
            proceedToTeam()
        }
    }

    const proceedToTeam = () => {
        if (userStatus === 'PENDING_APPROVAL') {
            setShowPendingModal(true);
        } else {
            navigate('/team');
        }
    }

    const handleDisclaimerConfirm = () => {
        localStorage.setItem('hasSeenDisclaimer', 'true')
        setShowDisclaimer(false)
        proceedToTeam()
    }

    return (
        <UserLayout showCard={false}>
            <ProfilePendingModal isOpen={showPendingModal} onClose={handleCloseModal} />
            {showDisclaimer && (
                <DisclaimerStep 
                    onClose={() => setShowDisclaimer(false)} 
                    onNext={handleDisclaimerConfirm} 
                    notes={event?.notes}
                />
            )}
            {loading && !event ? <div>Đang tải thông tin sự kiện...</div> : null}
            <MilestoneBanner timeline={timeline} />
            <LiveEventCard
                event={event}
                isRegistered={isRegistered}
                onJoin={handleJoinClick}
                onViewRules={() => console.log('Chi tiết thể lệ')}
            />
        </UserLayout>
    )
}

export default UserDashboard