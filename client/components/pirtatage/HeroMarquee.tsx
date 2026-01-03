import React, { useEffect, useState } from 'react';

const PiratageTicker: React.FC = () => {
    const [displayText, setDisplayText] = useState<string>("Welcome to Piratage Website");
    const [isHappyEvent, setIsHappyEvent] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/holiday-status');
                if (!response.ok) {
                    throw new Error('Failed to fetch holiday status');
                }
                const data = await response.json();
                setDisplayText(data.message);
                setIsHappyEvent(data.isHappyEvent);
            } catch (error) {
                console.error('Error fetching holiday status:', error);
                setDisplayText("Welcome to Piratage Website");
                setIsHappyEvent(false);
            }
        };
        fetchStatus();

        // Detect mobile for spacing adjustments
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const renderItems = () => {
        const items = [];
        const separatorStyle = {
            ...styles.separator,
            margin: isMobile ? '0 28px' : '0 50px', // Tighter but consistent gap on mobile
        };
        // Duplicate sequence to ensure seamless looping
        const totalItems = 30;
        for (let i = 0; i < totalItems; i++) {
            items.push(
                <div key={i} className="ticker-marquee-item" style={styles.marqueeItem}>
                    <span className="ticker-live-tag" style={styles.liveTag}>LIVE</span>
                    <span className="ticker-main-text" style={styles.mainText}>
                        {isHappyEvent ? "HAPPY " : ""}{displayText}
                    </span>
                    <span className="ticker-separator" style={separatorStyle}>//</span>
                </div>
            );
        }
        return items;
    };

    return (
        <div className="ticker-wrapper" style={styles.wrapper}>
            <div className="ticker-skew-container" style={styles.skewContainer}>
                <div className="ticker-scroll" style={styles.content}>
                    {renderItems()}
                </div>
            </div>

            <style>
                {`
                    @keyframes ticker-move {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }

                    .ticker-scroll {
                        display: flex;
                        white-space: nowrap;
                        animation: ticker-move 25s linear infinite;
                        align-items: center;
                        will-change: transform;
                    }

                    /* Mobile optimizations */
                    @media (max-width: 768px) {
                        .ticker-scroll {
                            animation: ticker-move 6s linear infinite !important;
                        }
                        
                        .ticker-wrapper {
                            padding: 20px 0 !important;
                        }
                        
                        .ticker-skew-container {
                            transform: skewY(0deg) !important;
                            padding: 8px 0 !important;
                        }
                        
                        .ticker-marquee-item {
                            font-size: 1rem !important;
                            align-items: center !important;
                        }
                        
                        .ticker-live-tag {
                            font-size: 0.6rem !important;
                            padding: 2px 6px !important;
                            margin-right: 10px !important;
                            display: inline-flex !important;
                            align-items: center !important;
                        }
                        
                        .ticker-main-text {
                            display: inline-flex !important;
                            align-items: center !important;
                        }
                        
                        .ticker-separator {
                            font-size: 1rem !important;
                        }
                    }

                    .ticker-scroll:hover {
                        animation-play-state: paused;
                    }
                `}
            </style>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        width: '100%',
        overflow: 'hidden',
        padding: '30px 0',
        background: 'transparent',
    },
    skewContainer: {
        background: '#fff', // White background for a bold "news" look
        transform: 'skewY(-1.5deg)', // The "Style 3" slanted look
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        padding: '10px 0',
        display: 'flex',
        alignItems: 'center',
    },
    content: {
        display: 'flex',
        alignItems: 'center',
    },
    marqueeItem: {
        display: 'flex',
        alignItems: 'center',
        fontFamily: "'Inter', sans-serif",
        fontWeight: '900',
        fontSize: '1.4rem',
        color: '#000',
        textTransform: 'uppercase',
    },
    liveTag: {
        background: '#ff0000',
        color: '#fff',
        padding: '2px 8px',
        fontSize: '0.7rem',
        marginRight: '15px',
        borderRadius: '2px',
        fontWeight: 'bold',
    },
    mainText: {
        letterSpacing: '-0.5px',
    },
    separator: {
        margin: '0 50px',
        color: '#ff0000',
        fontSize: '1.2rem',
    },
    // Note: Use inline media query handling in component for mobile spacing
};

export default PiratageTicker;