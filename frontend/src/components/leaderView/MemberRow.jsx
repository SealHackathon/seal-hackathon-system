import { CrownSimple, X, SignOut } from '@phosphor-icons/react'
import styles from './MemberRow.module.css'
import Tooltip from '../shared/Tooltip'

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

          <Tooltip content='Rời đội' position='top'>
            <button className={styles.actionBtn} onClick={onLeave}>
              <SignOut size={28} weight='bold' color="var(--color-secondary-blue)" />
            </button>
          </Tooltip>
        ) : (onKick || onPromote) ? (

          <>
            <Tooltip content='Trao quyền' position='top' color='orange'>
              <button className={styles.actionBtn} onClick={onPromote}>
                <CrownSimple size={28} weight='bold' color="var(--color-border-orange)" />
              </button>
            </Tooltip>

            <Tooltip content='Mời ra khỏi đội' position='top' color='orange'>
              <button className={styles.actionBtn} onClick={onKick}>
                <X size={28} weight='bold' color="var(--color-border-orange)" />
              </button>
            </Tooltip>
          </>
        ) : null}

      </div>

    </div>
  )
}

export default MemberRow