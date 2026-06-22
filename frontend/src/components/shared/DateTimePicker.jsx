import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { vi } from 'date-fns/locale/vi'
import { CalendarBlank, Clock, CaretLeft, CaretRight } from '@phosphor-icons/react'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './DateTimePicker.module.css'

registerLocale('vi', vi)

function DateTimePicker({
    label,
    required,
    value,
    onChange,
    placeholder = 'Chọn ngày và giờ',
    minDate,
    maxDate,
    minTime,
    maxTime,
    disabled,
    error,
}) {
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
                    shouldCloseOnSelect={false}   // đóng khi click ra ngoài, không đóng khi chọn time
                    showTimeSelect
                    timeCaption="Giờ"
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="EEEE, dd/MM/yyyy, HH:mm"
                    placeholderText={placeholder}
                    minDate={minDate}
                    maxDate={maxDate}
                    minTime={minTime}
                    maxTime={maxTime}
                    disabled={disabled}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={10}
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
                                    {Array.from({ length: 20 }, (_, i) => {
                                        const year = new Date().getFullYear() - 5 + i
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
                                    onChange(now)             // chọn luôn ngày + giờ hiện tại
                                }}
                            >
                                Hôm nay
                            </button>

                        </div>
                    )}
                />

                <Clock size={20} className={styles.iconRight} />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

        </div>
    )
}

export default DateTimePicker