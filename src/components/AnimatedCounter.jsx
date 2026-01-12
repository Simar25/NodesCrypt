import React, { useEffect, useRef, useState } from 'react';

// Counter component that animates every time it becomes visible
const AnimatedCounter = ({ end, prefix = '', suffix = '', duration = 1500, isVisible }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
        if (!isVisible) {
            setCount(0);
            return;
        }

        const startTime = performance.now();
        const endValue = end;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(easeOut * endValue));

            if (progress < 1) {
                countRef.current = requestAnimationFrame(animate);
            }
        };

        countRef.current = requestAnimationFrame(animate);

        return () => {
            if (countRef.current) {
                cancelAnimationFrame(countRef.current);
            }
        };
    }, [isVisible, end, duration]);

    return <span>{prefix}{count}{suffix}</span>;
};

export default AnimatedCounter;
