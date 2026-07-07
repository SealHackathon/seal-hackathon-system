import { useEffect } from 'react'
 import EventLayout from '../layouts/EventLayout'
import RoundTimelineHorizontal from '../components/shared/submission/RoundTimelineHorizontal'
import SubmissionList from '../components/shared/submission/SubmissionList'
import ProgressCard from '../components/shared/submission/ProgressCard'
import UsefulInfoBox from '../components/shared/submission/UsefulInfoBox'
import SectionHeader from '../components/shared/SectionHeader'
import { Star, ChartPieSlice, Info, LineSegments } from '@phosphor-icons/react'
import styles from './SubmissionPage.module.css'
import { MOCK_ROUNDS, MOCK_PROGRESS } from '../components/shared/submission/mockSubmissionData'
import { useAuth } from '../AuthContext'

function SubmissionPage() {
  const { teamRole } = useAuth(); // LEADER or MEMBER

  useEffect(() => {
    //  fetch data
  }, []);

  return (
    <EventLayout activePage='submit'>
      <div className={styles.page}>
        <SectionHeader 
          icon={Star} 
          title="Hành trình Dự thi" 
          level="h1" 
        />
        <div className={styles.topSection}>
          <div className={styles.timelineContainer}>
            <RoundTimelineHorizontal rounds={MOCK_ROUNDS} />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainColumn}>
              <SectionHeader icon={LineSegments} title="Chi tiết các vòng thi" level="h1" />
            <div className={styles.mainContainer}>
              <div>
                <SubmissionList rounds={MOCK_ROUNDS} role={teamRole} />
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.stickyWrapper}>
              <ProgressCard progress={MOCK_PROGRESS} activeRound={MOCK_ROUNDS.find(r => r.status === 'ACTIVE' || r.status === 'LATE')} />
              <UsefulInfoBox />
            </div>
          </div>
        </div>
      </div>
    </EventLayout>
  )
}

export default SubmissionPage;
