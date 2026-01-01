import React, { useEffect, useState } from 'react';

const PiratageTicker: React.FC = () => {
    const [displayText, setDisplayText] = useState<string>("Welcome to Piratage Website");
    const [isHappyEvent, setIsHappyEvent] = useState<boolean>(false);

    const API_KEY = 'AIzaSyCBiCRx4fIAe2kT2bwiIziO5rbN6E4-6FI';
    const CAL_ID = 'en.indian#holiday@group.v.calendar.google.com';

    useEffect(() => {
        const fetchStatus = async () => {
            const now = new Date();
            if (now.getMonth() === 0 && now.getDate() === 1) {
                setDisplayText(`New Year ${now.getFullYear()}`);
                setIsHappyEvent(true);
                return;
            }

            try {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
                const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?key=${API_KEY}&timeMin=${start}&timeMax=${end}&singleEvents=true`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    setDisplayText(data.items[0].summary);
                    setIsHappyEvent(true);
                } else {
                    setDisplayText("Welcome to Piratage Website");
                    setIsHappyEvent(false);
                }
            } catch (error) {
                setDisplayText("Welcome to Piratage Website");
                setIsHappyEvent(false);
            }
        };
        fetchStatus();
    }, []);

    const renderItems = () => {
        const items = [];
        for (let i = 0; i < 15; i++) {
            items.push(
                <div key={i} style={styles.marqueeItem}>
                    <span style={styles.liveTag}>LIVE</span>
                    <span style={styles.mainText}>
                        {isHappyEvent ? "HAPPY " : ""}{displayText}
                    </span>
                    <span style={styles.separator}>//</span>
                </div>
            );
        }
        return items;
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.skewContainer}>
                <div className="ticker-scroll" style={styles.content}>
                    {renderItems()}
                </div>
            </div>

            <style>
                {`
                    .ticker-scroll {
                        display: flex;
                        white-space: nowrap;
                        animation: ticker-move 25s linear infinite;
                    }

                    @keyframes ticker-move {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
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
    }
};

export default PiratageTicker;