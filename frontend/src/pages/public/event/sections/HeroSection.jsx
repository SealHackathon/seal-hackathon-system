import Button from '../../../../components/shared/Button'
import {
  ArrowDown, Trophy, Path, SquaresFour, CalendarCheck, Flag, MapPin, UsersThree, SmileyWink, SmileyMeh, SmileyBlank, CrownSimple, Plus, TerminalWindow, LockKey, Globe, MapTrifold
} from '@phosphor-icons/react'
import Badge from '../../../../components/shared/Badge'
import { fmtDate, fmtVND } from '../eventUtils'
import styles from './HeroSection.module.css'

const LongArrowIcon = ({ className }) => (
  <svg
    width="42"
    height="16"
    viewBox="0 0 42 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2 8H40M40 8L33 1M40 8L33 15"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CustomStarIcon = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} style={{ overflow: 'visible', ...style }}>
    <rect width="256" height="256" fill="none"/>
    <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z" fill="currentColor"/>
  </svg>
)

const CustomShootingStarIcon = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} style={{ overflow: 'visible', ...style }}>
    <rect width="256" height="256" fill="none"/>
    <path d="M235.24,84.38l-28.06,23.68,8.56,35.39a13.34,13.34,0,0,1-5.09,13.91,13.54,13.54,0,0,1-15,.69L164,139l-31.65,19.06a13.51,13.51,0,0,1-15-.69,13.32,13.32,0,0,1-5.1-13.91l8.56-35.39L92.76,84.38a13.39,13.39,0,0,1,7.66-23.58l36.94-2.92,14.21-33.66a13.51,13.51,0,0,1,24.86,0l14.21,33.66,36.94,2.92a13.39,13.39,0,0,1,7.66,23.58ZM88.11,111.89a8,8,0,0,0-11.32,0L18.34,170.34a8,8,0,0,0,11.32,11.32l58.45-58.45A8,8,0,0,0,88.11,111.89Zm-.5,61.19L34.34,226.34a8,8,0,0,0,11.32,11.32l53.26-53.27a8,8,0,0,0-11.31-11.31Zm73-1-54.29,54.28a8,8,0,0,0,11.32,11.32l54.28-54.28a8,8,0,0,0-11.31-11.32Z" fill="currentColor"/>
  </svg>
)

// Tổng giá trị giải thưởng (main + extended)
function totalPrize(prizes) {
  if (!prizes) return 0
  const all = [...(prizes.main || []), ...(prizes.extended || [])]
  return all.reduce((sum, p) => sum + (p.cash || 0) * (p.count || 1), 0)
}

function HeroSection({ event, prizes, rounds = [], categories = [], people, onRegister, showRegisterBtn = true }) {
  const scrollAbout = () => {
    const el = document.getElementById('about')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const thumbStyle = event?.bannerUrl
    ? { backgroundImage: `url(${event.bannerUrl})` }
    : undefined

  const prizeTotal = totalPrize(prizes)

  const modes = Array.from(new Set((rounds || []).map(r => r.mode).filter(Boolean)))
  const isOnline = modes.includes('online')
  const isOffline = modes.includes('offline')
  const formatText = (isOnline && isOffline) ? 'Hybrid' : isOnline ? 'Online' : 'Offline'

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const locList = Array.isArray(event?.location) 
    ? event.location 
    : (event?.location ? [event.location] : ['Trực tuyến & Trực tiếp']);
  const displayLocation = locList[0];
  const moreLocs = locList.length > 1 ? locList.length - 1 : 0;

  return (
    <section className={styles.hero}>
      {/* ── Trái: nội dung (ít chữ) ── */}
      <div className={styles.text}>
        <h1 className={styles.name}>{event?.name}</h1>

        {/* Bỏ theme theo yêu cầu */}
        {/* {event?.theme && (
          <div className={styles.theme}>
            <LongArrowIcon className={styles.themeArrow} />
            <span className={styles.themeText}>{event.theme}</span>
          </div>
        )} */}

        <div className={styles.actions}>
          {showRegisterBtn && (
            <Button label="Đăng ký ngay" color="green" variant="primary" onClick={onRegister} />
          )}
          <Button
            label="Tìm hiểu thêm"
            icon={ArrowDown}
            iconPosition="right"
            color="blue"
            variant="outline"
            onClick={scrollAbout}
          />
        </div>
      </div>

      {/* ── Phải: bento grid ── */}
      <div className={styles.bento}>
        {/* Slogan Box thay cho Ảnh lớn */}
        <div 
          className={[styles.cSlogan, styles.clickableBox].join(' ')}
          onClick={() => scrollTo('about')}
        >
          <div className={styles.sloganContent}>
            <TerminalWindow size={40} weight="fill" className={styles.sloganIcon} />
            <h3 className={styles.sloganText}>
              Sân chơi <br />
              <span className={styles.sloganHighlight}>Công nghệ</span>
            </h3>
            <p className={styles.sloganSub}>Thỏa đam mê, sáng tạo không giới hạn</p>
          </div>
        </div>

        {/* Card nhấn: tổng giải thưởng (1x1) */}
        <div 
          className={[styles.stat, styles.cPrize, styles.clickableBox].join(' ')}
          onClick={() => scrollTo('prizes')}
        >
          <div className={styles.prizeLightBeams} />
          
          <div className={styles.absStar1}>
            <CustomStarIcon style={{ width: '40px', height: '40px' }} />
          </div>
          <div className={styles.absStar2}>
            <CustomStarIcon style={{ width: '32px', height: '32px' }} />
          </div>
          <div className={styles.absStar3}>
            <CustomShootingStarIcon style={{ width: '48px', height: '48px' }} />
          </div>

          <div className={styles.prizeRight}>
            <span className={styles.prizeLabel}>Tổng giải thưởng</span>
            <span className={styles.prizeValue}>{prizeTotal ? fmtVND(prizeTotal) : '—'}</span>
          </div>
        </div>

        {/* Số người / đội (1x1) */}
        <div 
          className={[styles.stat, styles.cTeam, styles.clickableBox].join(' ')}
          onClick={() => scrollTo('rules')}
        >
          <div className={styles.teamAvatars}>
            <div className={styles.tAva}>
              <CrownSimple size={26} weight="fill" className={styles.crownIcon} />
              <SmileyWink size={36} weight="fill" />
            </div>
            <div className={styles.tAva}><SmileyMeh size={36} weight="fill" /></div>
            <div className={styles.tAva}><SmileyBlank size={36} weight="fill" /></div>
            <div className={styles.tPlus}><Plus size={24} weight="bold" /></div>
          </div>
          <div className={styles.teamText}>
            <span className={styles.statValue}>{event?.teamSize?.min}–{event?.teamSize?.max}</span>
            <span className={styles.statLabel}>Thành viên / Đội</span>
          </div>
        </div>

        {/* Hành trình đăng ký (3x1) */}
        <div 
          className={[styles.stat, styles.cReg, styles.clickableBox].join(' ')}
          onClick={() => scrollTo('timeline')}
        >
          <div className={styles.regHeader}>
            <CalendarCheck size={28} weight="fill" className={styles.headerIcon} />
            <span className={styles.regTitle}>Hành trình đăng ký</span>
          </div>
          <div className={styles.timelineTrack}>
             <MapPin size={20} weight="fill" className={styles.blueIcon} />
             <div className={styles.timeLine}></div>
             <MapPin size={20} weight="fill" className={styles.orangeIcon} />
             {event?.teamDeadline && event.teamDeadline !== event?.registration?.close && (
               <>
                 <div className={styles.timeLine}></div>
                 <MapPin size={20} weight="fill" className={styles.orangeIcon} />
               </>
             )}
          </div>
          <div className={styles.timelineLabels}>
             <div className={styles.timePoint}>
               <span className={styles.timeDate}>{fmtDate(event?.registration?.open)}</span>
               <span className={styles.timeDesc}>Mở đơn</span>
             </div>
             <div className={styles.timePoint} style={event?.teamDeadline && event.teamDeadline !== event?.registration?.close ? { textAlign: 'center' } : { textAlign: 'right' }}>
               <span className={styles.timeDate}>{fmtDate(event?.registration?.close)}</span>
               <span className={styles.timeDesc}>Đóng đơn</span>
             </div>
             {event?.teamDeadline && event.teamDeadline !== event?.registration?.close && (
               <div className={styles.timePoint} style={{ textAlign: 'right' }}>
                 <span className={styles.timeDate}>{fmtDate(event.teamDeadline)}</span>
                 <span className={styles.timeDesc}>Chốt đội</span>
               </div>
             )}
          </div>
        </div>

        {/* Box địa điểm & hình thức */}
        <div 
          className={[styles.stat, styles.cLocation, styles.clickableBox].join(' ')}
          onClick={() => scrollTo('rounds')}
        >
          <div className={styles.locHead}>
            <MapPin size={28} weight="fill" className={styles.locNormalIcon} />
            <Badge 
              variant={isOnline && isOffline ? 'blue' : isOnline ? 'green' : 'orange'} 
              size="sm" 
              dot={false}
              label={formatText}
            />
          </div>

          <div className={styles.locationText}>
            <span className={styles.locationLabel}>Địa điểm tổ chức</span>
            <div className={styles.locValueWrap}>
              <span className={styles.locationValue} title={displayLocation}>{displayLocation}</span>
              {moreLocs > 0 && (
                <div className={styles.locMoreBadge} title={locList.slice(1).join('\n')}>
                  +{moreLocs}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột dọc cuối cùng (chia 2 box) */}
        <div className={styles.cTallWrapper}>
          
          <div 
            className={[styles.cMiniBox, styles.cRoundsBox, styles.clickableBox].join(' ')}
            onClick={() => scrollTo('rounds')}
          >
            <div className={styles.roundList}>
              {rounds.slice(0, 4).map((r, idx, arr) => (
                <div key={r.id || idx} className={styles.roundItem}>
                  <div className={styles.roundNode}>
                     <div className={styles.rDot}></div>
                     {idx < arr.length - 1 && <div className={styles.rLine}></div>}
                     {idx === arr.length - 1 && rounds.length > 4 && <div className={styles.rLineDashed}></div>}
                  </div>
                  <span className={styles.rName} title={r.name}>{r.name}</span>
                </div>
              ))}
              {rounds.length > 4 && (
                <div className={styles.roundItem}>
                  <div className={styles.roundNode}>
                     <div className={styles.rDot}></div>
                  </div>
                  <span className={styles.rName}>+ {rounds.length - 4} Vòng khác</span>
                </div>
              )}
            </div>
            
            <div className={styles.boxContentRounds}>
              <span className={styles.boxNum}>{rounds.length}</span>
              <span className={styles.boxLabel}>Vòng thi</span>
            </div>
          </div>

          <div 
            className={[styles.cMiniBox, styles.cTracksBox, styles.clickableBox].join(' ')}
            onClick={() => scrollTo('categories')}
          >
            <div className={styles.tracksDecorSq}>
              <div className={[styles.trackSquare, styles.trackSq1].join(' ')}></div>
              <div className={[styles.trackSquare, styles.trackSq2].join(' ')}></div>
              <div className={[styles.trackSquare, styles.trackSq3].join(' ')}></div>
              <div className={[styles.trackSquare, styles.trackSqDash].join(' ')}>
                 <Plus size={12} weight="bold" color='var(--color-secondary-blue)' />
              </div>
            </div>
            <div className={styles.boxContentRounds}>
              <span className={styles.boxNum}>{categories.length}</span>
              <span className={styles.boxLabel}>Bảng đấu</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default HeroSection
