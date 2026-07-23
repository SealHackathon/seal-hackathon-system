import { useState } from 'react';
import { ListChecks } from '@phosphor-icons/react';
import JudgeRoundCard from './JudgeRoundCard';
import ScoringCriteriaModal from './judgeRoundDetail/ScoringCriteriaModal';
import axiosClient from '../../../api/axiosClient';
import styles from './JudgeRoundsTab.module.css';

// Nội dung chính tab Giám khảo: danh sách vòng chấm (cột trái).
function JudgeRoundsTab({ event }) {
  // Mock Vòng 2 đã kết thúc để test nút "Xem kết quả"
  const mockEndedRound = {
    id: "vong2_mock",
    name: "Vòng 2: Chung kết (Mock)",
    ordinal: 2,
    lifecycle: "ended",
    assigned: true,
    allCategories: true,
    categories: [],
    rubricName: "Tiêu chí Chung kết",
    scoredCount: 15,
    totalSubmissions: 15,
    timeStart: new Date("2026-08-18"),
    timeEnd: new Date("2026-08-20"),
  };

  const rounds = [...(event.assignment?.judge?.rounds ?? []), mockEndedRound];
  const [selectedRound, setSelectedRound] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenRubric = async (round) => {
    setSelectedRound(round);
    setIsModalOpen(true);
    setIsLoading(true);
    setCriteria([]);
    try {
      const res = await axiosClient.get(`/round/rounds/${round.id}`);
      setCriteria(res.data.criteria || []);
    } catch (err) {
      console.error('Error fetching criteria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.tab}>
      <div className={styles.sectionTitle}>
        <ListChecks size={32} weight="bold" />
        <p>Các vòng chấm</p>
      </div>
      <div className={styles.list}>
        {rounds.map((r, i) => (
          <JudgeRoundCard 
            key={r.id ?? i} 
            round={r} 
            isLast={i === rounds.length - 1} 
            event={event}
            onOpenRubric={handleOpenRubric}
          />
        ))}
      </div>
      
      <ScoringCriteriaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        criteria={criteria} 
        roundName={selectedRound?.name}
        eventName={event?.name}
      />
    </div>
  );
}

export default JudgeRoundsTab;
