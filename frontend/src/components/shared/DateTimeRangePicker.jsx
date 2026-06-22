import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { vi } from 'date-fns/locale/vi'
import { CalendarBlank, Clock, CaretLeft, CaretRight } from '@phosphor-icons/react'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './DateTimeRangePicker.module.css'

registerLocale('vi', vi)

// Lấy giờ/phút từ Date, merge vào base date
function withTime(base, timeDate) {
    if (!base || !timeDate) return base
    const d = new Date(base)
    d.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0)
    return d
}

// Đổi date portion của d thành date của newDate (giữ nguyên giờ)
function withDate(d, newDate) {
    if (!newDate) return null
    if (!d) {
        // Chưa có time -> giờ = 0:00
        const r = new Date(newDate)
        r.setHours(0, 0, 0, 0)
        return r
    }
    const r = new Date(newDate)
    r.setHours(d.getHours(), d.getMinutes(), 0, 0)
    return r
}

/**
 * DateTimeRangePicker
 *
 * Layout: [Thứ Ba, 05/08/2026]  [08:00]  –  [20:00]
 *
 * Props:
 *   label, required, error, disabled
 *   startValue : Date | null
 *   endValue   : Date | null
 *   onStartChange : (date: Date | null) => void
 *   onEndChange   : (date: Date | null) => void
 *   endOptional   : boolean  — nếu true, label end = "Kết thúc (tùy chọn)"
 */
function DateTimeRangePicker({
    label,
    required,
    error,
    disabled,
    startValue,
    endValue,
    onStartChange,
    onEndChange,
    endOptional = true,
}) {
    // Shared date (lấy từ startValue hoặc endValue)
    const sharedDate = startValue ?? endValue ?? null

    function handleDateChange(newDate) {
        // Cập nhật date cho cả start và end, giữ nguyên giờ
        onStartChange?.(withDate(startValue, newDate))
        if (endValue) onEndChange?.(withDate(endValue, newDate))
    }

    function handleStartTimeChange(timeDate) {
        if (!sharedDate) return
        const next = withTime(sharedDate, timeDate)
        // Nếu end bị trước start → xóa end
        if (endValue && next && endValue < next) onEndChange?.(null)
        onStartChange?.(next)
    }

    function handleEndTimeChange(timeDate) {
        if (!sharedDate) return
        onEndChange?.(withTime(sharedDate, timeDate))
    }

    const customHeader = ({ date, changeMonth, changeYear, decreaseMonth, increaseMonth,
        prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
        <div className={styles.customHeader}>
            <div className={styles.headerRow}>
                <button type="button" className={styles.navBtn}
                    onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                    <CaretLeft size={16} weight="bold" />
                </button>
                <select className={styles.headerSelect}
                    value={date.getMonth()}
                    onChange={e => changeMonth(+e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>Tháng {i + 1}</option>
                    ))}
                </select>
                <select className={styles.headerSelect}
                    value={date.getFullYear()}
                    onChange={e => changeYear(+e.target.value)}>
                    {Array.from({ length: 20 }, (_, i) => {
                        const y = new Date().getFullYear() - 5 + i
                        return <option key={y} value={y}>{y}</option>
                    })}
                </select>
                <button type="button" className={styles.navBtn}
                    onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                    <CaretRight size={16} weight="bold" />
                </button>
            </div>
            <button type="button" className={styles.todayBtn}
                onClick={() => {
                    const now = new Date()
                    changeMonth(now.getMonth())
                    changeYear(now.getFullYear())
                    handleDateChange(now)
                }}>
                Hôm nay
            </button>
        </div>
    )

    return (
        <div className={styles.wrapper}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.asterisk}> *</span>}
                </label>
            )}

            <div className={`${styles.row} ${error ? styles.rowError : ''}`}>

                {/* ── Date picker ── */}
                <div className={styles.datePart}>
                    <CalendarBlank size={16} weight='fill' color={'var(--color-border-blue)'} className={styles.icon} />
                    <ReactDatePicker
                        locale="vi"
                        selected={sharedDate}
                        onChange={handleDateChange}
                        shouldCloseOnSelect={false}
                        showTimeSelect={false}
                        dateFormat="EEE, dd/MM/yyyy"
                        placeholderText="Chọn ngày"
                        disabled={disabled}
                        showMonthDropdown showYearDropdown dropdownMode="select"
                        yearDropdownItemNumber={10}
                        className={styles.dateInput}
                        calendarClassName={styles.calendar}
                        wrapperClassName={styles.pickerWrapper}
                        popperClassName={styles.popper}
                        showPopperArrow={false}
                        autoComplete="off"
                        renderCustomHeader={customHeader}
                    />
                </div>

                <div className={styles.timeParts}>
                    {/* ── Start time ── */}
                    <div className={styles.timePart}>
                        <ReactDatePicker
                            locale="vi"
                            selected={startValue}
                            onChange={handleStartTimeChange}
                            shouldCloseOnSelect={false}
                            showTimeSelect
                            showTimeSelectOnly
                            timeCaption="Bắt đầu"
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            dateFormat="HH:mm"
                            placeholderText="--:--"
                            disabled={disabled || !sharedDate}
                            className={styles.timeInput}
                            calendarClassName={styles.calendar}
                            wrapperClassName={styles.pickerWrapper}
                            popperClassName={styles.popper}
                            showPopperArrow={false}
                            autoComplete="off"
                        />
                        <Clock size={16} weight='fill' color={'var(--color-border-blue)'} className={styles.timeIcon} />
                    </div>

                    <span className={styles.sep}>–</span>

                    {/* ── End time ── */}
                    <div className={styles.timePart}>
                        <ReactDatePicker
                            locale="vi"
                            selected={endValue}
                            onChange={handleEndTimeChange}
                            shouldCloseOnSelect={false}
                            showTimeSelect
                            showTimeSelectOnly
                            timeCaption={endOptional ? 'Kết thúc' : 'Kết thúc'}
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            dateFormat="HH:mm"
                            placeholderText="--:--"
                            disabled={disabled || !startValue}
                            minTime={startValue ?? undefined}
                            maxTime={startValue ? new Date(startValue).setHours(23, 59) : undefined}
                            className={styles.timeInput}
                            calendarClassName={styles.calendar}
                            wrapperClassName={styles.pickerWrapper}
                            popperClassName={styles.popper}
                            showPopperArrow={false}
                            autoComplete="off"
                        />
                        <Clock size={16} weight='fill' color={'var(--color-border-blue)'} className={styles.timeIcon} />
                    </div>
                </div>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    )
}

export default DateTimeRangePicker
