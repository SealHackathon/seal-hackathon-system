import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import RichTextView from './RichTextView'
import Badge from '../../../../components/shared/Badge'
import {
  Path, Globe, MapPin, UploadSimple, Clock, CalendarBlank, Info, Car, Bicycle, Broadcast
} from '@phosphor-icons/react'
import { fmtDate, fmtDateTime } from '../eventUtils'
import styles from './RoundsSection.module.css'

import Map, { Marker } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY

function LocationBanner({ location }) {
  const [distanceInfo, setDistanceInfo] = useState(null)
  const [transportMode, setTransportMode] = useState('bike')
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!location) return
    if (location.lat != null && location.lng != null) {
      setCoords({ lat: location.lat, lng: location.lng })
      return
    }
    if (location.address && GOONG_API_KEY) {
      axios.get(`https://rsapi.goong.io/geocode`, {
        params: { address: location.address, api_key: GOONG_API_KEY }
      }).then(res => {
        if (res.data?.results?.length > 0) {
          const loc = res.data.results[0].geometry.location
          setCoords({ lat: loc.lat, lng: loc.lng })
        }
      }).catch(e => console.error("Lỗi fetch geocode:", e))
    }
  }, [location])

  useEffect(() => {
    if (!coords || !coords.lat || !coords.lng || !GOONG_API_KEY) return

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const origin = `${position.coords.latitude},${position.coords.longitude}`
          const destination = `${coords.lat},${coords.lng}`
          const vehicle = transportMode === 'car' ? 'car' : 'bike'
          const res = await axios.get('https://rsapi.goong.io/DistanceMatrix', {
            params: { origins: origin, destinations: destination, vehicle, api_key: GOONG_API_KEY }
          })
          if (res.data?.rows?.[0]?.elements?.[0]?.status === 'OK') {
            const el = res.data.rows[0].elements[0]
            setDistanceInfo({ distance: el.distance.text, duration: el.duration.text })
          }
        } catch (e) {
          console.error("Lỗi fetch distance:", e)
        }
      }, () => {
        // user denied or error
      })
    }
  }, [coords, transportMode])

  if (!location || (!location.address && !location.name)) return null
  
  const hasMap = coords && coords.lat != null && coords.lng != null && GOONG_MAPTILES_KEY

  return (
    <div className={styles.offlineBanner}>
      {hasMap && (
        <div className={styles.mapWrap}>
          <Map
            mapLib={maplibregl}
            initialViewState={{
                longitude: coords.lng,
                latitude: coords.lat,
                zoom: 15
            }}
            mapStyle={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`}
            style={{ width: '100%', height: '100%' }}
            interactive={false}
            attributionControl={false}
          >
            <Marker longitude={coords.lng} latitude={coords.lat} anchor="bottom">
              <MapPin size={32} weight="fill" color="#E74C3C" />
            </Marker>
          </Map>
        </div>
      )}

      <div className={styles.locationDetailPanel}>
        <div className={styles.locationTextWrap}>
           <span className={styles.locationName}>{location.name || location.address}</span>
           {location.name && location.address && location.name !== location.address && <span className={styles.locationAddress}>{location.address}</span>}
        </div>
        <div className={styles.distanceControls}>
           <div className={styles.transportPills}>
             <button type="button" className={`${styles.transportPill} ${transportMode === 'car' ? styles.transportPillActive : ''}`} onClick={() => setTransportMode('car')}>
                <Car size={16} weight={transportMode === 'car' ? "fill" : "regular"} /> Ô tô
             </button>
             <button type="button" className={`${styles.transportPill} ${transportMode === 'bike' ? styles.transportPillActive : ''}`} onClick={() => setTransportMode('bike')}>
                <Bicycle size={16} weight={transportMode === 'bike' ? "fill" : "regular"} /> Xe máy
             </button>
           </div>
           {distanceInfo && (
             <div className={styles.distanceValue}>
                <span className={styles.distNum}>{distanceInfo.distance}</span>
                <span className={styles.distDot}>•</span>
                <span className={styles.distDur}>{distanceInfo.duration}</span>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className={styles.emptyField}>
      <Info size={20} weight="light" className={styles.emptyIcon} />
      <span>{text || 'Chưa có thông tin'}</span>
    </div>
  )
}

function RoundDetail({ round }) {
  const isOnline = round.mode === 'online'

  return (
    <div className={styles.detailCard}>
      <div className={styles.detailHead}>
        <div className={styles.detailHeadTop}>
          <h3 className={styles.detailTitle}>{round.name}</h3>
          <Badge
            variant={isOnline ? 'green' : 'orange'}
            size="md"
            dot={false}
            icon={isOnline ? <Broadcast size={16} weight="fill" /> : <MapPin size={16} weight="fill" />}
            label={isOnline ? 'Thi đấu Trực tuyến' : 'Thi đấu Trực tiếp'}
          />
        </div>
        <div className={styles.detailHeadTime}>
           <CalendarBlank size={16} weight="fill" className={styles.detailHeadTimeIcon} />
           {fmtDate(round.start)} – {fmtDate(round.end)}
        </div>
        {round.topTeamPass > 0 && (
          <div className={styles.topTeamPass}>
            <span className={styles.topTeamLabel}>Top đội đi tiếp:</span>
            <span className={styles.topTeamNum}>{round.topTeamPass} đội</span>
          </div>
        )}
      </div>

      <div className={styles.banner}>
        {isOnline ? (
          <div className={styles.onlineBannerCompact}>
            <Broadcast size={24} className={styles.bannerIcon} />
            <div className={styles.onlineBannerText}>
               <span className={styles.onlineBannerTitle}>Đường dẫn tham gia (Meeting Link)</span>
               {round.link ? (
                 <a href={round.link} target="_blank" rel="noreferrer" className={styles.bannerLink}>
                   {round.link}
                 </a>
               ) : (
                 <span className={styles.bannerEmptyText}>Chưa cấu hình link tham gia</span>
               )}
            </div>
          </div>
        ) : (
          <LocationBanner location={round.location} />
        )}
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoLeft}>
           <div className={styles.block}>
             <span className={styles.blockLabel}>Thông tin nộp bài</span>
             {round.submissionType === 'previous' ? (
                <div className={styles.submissionPrevious} style={{ alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                    <strong>Thuyết trình (Pitching)</strong>
                    <span style={{ fontWeight: '500', color: 'var(--color-text-primary)', lineHeight: '1.5' }}>
                      Các đội sẽ sử dụng lại bài nộp từ vòng thi trước để tiến hành báo cáo/thuyết trình trước Ban giám khảo. Không yêu cầu nộp sản phẩm mới.
                    </span>
                  </div>
                </div>
             ) : round.submission ? (
               <>
                 <div className={styles.subRow}>
                    {round.submission.open ? (
                      <span className={styles.subItem}>
                        <Clock size={16} weight="fill" className={styles.subIcon} />
                        Mở: {fmtDateTime(round.submission.open)}
                      </span>
                    ) : null}
                    {round.submission.deadline ? (
                      <span className={styles.subItem}>
                        <UploadSimple size={16} weight="fill" className={styles.subIcon} />
                        Hạn: {fmtDateTime(round.submission.deadline)}
                      </span>
                    ) : null}
                 </div>
                 {round.submission.guide && (
                   <RichTextView html={round.submission.guide} className={styles.guide} />
                 )}
               </>
             ) : (
               <EmptyState text="Chưa cấu hình nộp bài" />
             )}
             
             {round.details && (
                <div className={styles.detailsBlock}>
                  <div className={styles.detailsDivider} />
                  <span className={styles.blockLabel}>Chi tiết đề bài & Hướng dẫn</span>
                  <RichTextView html={round.details} />
                </div>
             )}
           </div>
        </div>

        <div className={styles.infoRight}>
           <div className={styles.block}>
             <span className={styles.blockLabel}>Lịch trình (Agenda)</span>
             {round.agenda?.length > 0 ? (
               <div className={styles.agenda}>
                 {round.agenda.map((a, i) => (
                   <div key={i} className={styles.agendaItem}>
                     <div className={styles.agendaBody}>
                       <span className={styles.agendaTime}>{fmtDateTime(a.time)}</span>
                       <span className={styles.agendaName}>{a.name}</span>
                       {a.desc && <span className={styles.agendaDesc}>{a.desc}</span>}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <EmptyState text="Chưa có lịch trình cho vòng này" />
             )}
           </div>
        </div>
      </div>
    </div>
  )
}

function RoundsSection({ id, rounds = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeRound = rounds[activeIndex]

  const contentRef = useRef(null)
  const [isAtBottom, setIsAtBottom] = useState(false)

  const checkScroll = useCallback(() => {
    const el = contentRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    setIsAtBottom(atBottom)
  }, [])

  useEffect(() => {
    checkScroll()
  }, [activeRound, checkScroll])

  // Chuyển tab: reset scroll + trigger fade animation
  const handleTabChange = (i) => {
    setActiveIndex(i)
    if (contentRef.current) contentRef.current.scrollTop = 0
  }

  return (
    <section id={id} className={styles.section}>
      <div className={styles.headCol}>
        <span className={styles.eyebrow}>Hành trình</span>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            <span className={styles.ac}>Về</span> Vòng thi
          </h2>
          <span className={styles.hicon}>
            <Path weight="fill" />
          </span>
        </div>
        <div className={styles.uline}>
          <span />
          <span />
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.tabsCol}>
          {rounds.map((r, i) => {
            const isActive = i === activeIndex
            const isOnline = r.mode === 'online'
            return (
              <div key={r.id || i} className={[styles.tab, isActive ? styles.tabActive : ''].join(' ')}>
                <div className={styles.tabNode}>{i + 1}</div>
                <button type="button" className={styles.tabBtn} onClick={() => handleTabChange(i)}>
                  <div className={styles.tabHead}>
                    <span className={styles.tabName}>{r.name}</span>
                    <Badge
                      variant={isOnline ? 'green' : 'orange'}
                      size="sm"
                      dot={false}
                      icon={isOnline ? <Broadcast size={14} weight="fill" /> : <MapPin size={14} weight="fill" />}
                      label={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  <div className={styles.tabDate}>
                    <CalendarBlank size={16} weight="fill" className={styles.tabDateIcon} />
                    {fmtDate(r.start)} – {fmtDate(r.end)}
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.contentColWrap}>
          <div 
            className={styles.contentCol} 
            data-lenis-prevent="true"
            ref={contentRef}
            onScroll={checkScroll}
          >
            {activeRound ? (
              <div key={activeIndex} className={styles.fadeIn}>
                <RoundDetail round={activeRound} />
              </div>
            ) : (
              <div className={styles.empty}>Chưa có thông tin vòng thi</div>
            )}
          </div>
          {!isAtBottom && <div className={styles.scrollOverlay} />}
        </div>
      </div>
    </section>
  )
}

export default RoundsSection
