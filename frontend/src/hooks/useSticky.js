import { useEffect, useRef, useState } from 'react';

/**
 * Hook để bắt sự kiện khi một element (thường là sticky) dính vào cạnh trên màn hình.
 * @param {string} offset - rootMargin của IntersectionObserver (ví dụ: '-73px 0px 0px 0px' nếu sticky tại top: 73px)
 * @returns {[React.MutableRefObject, boolean]} - Ref để gắn vào thẻ sentinel vô hình, và trạng thái isSticky
 */
export default function useSticky(offset = '0px 0px 0px 0px') {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Khi sentinel bị khuất khỏi màn hình (vượt qua rootMargin), tức là element bên dưới nó đã bắt đầu sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: offset,
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [offset]);

  return [sentinelRef, isSticky];
}
