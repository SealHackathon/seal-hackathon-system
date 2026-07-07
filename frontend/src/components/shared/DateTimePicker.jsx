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
    yearsPast   = 5,        // số năm ngược trong dropdown năm
    yearsFuture = 14,       // số năm tiếp trong dropdown năm
}) {
    const resolvedPlaceholder = placeholder ?? (showTime ? 'Chọn ngày và giờ' : 'Chọn ngày')
    const resolvedDateFormat   = showTime ? 'EEEE, dd/MM/yyyy, HH:mm' : 'dd/MM/yyyy'
    const totalYears           = yearsPast + yearsFuture

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
                    // Đóng ngay sau khi chọn ngày nếu không có time;
                    // giữ mở nếu có time để user tiếp tục chọn giờ
                    shouldCloseOnSelect={!showTime}
                    showTimeSelect={showTime}
                    timeCaption="Giờ"
                    timeFormat="HH:mm"
                    timeIntervals={30}
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
                />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

        </div>
    )
}

export default DateTimePicker
