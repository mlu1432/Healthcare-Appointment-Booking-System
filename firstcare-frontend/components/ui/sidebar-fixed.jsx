"use Client";

import React from "react";
import { motion } from "framer-motion";

/**
 *  Fixed Sidebar Footer without transitionDelay prop warning
 * @returns JSX.Element
 */

export const sidebarFooterFixed = ({ children, className, ...props }) => {
    const { transitionDelay, ...cleanProps } = props;

    return (
        <motion.div
            className={className}
            {...cleanProps}
        >
            {children}
        </motion.div>
    ); // Destructure to remove transitionDelay
};