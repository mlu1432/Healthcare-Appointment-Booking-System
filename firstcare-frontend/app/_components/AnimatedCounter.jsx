"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users } from "lucide-react";

/**
 * ANIMATED COUNTER COMPONENT
 * Features:
 * - Starts counting when component enters viewport
 * - Smooth number animation with comma formatting
 * - Cascading text reveal after numbers complete
 * - Configurable duration and formatting
 */
const AnimatedCounter = ({
    end,
    duration = 2.5,
    suffix = "+",
    text = "KZN Families Served",
}) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    const [count, setCount] = useState(0);

    useEffect(() => {
        if (inView) {
            let start = 0;
            const increment = end / (duration * 60);
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 1000 / 60);

            return () => clearInterval(timer);
        }
    }, [end, duration, inView]);

    // Format number with commas
    const formattedCount = count.toLocaleString();

    return (
        <div ref={ref} className="flex items-center gap-2">
            {/* Icon representing users */}
            <Users className="w-5 h-5 text-blue-300" />

            {/* Animated number display */}
            <motion.span
                className="text-white font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5 }}
            >
                {formattedCount}
                {suffix}
            </motion.span>

            {/* Animated text */}
            <motion.span
                className="text-white font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: duration * 0.7, duration: 0.5 }}
            >
                {text}
            </motion.span>
        </div>
    );
};

export default AnimatedCounter;