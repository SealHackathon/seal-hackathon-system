import { CrownSimple, X, SignOut } from '@phosphor-icons/react'
import styles from './MemberRow.module.css'

function MemberRow({ 
  index, 
  name, 
  email, 
  school, 
  isLeader, 
  isCurrentUser, 
  onKick, 
  onPromote, 
  onLeave 
}) {
  return (
    <div className={styles.row}>

      <span className={styles.index}>{index}</span>

      <div className={styles.avatar}>
        {isLeader && (
          <CrownSimple size={32} weight="fill" className={styles.crownIcon} />
        )}
      </div>

      
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          {isCurrentUser && <span className={styles.youBadge}>(Bạn)</span>}
        </div>
        <span className={styles.email}>{email}</span>
        <span className={styles.school}>{school}</span>
      </div>

     
      <div className={styles.actions}>

        {isCurrentUser ? (
          
          
          <button className={styles.actionBtn} onClick={onLeave} title="Rời đội">
            <SignOut size={28} weight='bold' color="var(--color-secondary-blue)" />
          </button>
        ) : (onKick || onPromote) ? (
          
          <>
            <button className={styles.actionBtn} onClick={onPromote} title="Phong làm trưởng nhóm">
              <CrownSimple size={28} weight='bold' color="var(--color-border-orange)" />
            </button>
            <button className={styles.actionBtn} onClick={onKick} title="Kick khỏi đội">
              <X size={28} weight='bold' color="var(--color-border-orange)" />
            </button>
          </>
        ) : null}

      </div>

    </div>
  )
}

export default MemberRow