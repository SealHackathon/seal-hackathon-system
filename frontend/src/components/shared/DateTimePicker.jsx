import { useMemo } from 'react'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { vi } from 'date-fns/locale/vi'
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './DateTimePicker.module.css'

registerLocale('vi', vi)

/**
 * DateTimePicker
 *
 * Props mới:
 *   showTime    : boolean  — hiển thị phần chọn giờ hay không (default: true)
 *   yearsPast   : number   — số năm trước hiện tại trong dropdown năm (default: 5)
 *   yearsFuture : number   — số năm sau hiện tại trong dropdown năm (default: 14)
 *
 * Ví dụ:
 *   <DateTimePicker label="Ngày sinh" showTime={false} yearsPast={100} maxDate={new Date()} />
 *   <DateTimePicker label="Thời gian sự kiện" />   ← mặc định có giờ
 */
function DateTimePicker({
    label,
    required,
    value,
    onChange,
    placeholder,            // nếu không truyền, tự động theo showTime
    minDate,
    maxDate,
    minTime,
    maxTime,
    disabled,
    error,
    showTime    = true,     // mặc định có time
    timeOnly    = false,    // chỉ hiển thị chọn giờ
    yearsPast   = 5,        // số năm ngược trong dropdown năm
    yearsFuture = 14,       // số năm tiếp trong dropdown năm
    highlightRanges = [],   // mảng { start, end, colorType: 'registration' | 'round', label }
}) {
    const resolvedPlaceholder = placeholder ?? (timeOnly ? 'Chọn giờ' : (showTime ? 'Chọn ngày và giờ' : 'Chọn ngày'))
    const resolvedDateFormat   = timeOnly ? 'HH:mm' : (showTime ? 'EEEE, dd/MM/yyyy, HH:mm' : 'dd/MM/yyyy')
    const totalYears           = yearsPast + yearsFuture

    // ── Xử lý Highlight Dates ──
    const { highlightDates, legendItems } = useMemo(() => {
        if (!highlightRanges || highlightRanges.length === 0) return { highlightDates: [], legendItems: [] }

        const registrationDates = []
        const roundDates = []
        const legendMap = new Map()

        highlightRanges.forEach(range => {
            if (!range.start || !range.end) return
            const start = new Date(range.start)
            const end = new Date(range.end)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if (range.colorType === 'registration') registrationDates.push(new Date(d))
                else if (range.colorType === 'round') roundDates.push(new Date(d))
            }

            if (!legendMap.has(range.colorType)) {
                legendMap.set(range.colorType, {
                    colorType: range.colorType,
                    label: range.label,
                    colorValue: range.colorType === 'registration' ? 'var(--color-primary-green)' : 'var(--color-primary-orange)'
                })
            }
        })

        const highlights = []
        if (registrationDates.length > 0) highlights.push({ [styles.highlightRegistration]: registrationDates })
        if (roundDates.length > 0) highlights.push({ [styles.highlightRound]: roundDates })

        const finalLegend = [
            { colorType: 'today', label: 'Hôm nay', colorValue: 'var(--color-primary-blue)' },
            ...Array.from(legendMap.values())
        ]

        return { highlightDates: highlights, legendItems: finalLegend }
    }, [highlightRanges])

    return (
        <div className={styles.wrapper}>

            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.asterisk}> *</span>}
                </label>
            )}

            <div className={`${styles.inputWrapper} ${error ? styles.inputWrapperError : ''}`}>
                <CalendarBlank size={20} className={styles.iconLeft} />

                <ReactDatePicker
                    locale="vi"
                    selected={value}
                    onChange={onChange}
                    portalId="root-portal"
                    // Đóng ngay sau khi chọn ngày nếu không có time;
                    // giữ mở nếu có time để user tiếp tục chọn giờ
                    shouldCloseOnSelect={!showTime || timeOnly}
                    showTimeSelect={showTime || timeOnly}
                    showTimeSelectOnly={timeOnly}
                    timeCaption="Giờ"
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat={resolvedDateFormat}
                    placeholderText={resolvedPlaceholder}
                    minDate={minDate}
                    maxDate={maxDate}
                    minTime={minTime}
                    maxTime={maxTime}
                    disabled={disabled}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={totalYears}
                    className={styles.input}
                    calendarClassName={styles.calendar}
                    wrapperClassName={styles.pickerWrapper}
                    popperClassName={styles.popper}
                    showPopperArrow={false}
                    autoComplete="off"
                    highlightDates={highlightDates}
                    renderCustomHeader={({
                        date,
                        changeMonth,
                        changeYear,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                    }) => (
                        <div className={styles.customHeader}>

                            {/* Hàng 1: nav + dropdowns */}
                            <div className={styles.headerRow}>
                                <button type="button" className={styles.navBtn}
                                    onClick={decreaseMonth} disabled={prevMonthButtonDisabled}
                                >
                                    <CaretLeft size={16} weight="bold" />
                                </button>

                                <select className={styles.headerSelect}
                                    value={date.getMonth()}
                                    onChange={e => changeMonth(parseInt(e.target.value))}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>Tháng {i + 1}</option>
                                    ))}
                                </select>

                                <select className={styles.headerSelect}
                                    value={date.getFullYear()}
                                    onChange={e => changeYear(parseInt(e.target.value))}
                                >
                                    {Array.from({ length: totalYears }, (_, i) => {
                                        const year = new Date().getFullYear() - yearsPast + i
                                        return <option key={year} value={year}>{year}</option>
                                    })}
                                </select>

                                <button type="button" className={styles.navBtn}
                                    onClick={increaseMonth} disabled={nextMonthButtonDisabled}
                                >
                                    <CaretRight size={16} weight="bold" />
                                </button>
                            </div>

                            {/* Hàng 2: nút Hôm nay */}
                            <button
                                type="button"
                                className={styles.todayBtn}
                                onClick={() => {
                                    const now = new Date()
                                    changeMonth(now.getMonth())
                                    changeYear(now.getFullYear())
                                    // Nếu không có time: chọn ngày hôm nay, reset giờ về 0:00
                                    if (!showTime) {
                                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                                        onChange(today)
                                    } else {
                                        onChange(now)
                                    }
                                }}
                            >
                                Hôm nay
                            </button>

                        </div>
                    )}
                >
                    {legendItems.length > 0 && (
                        <div className={styles.legendContainer}>
                            {legendItems.map(item => (
                                <div key={item.colorType} className={styles.legendItem}>
                                    <div className={styles.legendColor} style={{ backgroundColor: item.colorValue }} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </ReactDatePicker>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

        </div>
    )
}

export default DateTimePicker
