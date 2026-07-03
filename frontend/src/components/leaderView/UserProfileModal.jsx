import React from 'react'
import ModalShell from '../shared/ModalShell'
import { GraduationCap, SuitcaseSimple, Link, User, Code, Heart, IdentificationBadge } from '@phosphor-icons/react'
import styles from './UserProfileModal.module.css'
import avatarPlaceholder from '../../assets/user-avatar-placeholder.png'
import SectionHeader from '../shared/SectionHeader'

export default function UserProfileModal({ member, onClose }) {
  if (!member) return null

  // Helper render positions
  const positions = member.positions || []

  // Helper render topics
  const topics = member.topics || []

  // Helper render techTags
  const techTags = member.techTags || {}
  const allTags = Object.values(techTags).flat()

  return (
    <ModalShell onClose={onClose} size="lg" disableScroll={true}>
      <div className={styles.container} data-lenis-prevent="true">

        {/* Banner Section */}
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <IdentificationBadge size={28} weight="fill" className={styles.bannerIcon} />
            <h2 className={styles.bannerTitle}>Thông tin chi tiết</h2>
          </div>
        </div>

        <div className={styles.contentWrapper} data-lenis-prevent="true">
          {/* Top Section */}
          <div className={styles.topSection}>
            <div className={styles.profileCard}>

              {/* Left Side: Avatar & Name */}
              <div className={styles.cardLeft}>
                <img src={member.avatar || avatarPlaceholder} alt="Avatar" className={styles.avatar} />
                <p className={styles.name}>{member.name}</p>

                <span className={styles.roleLabel}>
                  {member.teamName
                    ? (member.isLeader ? `Đội trưởng - ${member.teamName}` : `Thành viên - ${member.teamName}`)
                    : (member.isLeader ? 'Đội trưởng' : (member.memberStatus === 'NO_TEAM' || member.hasTeam === false ? 'Chưa có đội' : 'Thành viên'))
                  }
                </span>
              </div>

              <div className={styles.cardDivider} />

              {/* Right Side: Info List */}
              <div className={styles.cardRight}>
                <div className={styles.infoList}>
                  {member.school && (
                    <div className={styles.infoItem}>
                      <GraduationCap size={28} weight="duotone" className={styles.infoIcon} />
                      <span className={styles.infoText}>
                        Học tại: <strong className={styles.infoHighlight}>{member.school}</strong>
                      </span>
                    </div>
                  )}

                  {positions.length > 0 && (
                    <div className={styles.infoItem}>
                      <SuitcaseSimple size={28} weight="duotone" className={styles.infoIcon} />
                      <span className={styles.infoText}>
                        Vị trí: <strong className={styles.infoHighlight}>{positions.join(', ')}</strong>
                      </span>
                    </div>
                  )}

                  <div className={styles.infoItem}>
                    <Link size={28} weight="duotone" className={styles.infoIcon} />
                    <span className={styles.infoText}>
                      Portfolio: {member.cvLink ? <a href={member.cvLink} target="_blank" rel="noreferrer" className={styles.cvLink}>Xem chi tiết</a> : <span className={styles.emptyTextInline}>Chưa cập nhật</span>}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Section */}
          <div className={styles.bottomSection}>
            <div className={styles.bioSection}>
              <div className={styles.sectionHeader}>
                <User size={24} weight="duotone" className={styles.sectionIcon} />
                <p className={styles.sectionTitle}>Giới thiệu</p>
              </div>
              {member.bio ? (
                <p className={styles.bioText}>{member.bio}</p>
              ) : (
                <p className={styles.emptyText}>Thí sinh này chưa cập nhật lời giới thiệu.</p>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.tagsGrid}>
              {/* Tech Tags */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Code size={24} weight="duotone" className={styles.sectionIcon} />
                  <p className={styles.sectionTitle}>Công nghệ sử dụng</p>
                </div>
                {allTags.length > 0 ? (
                  <div className={styles.tagsContainer}>
                    {allTags.map((tag, idx) => (
                      <span key={idx} className={`${styles.badge} ${styles.blueBadge}`}>{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>Chưa có thông tin</p>
                )}
              </div>

              {/* Topics */}
              <div className={`${styles.section} ${styles.orange}`}>
                <div className={styles.sectionHeader}>
                  <Heart size={24} weight="duotone" className={styles.sectionIcon} />
                  <p className={styles.sectionTitle}>Lĩnh vực quan tâm</p>
                </div>
                {topics.length > 0 ? (
                  <div className={styles.tagsContainer}>
                    {topics.map((topic, idx) => (
                      <span key={idx} className={`${styles.badge} ${styles.orangeBadge}`}>{topic}</span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>Chưa có thông tin</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
