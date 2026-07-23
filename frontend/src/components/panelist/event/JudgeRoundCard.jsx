import { Pen, CheckFat, Lock, CalendarBlank, Tag, BookOpen, ChartBar } from '@phosphor-icons/react';
import Badge from '../../shared/Badge';
import TagList from '../../coordinator/TagList';
import Button from '../../shared/Button';
import styles from './JudgeRoundCard.module.css';
import { useNavigate } from 'react-router-dom'

// Số hạng mục tối đa hiển thị trước khi gộp phần dư thành "+N".
const MAX_TAGS = 2;

// Cấu hình node timeline theo VÒNG ĐỜI của vòng (dựa trên thời gian diễn ra).
// Node theo lifecycle nên vòng đã kết thúc luôn là tick xanh, kể cả vòng không được phân công.
const LIFECYCLE_CFG = {
  upcoming: { node: 'node_upcoming', Icon: Lock },
  active: { node: 'node_active', Icon: Pen },
  ended: { node: 'node_ended', Icon: CheckFat },
};

function fmtDM(d) {
  const x = d instanceof Date ? d : new Date(d);
  return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}`;
}

function JudgeRoundCard({ round, isLast, onOpenRubric,event }) {

  const navigate = useNavigate()

  const cfg = LIFECYCLE_CFG[round.lifecycle] ?? LIFECYCLE_CFG.upcoming;
  const { Icon } = cfg;
  const assigned = round.assigned !== false;

  const total = round.totalSubmissions ?? 0;
  const scored = round.scoredCount ?? 0;
  const pct = total > 0 ? Math.round((scored / total) * 100) : 0;

  const cats = round.allCategories ? ['Tất cả hạng mục'] : (round.categories ?? []);

  // Tone card: chỉ card đang diễn ra được tô xanh; các card còn lại style thường.
  let cardTone = styles.cardUpcoming;
  if (!assigned) cardTone = styles.cardUnassigned;
  else if (round.lifecycle === 'active') cardTone = styles.cardActive;
  else if (round.lifecycle === 'ended') cardTone = styles.cardEnded;

  // Nút hành động
  let action;
  if (round.lifecycle === 'ended') {
    // Vòng đã kết thúc: luôn cho xem kết quả, kể cả không phụ trách.
    action = <Button className={styles.btn} label="Xem kết quả" variant="primary" color="green" onClick={() => navigate(`/panelist/events/${event.id}/judge/rounds/${round.id}/leaderboard`)} />;
  } else if (!assigned) {
    // Chỉ còn active/upcoming mà không phụ trách mới báo "Không phụ trách".
    action = <Button className={styles.btn} label="Không phụ trách" variant="outline" color="blue" disabled />;
  } else if (round.lifecycle === 'active') {
    action = <Button className={styles.btn} label="Chấm điểm" icon={Pen} iconWeight="fill" variant="primary" color="blue" onClick={()=>{navigate(`/panelist/events/${event.id}/judge/rounds/${round.id}`)}} />;
  } else {
    action = <Button className={styles.btn} label="Chưa tới lượt chấm" variant="outline" color="blue" disabled />;
  }

  return (
    <div className={styles.item}>
      {/* Rail timeline dọc: nút trạng thái + đường nối */}
      <div className={styles.rail}>
        <div className={`${styles.node} ${styles[cfg.node]}`}>
          <Icon size={20} weight="fill" />
        </div>
        {!isLast && <div className={styles.connector} />}
      </div>

      <div className={`${styles.card} ${cardTone}`}>
        {/* Cột 1: vòng, thời gian (badge dưới), tên vòng */}
        <div className={styles.colMain}>
          <span className={styles.kicker}>Vòng {round.ordinal}</span>

          <p className={styles.name}>{round.name}</p>
          <Badge
            variant={round.lifecycle === 'active' ? "blueSolid" : "dashedBlue"}
            size="sm"
            dot={false}
            icon={<CalendarBlank size={14} weight="fill" />}
            label={`${fmtDM(round.timeStart)} – ${fmtDM(round.timeEnd)}`}
          />
        </div>

        <div className={styles.divider} />

        {/* Cột 2: hạng mục + rubric */}
        <div className={styles.colInfo}>
          <div className={styles.infoRow}>
            <span className={styles.metaLabel}><Tag className={styles.labelIcon} size={18} weight="fill" /> Hạng mục chấm</span>
            <TagList tags={cats} maxVisible={MAX_TAGS} showLabel={false} />
          </div>
          <div className={styles.infoRow}>
            <span className={styles.metaLabel}><BookOpen className={styles.labelIcon} size={18} weight="fill" /> Rubric</span>
            <Button
              label={round.rubricName} labelSize={12}
              variant="outline"
              color="blue"
              onClick={() => onOpenRubric?.(round)}
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* Cột 3: tiến độ chấm (trên) + nút hành động (dưới) */}
        <div className={styles.colAction}>
          {assigned && (
            <div className={styles.progressBlock}>
              <div className={styles.progressHead}>
                <span className={styles.metaLabel}><ChartBar className={styles.labelIcon} size={18} weight="fill" /> Tiến độ chấm</span>
                <span className={styles.progressValue}>{scored}/{total} <span className={styles.progressUnit}>bài</span></span>
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          <div className={styles.btnWrap}>{action}</div>
        </div>
      </div>
    </div>
  );
}

export default JudgeRoundCard;