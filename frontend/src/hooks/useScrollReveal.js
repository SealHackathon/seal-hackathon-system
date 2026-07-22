import { useRef, useState, useEffect } from 'react'

/**
 * useScrollReveal — hook phát hiện element vào viewport
 * Dùng IntersectionObserver, chỉ trigger 1 lần (once=true mặc định).
 *
 * @param {object} options
 * @param {string} [options.threshold=0.15] - % element visible để trigger
 * @param {string} [options.rootMargin='0px'] - margin xung quanh root
 * @param {boolean} [options.once=true] - chỉ trigger 1 lần rồi dừng observe
 * @returns {[React.RefObject, boolean]} [ref, isVisible]
 */
function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -50px 0px', once = true } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Chỉ observe 1 lần nếu once=true
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, isVisible]
}

export default useScrollReveal
