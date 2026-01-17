// Animation variants for Framer Motion
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
};

export const slideUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
};

export const slideDown = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
};

export const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

export const staggerItem = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3 },
};

// Easing functions
export const easing = {
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { type: "spring", stiffness: 500, damping: 30 },
};

// Duration constants (in ms)
export const duration = {
    fast: 150,
    medium: 250,
    slow: 400,
};

// Utility to check if user prefers reduced motion
export const shouldReduceMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation props with reduced motion support
export const getAnimationProps = (animation: any) => {
    if (shouldReduceMotion()) {
        return {
            initial: animation.animate,
            animate: animation.animate,
            exit: animation.animate,
            transition: { duration: 0 },
        };
    }
    return animation;
};
