import styles from './SideCard.module.css'

function SideCard({ 
    color = 'green', 
    icon, 
    title, 
    count, 
    items, 
    emptyText, 
    renderAction }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>

      
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h2 className={styles.title}>{title}</h2>
        <span className={`${styles.badge} ${styles[color]}`}>{count}</span>
      </div>

      
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.avatar} />
              <div className={styles.info}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.email}>{item.email}</span>
              </div>
              {renderAction(item)}
            </li>
          ))}
        </ul>
      )}

    </div>
  )
}

export default SideCard