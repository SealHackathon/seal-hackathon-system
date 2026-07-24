import { useState, useMemo } from 'react';
import { Star, SealCheck, Scales, Flag, LockKey, CaretDown, CaretUp, PencilSimple, MagnifyingGlass, Users } from '@phosphor-icons/react';
import Badge from '../../shared/Badge';
import Tooltip from '../../shared/Tooltip';
import Button from '../../shared/Button';
import FormInput from '../../shared/FormInput';
import FilterTabs from '../../shared/SearchFilterBar/FilterTabs';
import Dropdown from '../../shared/Dropdown';
import styles from './RoleBasedLeaderboard.module.css';

const fmtScore = (v) => (v == null ? '—' : v.toFixed(2));

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'official', label: 'Đã chốt', dot: 'green' },
  { key: 'provisional', label: 'Tạm tính', dot: 'orange' },
  { key: 'violation', label: 'Vi phạm', dot: 'orange' },
];

const SORT_OPTIONS = [
  { value: 'rankAsc', label: 'Hạng: Cao đến thấp' },
  { value: 'rankDesc', label: 'Hạng: Thấp đến cao' },
  { value: 'nameAsc', label: 'Tên đội: A-Z' },
  { value: 'nameDesc', label: 'Tên đội: Z-A' }
];

function StatusCell({ row }) {
  if (row.status === 'violation') {
    return (
      <Tooltip content="Gắn cờ vi phạm" bgColor="orange">
        <span className={styles.iconWarn}><Flag size={26} weight="fill" /></span>
      </Tooltip>
    );
  }
  if (row.status === 'provisional') {
    return <Badge variant="orange" label="Tạm tính" size="sm" dot={false} />;
  }
  if (row.status === 'official') {
    return (
      <Tooltip content="Điểm chính thức" bgColor="green">
        <span className={styles.iconOk}><SealCheck size={22} weight="fill" /></span>
      </Tooltip>
    );
  }
  return <span className={styles.pending}>Chưa đủ điểm</span>;
}

function RoleBasedLeaderboard({ data = [], role = 'TEAM', stage = 1, currentJudgeId = null, myTeamData = null, myMentorTeamsData = [], onRequestEdit, onOpenChart }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isTableLocked = (role === 'TEAM' || role === 'LEADER' || role === 'MEMBER' || role === 'MENTOR') ? stage < 3 : stage < 2;
  const isContestant = role === 'LEADER' || role === 'MEMBER' || role === 'TEAM';
  
  // Lấy data trực tiếp từ props thay vì tự query trong mảng data
  const myTeam = isContestant ? myTeamData : null;
  const myMentorTeams = role === 'MENTOR' ? myMentorTeamsData : [];

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rankAsc');

  const countByKey = useMemo(() => {
    const c = { all: data.length, official: 0, provisional: 0, discrepancy: 0, violation: 0 };
    data.forEach(r => {
      if (c[r.status] != null) c[r.status] += 1;
    });
    return c;
  }, [data]);

  const visibleData = useMemo(() => {
    let list = data;
    if (role === 'JUDGE' && filter !== 'all') {
      list = list.filter(r => r.status === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(r => r.teamName.toLowerCase().includes(q));

    let sorted = [...list];
    sorted.sort((a, b) => {
      const isABanned = a.status === 'banned';
      const isBBanned = b.status === 'banned';

      if (isABanned && !isBBanned) return 1;
      if (!isABanned && isBBanned) return -1;

      if (sortBy === 'rankAsc') return (a.rank || 999) - (b.rank || 999);
      if (sortBy === 'rankDesc') return (b.rank || 999) - (a.rank || 999);
      if (sortBy === 'nameAsc') return a.teamName.localeCompare(b.teamName);
      if (sortBy === 'nameDesc') return b.teamName.localeCompare(a.teamName);
      return 0;
    });

    return sorted;
  }, [data, filter, search, sortBy, role]);

  if (isTableLocked) {
    return (
      <div className={styles.emptyState}>
        <LockKey size={48} weight="fill" />
        <h3 className={styles.title}>Đang tổng hợp kết quả</h3>
        <p className={styles.desc}>
          {role === 'JUDGE' 
            ? 'Ban tổ chức đang thu thập điểm từ các giám khảo. Kết quả sơ bộ sẽ hiển thị khi hoàn tất.' 
            : 'Điểm số đang được ban tổ chức và ban giám khảo tổng hợp. Vui lòng quay lại sau.'}
        </p>
      </div>
    );
  }

  const showDetailedJudges = role === 'JUDGE' && stage === 3;
  const showDiscrepancyWarning = role === 'JUDGE' && stage === 2;

  // Xác định grid layout class
  let gridClass = styles.gridTeam;
  if (role === 'JUDGE') {
    gridClass = stage === 3 ? styles.gridJudgeStage3 : styles.gridJudgeStage2;
  }

  return (
    <section className={styles.section}>
      {myTeam && (
        <div className={styles.myTeamSummary}>
          <div className={styles.myTeamInfo}>
            <span className={styles.myTeamLabel}>Thành tích đội của bạn</span>
            <span className={styles.myTeamName}>
              <Star size={24} weight="fill" color="var(--color-primary-orange)" />
              {myTeam.teamName}
            </span>
          </div>
          <div className={styles.myTeamStats}>
            <div className={styles.myTeamStatItem}>
              <span className={styles.myTeamStatLabel}>Thứ hạng</span>
              <span className={`${styles.myTeamStatValue} ${styles.rank}`}>#{myTeam.rank || '—'}</span>
            </div>
            <div className={styles.myTeamStatItem}>
              <span className={styles.myTeamStatLabel}>Điểm tổng</span>
              <span className={styles.myTeamStatValue}>
                {fmtScore(myTeam.avgScore)}
                <span className={styles.statMax}>/10</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {role === 'MENTOR' && myMentorTeams.length > 0 && (
        <div className={styles.mentorSummaryContainer}>
          <h4 className={styles.mentorSummaryTitle}>
            <Users size={28} weight="fill" />
            Thành tích các đội phụ trách
          </h4>
          <div className={styles.mentorTeamsGrid}>
            {myMentorTeams.map(team => (
              <div key={team.id} className={styles.mentorTeamCard}>
                <div className={styles.mtCardHeader}>
                  <span className={styles.mtTeamName}>{team.teamName}</span>
                  {team.rank && team.rank <= 3 && (
                    <Star size={24} weight="fill" className={styles['medal' + team.rank]} />
                  )}
                </div>
                <div className={styles.mtStats}>
                  <div className={styles.mtStatBox}>
                    <span className={styles.mtStatLabel}>Thứ hạng</span>
                    <span className={styles.mtRankVal}>#{team.rank || '—'}</span>
                  </div>
                  <div className={styles.mtStatBox} style={{ alignItems: 'flex-end' }}>
                    <span className={styles.mtStatLabel}>Điểm số</span>
                    <span className={styles.mtScoreVal}>
                      {fmtScore(team.avgScore)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <FormInput
            iconLeft={MagnifyingGlass}
            placeholder="Tìm đội thi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.sortCol}>
          <Dropdown
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sắp xếp"
          />
        </div>

        {role === 'JUDGE' && (
          <div className={styles.filterCol}>
            <FilterTabs filters={STATUS_FILTERS} countByKey={countByKey} activeKey={filter} onChange={setFilter} />
          </div>
        )}
      </div>

      <div className={styles.tableWrap}>
        <div className={`${styles.row} ${styles.headerRow} ${styles.headerWrapper} ${gridClass}`}>
          <span className={styles.cRank}>Hạng</span>
          <span className={styles.cTeam}>Đội thi</span>
          {showDetailedJudges && <span className={styles.cJudges}>Điểm tổng quát</span>}
          <span className={styles.cScore}>{role === 'JUDGE' ? 'Điểm trung bình' : 'Điểm tổng'}</span>
          
          {showDiscrepancyWarning && <span className={styles.cAction}>Trạng thái</span>}
          {showDetailedJudges && <span className={styles.cStatus}>Trạng thái</span>}
          {showDetailedJudges && <span className={styles.cExpand}></span>}
          {/* TEAM & MENTOR không còn cột Trạng thái */}
        </div>

        {(() => {
          const groupedRows = [];
          let currentGroup = [];
          let currentRank = null;

          visibleData.forEach((row) => {
            if (row.tie && row.rank != null) {
              if (currentRank === row.rank) {
                currentGroup.push(row);
              } else {
                if (currentGroup.length > 0) groupedRows.push({ isTie: true, rows: currentGroup });
                currentGroup = [row];
                currentRank = row.rank;
              }
            } else {
              if (currentGroup.length > 0) {
                groupedRows.push({ isTie: true, rows: currentGroup });
                currentGroup = [];
                currentRank = null;
              }
              groupedRows.push({ isTie: false, rows: [row] });
            }
          });
          if (currentGroup.length > 0) {
            groupedRows.push({ isTie: true, rows: currentGroup });
          }

          const renderRow = (row) => {
            const isOfficial = row.status === 'official';
            const isBanned = row.status === 'banned';
            const isExpanded = expandedRows[row.id];

            return (
              <div className={`${styles.rowWrapper} ${isBanned ? styles.bannedRow : ''}`} key={row.id}>
                <div 
                  className={`${styles.row} ${gridClass} ${showDetailedJudges && !isBanned ? styles.clickableRow : ''}`}
                  onClick={showDetailedJudges && !isBanned ? () => toggleRow(row.id) : undefined}
                >
                  {/* Cột Hạng */}
                  <span className={styles.cRank}>
                    {row.rank && !isBanned ? (
                      <span className={styles.rankWrap}>
                        {row.rank <= 3 && <Star size={20} weight="fill" className={styles['medal' + row.rank]} />}
                        <span className={styles.rankNum}>{row.rank}</span>
                      </span>
                    ) : (
                      <span className={styles.rankNone}>—</span>
                    )}
                  </span>

                  {/* Cột Đội thi */}
                  <span className={styles.cTeam} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={styles.teamName}>{row.teamName}</span>
                    {isBanned && <Badge variant="gray" label="Đình chỉ" size="sm" dot={false} />}
                  </span>

                  {/* Cột Điểm chi tiết BGK (Chỉ Judge stage 3) */}
                  {showDetailedJudges && (
                    <span className={styles.cJudges}>
                      {!isBanned ? (
                        (row.judges || []).map((j, idx) => (
                          <Tooltip key={idx} content={j.judgeName} bgColor="blue" textColor="white">
                            <span className={styles.judgeBadge}>{fmtScore(j.score)}</span>
                          </Tooltip>
                        ))
                      ) : (
                        <span className={styles.rankNone}>—</span>
                      )}
                    </span>
                  )}

                  {/* Cột Điểm tổng / TB */}
                  <span className={styles.cScore}>
                    <div className={styles.scoreWrap} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={isOfficial && !isBanned ? styles.scoreVal : styles.scoreTemp}>
                        {isBanned ? '—' : fmtScore(row.avgScore)}
                        {!isBanned && <span className={styles.scoreMax}>/10</span>}
                      </span>
                      {!isBanned && row.tieBreakNote && (() => {
                        const noteParts = row.tieBreakNote.split(' — ');
                        const cleanNote = noteParts.length > 1 ? noteParts[1].charAt(0).toUpperCase() + noteParts[1].slice(1) : row.tieBreakNote;
                        return (
                          <Tooltip position="left" content={cleanNote} bgColor="blue" textColor="white">
                            <Badge variant="blueSolid" label="Tie-breaking" size="sm" dot={false} />
                          </Tooltip>
                        );
                      })()}
                    </div>
                  </span>

                  {/* Cột Trạng thái / Hành động - JUDGE STAGE 2 */}
                  {showDiscrepancyWarning && (
                    <span className={styles.cAction}>
                      {!isBanned ? (
                        row.discrepancy ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Tooltip content="Chênh lệch điểm giữa các giám khảo" bgColor="white" textColor="orangeTxt">
                              <span 
                                className={styles.iconWarn} 
                                style={{ cursor: 'pointer' }}
                                onClick={() => onOpenChart?.(row.id)}
                              >
                                <Scales size={28} weight="fill" />
                              </span>
                            </Tooltip>
                            {/* Nếu BGK hiện tại nằm trong nhóm chấm đội này, cho phép sửa điểm */}
                            {(row.judges || []).some(j => j.judgeId === currentJudgeId) && (
                               <Button 
                                 label="Sửa điểm" 
                                 variant="solid" 
                                 color="orange" 
                                 size="sm" 
                                 icon={PencilSimple} 
                                 style={{ padding: '0.4em 0.7em', fontSize: '0.85rem' }} 
                                 onClick={() => onRequestEdit?.(row.id)}
                               />
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>Đồng thuận</span>
                        )
                      ) : (
                        <span className={styles.rankNone}>—</span>
                      )}
                    </span>
                  )}

                  {/* Cột Trạng thái - JUDGE STAGE 3 */}
                  {showDetailedJudges && (
                    <span className={styles.cStatus}>
                      {!isBanned ? <StatusCell row={row} /> : <span className={styles.rankNone}>—</span>}
                    </span>
                  )}

                  {/* Nút Sổ Xuống - JUDGE STAGE 3 */}
                  {showDetailedJudges && (
                    <span className={styles.cExpand}>
                      {!isBanned && (isExpanded ? <CaretUp size={20} weight="bold" color="var(--color-primary-blue)" /> : <CaretDown size={20} weight="bold" color="var(--color-text-muted)" />)}
                    </span>
                  )}
                </div>

                {/* Khu vực chi tiết (Expanded) - Chỉ dành cho JUDGE Stage 3 */}
                {isExpanded && showDetailedJudges && !isBanned && (
                  <div className={styles.expandedDetails}>
                    {(row.judges || []).map((j, idx) => (
                      <div key={idx} className={styles.judgeCard}>
                        <div className={styles.judgeCardHeader}>
                          <span className={styles.judgeName}>{j.judgeName}</span>
                          <span className={styles.judgeTotal}>{fmtScore(j.score)}</span>
                        </div>
                        <div className={styles.criteriaList}>
                          {(j.criteriaScores || []).map((c, cIdx) => (
                            <div key={cIdx} className={styles.criteriaItem}>
                              <span className={styles.criteriaName}>{c.name}:</span>
                              <span className={styles.criteriaBadge}>{fmtScore(c.score)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          };

          return groupedRows.map((grp, gIdx) => {
            if (grp.isTie) {
              return (
                <div key={`tie-${gIdx}`} className={styles.tieGroup}>
                  {grp.rows.map(row => renderRow(row))}
                </div>
              );
            }
            return renderRow(grp.rows[0]);
          });
        })()}

        {visibleData.length === 0 && (
          <p className={styles.empty}>Không tìm thấy đội nào khớp với tìm kiếm.</p>
        )}
      </div>
    </section>
  );
}

export default RoleBasedLeaderboard;
