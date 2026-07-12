import { useState, useRef, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import axios from 'axios'
import { MagnifyingGlass, MapPin, NavigationArrow, X, Car, Bicycle, Path, ArrowSquareOut } from '@phosphor-icons/react'
import Dropdown from './Dropdown'
import styles from './LocationSearch.module.css'

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY

// ── Gợi ý vị trí chi tiết FPT cho dropdown
const FPT_DETAIL_OPTIONS = [
    { value: 'Thư viện', label: 'Thư viện' },
    { value: 'Hall Academic', label: 'Hall Academic' },
    { value: 'Hall Business', label: 'Hall Business' },
    { value: 'Sảnh Trống Đồng', label: 'Sảnh Trống Đồng' },
]

// ── Hook autocomplete — dùng Goong Autocomplete API ──
function useGoongAutocomplete(input) {
    const [suggestions, setSuggestions] = useState([])

    useEffect(() => {
        if (!input.trim() || !GOONG_API_KEY) {
            setSuggestions([])
            return
        }

        let active = true

        const fetchSuggestions = async () => {
            try {
                const res = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
                    params: {
                        api_key: GOONG_API_KEY,
                        input,
                        location: '10.8231,106.6297', // Tọa độ trung tâm HCM
                        radius: 50000, // Bán kính 50km để ưu tiên kết quả ở HCM
                        limit: 5
                    }
                })
                if (active && res.data && res.data.predictions) {
                    setSuggestions(res.data.predictions)
                }
            } catch (error) {
                console.error('Lỗi fetch Goong suggestion:', error)
                if (active) setSuggestions([])
            }
        }

        const timer = setTimeout(fetchSuggestions, 300)
        return () => { active = false; clearTimeout(timer) }
    }, [input])

    return suggestions
}

// ── Lấy chi tiết địa điểm — dùng Goong Place Detail API ──
async function getGoongPlaceDetails(placeId) {
    try {
        const res = await axios.get('https://rsapi.goong.io/Place/Detail', {
            params: {
                place_id: placeId,
                api_key: GOONG_API_KEY
            }
        })
        const place = res.data.result
        return {
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        }
    } catch (error) {
        console.error('Lỗi fetch Goong place details:', error)
        throw error
    }
}

function LocationSearchInner({ value, onChange, recentPlaces, placeholder, renderBelowSearch }) {
    const locationName = typeof value === 'object' ? (value?.name ?? value?.address ?? '') : (value || '')
    const locationDetail = typeof value === 'object' ? (value?.detail || '') : ''

    const [inputValue, setInputValue] = useState(locationName)
    const [detailValue, setDetailValue] = useState(locationDetail)
    const [open, setOpen] = useState(false)
    const [userLocation, setUserLocation] = useState(null)
    const [transportMode, setTransportMode] = useState('bike')
    const [distanceInfo, setDistanceInfo] = useState(null)
    const wrapperRef = useRef(null)

    const goongSuggestions = useGoongAutocomplete(open ? inputValue : '')

    const lowerInput = inputValue.toLowerCase()
    const hasFpt = ['fpt', 'đại học fpt'].some(k => lowerInput.includes(k))
    const hasHcm = ['hcm', 'hồ chí minh', 'ho chi minh'].some(k => lowerInput.includes(k))
    const isCustomFptQuery = hasFpt && hasHcm && !lowerInput.includes('fpt university hcmc')

    const customSuggestions = isCustomFptQuery
        ? [{
            place_id: 'custom-fpt',
            structured_formatting: {
                main_text: 'FPT University HCMC',
                secondary_text: 'Khu công nghệ cao, TP. Thủ Đức'
            },
            isCustom: true,
            lat: 10.8411,
            lng: 106.8105
        }]
        : []

    const suggestions = [...customSuggestions, ...goongSuggestions]

    const nameOrAddress = typeof value === 'object' && value !== null ? ((value.name || '') + ' ' + (value.address || '')).toLowerCase() : ''
    const hasFptSelected = ['fpt', 'đại học fpt'].some(k => nameOrAddress.includes(k))
    const hasHcmSelected = ['hcm', 'hồ chí minh', 'ho chi minh', 'thủ đức'].some(k => nameOrAddress.includes(k))

    const isFptSelected = typeof value === 'object' && value !== null
        && (
            (value.lat === 10.8411 && value.lng === 106.8105) ||
            (hasFptSelected && hasHcmSelected)
        )

    const isLocationConfirmed = typeof value === 'object' && value !== null && value.lat && value.lng

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setInputValue(locationName)
        setDetailValue(locationDetail)
    }, [locationName, locationDetail])

    // Lấy vị trí user
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Lỗi lấy vị trí:", err),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            )
        }
    }, [])

    // Fetch Distance Matrix
    useEffect(() => {
        if (!userLocation || !value?.lat || !value?.lng || !GOONG_API_KEY) {
            setDistanceInfo(null)
            return
        }

        let active = true
        const fetchDistance = async () => {
            try {
                const res = await axios.get('https://rsapi.goong.io/DistanceMatrix', {
                    params: {
                        origins: `${userLocation.lat},${userLocation.lng}`,
                        destinations: `${value.lat},${value.lng}`,
                        vehicle: transportMode,
                        api_key: GOONG_API_KEY
                    }
                })
                const element = res.data?.rows?.[0]?.elements?.[0]
                if (active && element && element.status === 'OK') {
                    setDistanceInfo({
                        distance: element.distance.text,
                        duration: element.duration.text
                    })
                } else if (active) {
                    setDistanceInfo(null)
                }
            } catch (error) {
                console.error("Lỗi lấy khoảng cách:", error)
                if (active) setDistanceInfo(null)
            }
        }

        fetchDistance()
        return () => { active = false }
    }, [userLocation, value?.lat, value?.lng, transportMode])

    async function handleSelect(suggestion) {
        setOpen(false)

        if (suggestion.isCustom) {
            setInputValue(suggestion.structured_formatting.main_text)
            onChange?.({
                name: suggestion.structured_formatting.main_text,
                address: suggestion.structured_formatting.secondary_text,
                lat: suggestion.lat,
                lng: suggestion.lng,
                detail: detailValue
            })
            return
        }

        try {
            const details = await getGoongPlaceDetails(suggestion.place_id)
            setInputValue(details.name)
            onChange?.({ ...details, detail: detailValue })
        } catch (e) {
            setInputValue(suggestion.structured_formatting.main_text)
            onChange?.({
                name: suggestion.structured_formatting.main_text,
                detail: detailValue
            })
        }
    }

    function handleClear() {
        onChange?.(null)
        setInputValue('')
        setDetailValue('')
    }

    const mapCenter = value && value.lat && value.lng
        ? { lat: value.lat, lng: value.lng }
        : { lat: 10.8231, lng: 106.6297 }

    return (
        <>
            <div className={styles.searchBox} ref={wrapperRef}>
                <div className={styles.inputRow}>
                    <MagnifyingGlass size={18} className={styles.searchIcon} weight="bold" />
                    <input
                        className={styles.input}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={e => {
                            setInputValue(e.target.value)
                            setOpen(true)
                            if (e.target.value === '') {
                                onChange?.(null)
                            }
                        }}
                        onFocus={() => inputValue && setOpen(true)}
                    />
                    {value && (
                        <button type="button" className={styles.clearBtn} onClick={handleClear}>
                            <X size={14} weight="bold" />
                        </button>
                    )}
                </div>

                {open && suggestions.length > 0 && (
                    <ul className={styles.dropdown}>
                        {suggestions.map(s => (
                            <li key={s.place_id} className={styles.suggestion} onMouseDown={() => handleSelect(s)}>
                                <MapPin size={14} weight="fill" className={styles.pinIcon} />
                                <span className={styles.suggestionText}>
                                    <span className={styles.mainText}>{s.structured_formatting.main_text}</span>
                                    <span className={styles.secondaryText}>{s.structured_formatting.secondary_text}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {renderBelowSearch && renderBelowSearch}

            <div>
                <label className={styles.fieldLabel}>Chi tiết vị trí (phòng, lầu)</label>
                <div className={styles.detailInputRow}>
                    {isFptSelected && (
                        <div className={styles.detailDropdownWrap}>
                            <Dropdown
                                placeholder="Gợi ý cơ sở FPT..."
                                options={FPT_DETAIL_OPTIONS}
                                value={detailValue || null}
                                onChange={val => {
                                    setDetailValue(val ?? '')
                                    onChange?.({ ...(typeof value === 'object' ? value : {}), detail: val ?? '' })
                                }}
                                clearable
                            />
                        </div>
                    )}
                    <div className={styles.inputRow} style={{ flex: 1 }}>
                        <input
                            className={styles.input}
                            placeholder={isFptSelected ? 'Hoặc nhập tên phòng, sảnh...' : 'Nhập tên phòng, sảnh, địa chỉ chi tiết...'}
                            value={detailValue}
                            onChange={e => {
                                setDetailValue(e.target.value)
                                onChange?.({ ...(typeof value === 'object' ? value : {}), detail: e.target.value })
                            }}
                        />
                    </div>
                </div>
            </div>

            {recentPlaces.length > 0 && (
                <div className={styles.recentSection}>
                    <span className={styles.recentLabel}>Dùng lại các địa điểm trước</span>
                    <div className={styles.recentList}>
                        {recentPlaces.map((place, i) => (
                            <button
                                key={i} type="button"
                                className={[styles.recentChip, value?.address === place.address && styles.recentChipActive].filter(Boolean).join(' ')}
                                onClick={() => onChange?.(place)}
                            >
                                <NavigationArrow size={13} weight="fill" />
                                {place.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {value && value.lat && value.lng && (
                <>
                    <div className={styles.mapWrapper}>
                        <Map
                            mapLib={maplibregl}
                            initialViewState={{
                                longitude: mapCenter.lng,
                                latitude: mapCenter.lat,
                                zoom: 15
                            }}
                            longitude={mapCenter.lng}
                            latitude={mapCenter.lat}
                            style={{ width: '100%', height: '100%' }}
                            mapStyle={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`}
                            interactive={false}
                            attributionControl={false}
                        >
                            <Marker longitude={mapCenter.lng} latitude={mapCenter.lat} anchor="bottom">
                                <MapPin size={32} weight="fill" color="#E74C3C" />
                            </Marker>
                        </Map>

                        <div className={styles.mapBadge}>
                            <MapPin size={14} weight="fill" className={styles.badgeIconPin} />
                            <span className={styles.badgeName}>{value.name}</span>
                            {distanceInfo && (
                                <>
                                    <span className={styles.badgeSeparator}>|</span>
                                    {transportMode === 'car' ? <Car size={14} weight="fill" className={styles.badgeIconVehicle} /> : <Bicycle size={14} weight="fill" className={styles.badgeIconVehicle} />}
                                    <span className={styles.badgeDistance}>{distanceInfo.distance} • {distanceInfo.duration}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.distanceSection}>
                        <div className={styles.distanceControls}>
                            <div className={styles.transportPills}>
                                <button type="button" className={`${styles.transportPill} ${transportMode === 'car' ? styles.transportPillActive : ''}`} onClick={() => setTransportMode('car')}>
                                    <Car size={16} weight={transportMode === 'car' ? "fill" : "regular"} /> Ô tô
                                </button>
                                <button type="button" className={`${styles.transportPill} ${transportMode === 'bike' ? styles.transportPillActive : ''}`} onClick={() => setTransportMode('bike')}>
                                    <Bicycle size={16} weight={transportMode === 'bike' ? "fill" : "regular"} /> Xe máy
                                </button>
                            </div>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${value.lat},${value.lng}`} target="_blank" rel="noopener noreferrer" className={styles.directionBtn}>
                                Chỉ đường <ArrowSquareOut size={16} weight="bold" />
                            </a>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

function LocationSearch({
    label,
    required,
    value,
    onChange,
    recentPlaces = [],
    placeholder = 'Tìm kiếm địa điểm ...',
    renderBelowSearch
}) {
    return (
        <div className={styles.wrapper}>
            {label && (
                <label className={styles.label}>
                    {label}{required && <span className={styles.required}> *</span>}
                </label>
            )}
            <LocationSearchInner
                value={value}
                onChange={onChange}
                recentPlaces={recentPlaces}
                placeholder={placeholder}
                renderBelowSearch={renderBelowSearch}
            />
        </div>
    )
}

export default LocationSearch