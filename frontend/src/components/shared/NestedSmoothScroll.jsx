import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function NestedSmoothScroll({ children, className, style, innerRef, innerClassName }) {
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!wrapperRef.current || !contentRef.current) return;

        const lenis = new Lenis({
            wrapper: wrapperRef.current,
            content: contentRef.current,
            autoRaf: true,
            lerp: 0.25,
        });

        const resizeObserver = new ResizeObserver(() => {
            lenis.resize();
        });
        resizeObserver.observe(contentRef.current);

        return () => {
            resizeObserver.disconnect();
            lenis.destroy();
        };
    }, []);

    return (
        <div
            ref={(el) => {
                wrapperRef.current = el;
                if (innerRef) innerRef.current = el;
            }}
            className={className}
            style={style}
        >
            <div ref={contentRef} className={innerClassName}>
                {children}
            </div>
        </div>
    );
}
