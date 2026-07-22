import { useState } from 'react'
import { Briefcase, UsersThree } from '@phosphor-icons/react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import styles from './PeopleSection.module.css'

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/)
  const pick = parts.slice(-2)
  return pick.map((w) => w[0]).join('').toUpperCase()
}

function PersonCard({ person }) {
  return (
    <div className={styles.card}>
      <div className={styles.avatarArea}>
        {person.avatar ? (
          <img src={person.avatar} alt={person.name} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarFallback}>{initialsOf(person.name)}</div>
        )}
      </div>
      <div className={styles.infoArea}>
        <span className={styles.name}>{person.name}</span>
        <span className={styles.role}>{person.role}</span>
        {person.org && (
          <span className={styles.org}>
            <Briefcase size={14} weight="fill" />
            {person.org}
          </span>
        )}
      </div>
    </div>
  )
}

function PeopleSection({ id, people, categories = [], rounds = [] }) {
  const mentors = people?.mentors || []
  const judges = people?.judges || []

  // Khử trùng lặp
  const deduplicate = (arr) => {
    const seen = new Set();
    return arr.filter(p => {
      const key = p.id || p.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const finalJudges = deduplicate(judges);
  const finalMentors = deduplicate(mentors);

  // States for filters
  const [activeJudgeTab, setActiveJudgeTab] = useState('all')
  const [activeMentorTab, setActiveMentorTab] = useState('all')

  const renderJudges = () => {
    if (!finalJudges.length) return null;

    // Filter logic
    let displayList = finalJudges;
    if (activeJudgeTab !== 'all') {
      if (activeJudgeTab === 'other') {
        displayList = finalJudges.filter(j => !rounds.find(r => r.id === j.round));
      } else {
        displayList = finalJudges.filter(j => j.round === activeJudgeTab);
      }
    }

    const hasOther = finalJudges.some(j => !rounds.find(r => r.id === j.round));

    return (
      <div className={styles.subSection}>
        <div className={styles.subHead}>
          <h3 className={styles.subTitle}>Hội đồng <span>Giám khảo</span></h3>
          
          <div className={styles.filterBar}>
            <button 
              className={`${styles.filterPill} ${activeJudgeTab === 'all' ? styles.filterActive : ''}`}
              onClick={() => setActiveJudgeTab('all')}
            >
              Tất cả
            </button>
            {rounds.map(r => {
              const hasItems = finalJudges.some(j => j.round === r.id);
              if (!hasItems) return null;
              return (
                <button 
                  key={r.id}
                  className={`${styles.filterPill} ${activeJudgeTab === r.id ? styles.filterActive : ''}`}
                  onClick={() => setActiveJudgeTab(r.id)}
                >
                  {r.name}
                </button>
              )
            })}
            {hasOther && (
              <button 
                className={`${styles.filterPill} ${activeJudgeTab === 'other' ? styles.filterActive : ''}`}
                onClick={() => setActiveJudgeTab('other')}
              >
                Khác
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.gridContainer}>
          {displayList.map((p, i) => (
            <div key={p.id || p.name || i} className={styles.fadeIn}>
              <PersonCard person={p} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMentors = () => {
    if (!finalMentors.length) return null;

    // Filter logic
    let displayList = finalMentors;
    if (activeMentorTab !== 'all') {
      if (activeMentorTab === 'other') {
        displayList = finalMentors.filter(m => !categories.find(c => c.id === m.track));
      } else {
        displayList = finalMentors.filter(m => m.track === activeMentorTab);
      }
    }

    const hasOther = finalMentors.some(m => !categories.find(c => c.id === m.track));

    return (
      <div className={styles.subSection}>
        <div className={styles.subHead}>
          <h3 className={styles.subTitle}>Đội ngũ <span>Cố vấn</span></h3>
          
          <div className={styles.filterBar}>
            <button 
              className={`${styles.filterPill} ${activeMentorTab === 'all' ? styles.filterActive : ''}`}
              onClick={() => setActiveMentorTab('all')}
            >
              Tất cả
            </button>
            {categories.map(c => {
              const hasItems = finalMentors.some(m => m.track === c.id);
              if (!hasItems) return null;
              return (
                <button 
                  key={c.id}
                  className={`${styles.filterPill} ${activeMentorTab === c.id ? styles.filterActive : ''}`}
                  onClick={() => setActiveMentorTab(c.id)}
                >
                  {c.name}
                </button>
              )
            })}
            {hasOther && (
              <button 
                className={`${styles.filterPill} ${activeMentorTab === 'other' ? styles.filterActive : ''}`}
                onClick={() => setActiveMentorTab('other')}
              >
                Chung
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.gridContainer}>
          {displayList.map((p, i) => (
            <div key={p.id || p.name || i} className={styles.fadeIn}>
              <PersonCard person={p} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.1 })

  return (
    <section id={id} ref={sectionRef} className={`${styles.section} ${isVisible ? styles.revealed : ''}`}>
      <div className={styles.headCol}>
        <span className={styles.eyebrow}>Đồng hành</span>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.ac}>Về</span> Người đồng hành
          </h2>
          <span className={styles.hicon}>
            <UsersThree weight="fill" />
          </span>
        </div>
        <div className={styles.uline}>
          <span />
          <span />
        </div>
      </div>

      <div className={styles.posterFrame}>
        {renderJudges()}
        {renderMentors()}
      </div>
    </section>
  )
}

export default PeopleSection
