import React, { useEffect, useState } from 'react';

// Shown above loading skeletons. Appears only if loading drags on, so a
// fast response never flashes it. Free hosting can take up to a minute to wake.
const WakeNotice = ({ delay = 4000 }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    if (!show) return null;

    return (
        <p className="dd-wake-notice" role="status">
            Waking the server. This runs on free hosting, so the first load can take up to a minute.
        </p>
    );
};

export default WakeNotice;
