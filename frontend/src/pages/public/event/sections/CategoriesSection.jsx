import { useState } from 'react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import { SquaresFour, UsersThree } from '@phosphor-icons/react'
import styles from './CategoriesSection.module.css'

function CategoriesSection({ id, categories = [] }) {
  // Dùng scroll reveal để animate progress bar khi section vào viewport
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.2 })

  return (
    <section id={id} className={styles.section} ref={sectionRef}>
      <div className={styles.headCol}>
        <span className={styles.eyebrow}>Phân loại</span>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <span className={styles.ac}>Về</span> Bảng đấu
          </h2>
          <span className={styles.hicon}>
            <SquaresFour weight="fill" />
          </span>
        </div>
        <div className={styles.uline}>
          <span />
          <span />
        </div>
      </div>

      <div className={styles.grid}>
        {categories.map((c, i) => {
          const hasLimit = c.maxTeams != null
          const ratio = hasLimit && c.maxTeams > 0 ? Math.min(1, (c.currentTeams || 0) / c.maxTeams) : 0
          const full = hasLimit && (c.currentTeams || 0) >= c.maxTeams
          return (
            <div
              key={c.id || i}
              className={`${styles.card} ${isVisible ? styles.cardRevealed : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <span className={styles.iconWrap}>
                <SquaresFour size={24} weight="fill" className={styles.icon} />
              </span>
              <div className={styles.cardBody}>
                <span className={styles.name}>{c.name}</span>
                <p className={styles.desc}>{c.desc}</p>
              </div>

              {hasLimit && (
                <div className={styles.limit}>
                  <div className={styles.limitTop}>
                    <span className={styles.limitLabel}>
                      <UsersThree size={16} weight="fill" className={styles.limitIcon} />
                      Số đội
                    </span>
                    <span className={[styles.limitValue, full ? styles.limitFull : ''].join(' ')}>
                      {c.currentTeams || 0}/{c.maxTeams}
                    </span>
                  </div>
                  <div className={styles.bar}>
                    <span
                      className={[
                        styles.barFill,
                        full ? styles.barFull : '',
                        isVisible ? styles.barAnimate : ''
                      ].join(' ')}
                      style={{ '--bar-width': `${ratio * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CategoriesSection
