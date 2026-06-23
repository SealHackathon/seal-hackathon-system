import { useState, useRef, useEffect } from 'react'
import { APIProvider, Map, AdvancedMarker, useApiIsLoaded, useMap } from '@vis.gl/react-google-maps'
import { MagnifyingGlass, MapPin, NavigationArrow, X } from '@phosphor-icons/react'
import styles from './LocationSearch.module.css'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// ── Hook autocomplete — chỉ chạy sau khi API loaded ──
function usePlacesAutocomplete(input) {
    const [suggestions, setSuggestions] = useState([])
    const serviceRef = useRef(null)
    const apiIsLoaded = useApiIsLoaded()   // ← đợi API sẵn sàng

    useEffect(() => {
        if (!apiIsLoaded) return
        serviceRef.current = new window.google.maps.places.AutocompleteService()
    }, [apiIsLoaded])

    useEffect(() => {
        if (!input.trim() || !serviceRef.current) { setSuggestions([]); return }
        serviceRef.current.getPlacePredictions(
            { input, language: 'vi' },
            (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setSuggestions(results ?? [])
                } else {
                    setSuggestions([])
                }
            }
        )
    }, [input])

    return suggestions
}

function getPlaceDetails(placeId) {
    return new Promise((resolve, reject) => {
        const div = document.createElement('div')
        const service = new window.google.maps.places.PlacesService(div)
        service.getDetails(
            { placeId, fields: ['name', 'formatted_address', 'geometry'] },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    resolve({
                        name: place.name,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    })
                } else { reject(status) }
            }
        )
    })
}

function getDistance(origin, destination) {
    return new Promise((resolve) => {
        const service = new window.google.maps.DistanceMatrixService()
        service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destination],
                travelMode: window.google.maps.TravelMode.DRIVING,
                language: 'vi',
            },
            (res, status) => {
                if (status === 'OK') {
                    const el = res.rows[0]?.elements[0]
                    resolve(el?.status === 'OK'
                        ? { distance: el.distance.text, duration: el.duration.text }
                        : null)
                } else { resolve(null) }
            }
        )
    })
}

// ── Inner component: dùng hooks cần APIProvider ──
function LocationSearchInner({ value, onChange, recentPlaces, placeholder }) {
    const [inputValue, setInputValue] = useState('')
    const [open, setOpen] = useState(false)
    const [userLocation, setUserLocation] = useState(null)
    const [distance, setDistance] = useState(null)
    const wrapperRef = useRef(null)

    const suggestions = usePlacesAutocomplete(inputValue)

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { }
        )
    }, [])

    useEffect(() => {
        if (!userLocation || !value) { setDistance(null); return }
        getDistance(
            new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
            new window.google.maps.LatLng(value.lat, value.lng)
        ).then(setDistance)
    }, [userLocation, value])

    async function handleSelect(suggestion) {
        setOpen(false); setInputValue('')
        try { onChange?.(await getPlaceDetails(suggestion.place_id)) }
        catch (e) { console.error(e) }
    }

    function handleClear() { onChange?.(null); setDistance(null); setInputValue('') }


    // * Dịch chuyển mini map tới location mới 
    function MapController({ center }) {
        const map = useMap()

        useEffect(() => {
            if (!map || !center) return
            map.panTo(center)
        }, [map, center])

        return null
    }

    const mapCenter = value
        ? { lat: value.lat, lng: value.lng }
        : { lat: 10.8231, lng: 106.6297 }

    return (
        <>
            <div className={styles.searchBox} ref={wrapperRef}>
                <div className={styles.inputRow}>
                    <MagnifyingGlass size={18} className={styles.searchIcon} weight="bold" />
                    <input
                        className={styles.input}
                        placeholder={value ? value.name : placeholder}
                        value={inputValue}
                        onChange={e => { setInputValue(e.target.value); setOpen(true) }}
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

            {value && (
                <div className={styles.mapWrapper}>
                    <a
                        href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mapOverlay}
                    />

                    <Map
                        mapId="location-mini-map"
                        defaultCenter={mapCenter}
                        defaultZoom={15}
                        disableDefaultUI
                        gestureHandling="none"
                        clickableIcons={false}
                        className={styles.mapInner}
                    >
                        <MapController center={mapCenter} />
                        <AdvancedMarker position={mapCenter} />
                        {userLocation && <AdvancedMarker position={userLocation} />}
                    </Map>
                    <div className={styles.mapBadge}>
                        <MapPin size={13} weight="fill" />
                        <span>{value.name}</span>
                        {distance && (
                            <span className={styles.distanceBadge}>
                                {distance.distance} · {distance.duration}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

// ── Outer component: bọc APIProvider ──
function LocationSearch({
    label,
    required,
    value,
    onChange,
    recentPlaces = [],
    placeholder = 'Tìm kiếm địa điểm ...',
}) {
    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
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
                />
            </div>
        </APIProvider>
    )
}

export default LocationSearch