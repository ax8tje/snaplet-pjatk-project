import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrossPlatformNavigation } from '../utils/navigation';
import { useUserStore } from '../store/userStore';
import { getClipsByMonth, deleteClip } from '../services/clipService';
import './CalendarScreen.css';

export default function CalendarScreen() {
    const nav = useCrossPlatformNavigation();
    const navigate = useNavigate();
    const currentUser = useUserStore((state) => state.user);
    const userId = currentUser?.uid || null;

    const containerRef = useRef(null);
    const headerRef = useRef(null);

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
    const [clipsByDate, setClipsByDate] = useState({});
    const [loading, setLoading] = useState(false);
    const [now, setNow] = useState(new Date());
    const [selectedClip, setSelectedClip] = useState(null);
    const [tileSize, setTileSize] = useState(92); // default px
    const [isDeleting, setIsDeleting] = useState(false);

    // Preferred layout settings (tweak these to tune)
    const PREFERRED_COLUMNS = 5; // mock default
    const MIN_COLUMNS = 5;
    const MAX_COLUMNS = 7;
    const GAP = 12; // px
    const MIN_TILE = 30; // minimal acceptable tile size (px)
    const MAX_TILE = 70; // maximal acceptable tile size (px)
    const BOTTOM_RESERVED = 120; // space for bottom nav etc (px)

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const loadClips = useCallback(async (userId, year, month) => {
        if (!userId) return;
        setLoading(true);
        try {
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            const clips = await getClipsByMonth(userId, monthKey);
            const map = {};
            clips.forEach(c => { if (c?.date) map[c.date] = c; });
            setClipsByDate(map);
        } catch (err) {
            console.error('Failed to load clips for month', err);
            setClipsByDate({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClips(userId, year, month);
    }, [userId, year, month, loadClips]);

    // grid prep
    const firstDay = new Date(year, month - 1, 1);
    const weekdayOffset = firstDay.getDay(); // 0=Sun
    const offsetMonday = (weekdayOffset + 6) % 7; // Monday=0
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalTiles = offsetMonday + daysInMonth;

    // Recompute tile size trying to keep PREFERRED_COLUMNS, but adapt if needed
    const recomputeTileSize = useCallback(() => {
        const viewportHeight = window.innerHeight;
        const headerHeight = headerRef.current ? Math.ceil(headerRef.current.getBoundingClientRect().height) : 84;
        const availableHeight = Math.max(220, viewportHeight - headerHeight - BOTTOM_RESERVED - 12);

        // Try candidate column counts and pick one that gives tile size within [MIN_TILE, MAX_TILE]
        // Preference order: PREFERRED_COLUMNS, then try increasing and decreasing number of columns (closer to preferred first)
        const candidates = [];
        candidates.push(PREFERRED_COLUMNS);
        for (let i = 1; i <= Math.max(MAX_COLUMNS - PREFERRED_COLUMNS, PREFERRED_COLUMNS - MIN_COLUMNS); i++) {
            if (PREFERRED_COLUMNS + i <= MAX_COLUMNS) candidates.push(PREFERRED_COLUMNS + i);
            if (PREFERRED_COLUMNS - i >= MIN_COLUMNS) candidates.push(PREFERRED_COLUMNS - i);
        }

        let chosen = { cols: PREFERRED_COLUMNS, size: MIN_TILE };
        let found = false;

        for (const cols of candidates) {
            const rows = Math.ceil(totalTiles / cols);
            const totalGaps = Math.max(0, rows - 1) * GAP;
            const computedSize = Math.floor((availableHeight - totalGaps) / rows);

            // if computedSize fits the allowed bounds, pick it (prefer first found = closest to preferred)
            if (computedSize >= MIN_TILE && computedSize <= MAX_TILE) {
                chosen = { cols, size: computedSize };
                found = true;
                break;
            }

            // if none in range, keep candidate that gives size closest to range (minimize overflow or underflow)
            const diff = computedSize < MIN_TILE ? (MIN_TILE - computedSize) : (computedSize - MAX_TILE);
            if (!found) {
                if (!chosen.bestDiff || diff < chosen.bestDiff) {
                    chosen = { cols, size: Math.max(MIN_TILE, Math.min(computedSize, MAX_TILE)), bestDiff: diff };
                }
            }
        }

        // If nothing found with candidates (edge case), fallback:
        if (!chosen.size) chosen.size = MIN_TILE;

        // update tileSize and set CSS grid columns via inline styles later
        setTileSize(chosen.size);

        // Also set a CSS variable with chosen columns so UI can use it if needed
        if (containerRef.current) containerRef.current.style.setProperty('--calendar-cols', String(chosen.cols));
    }, [totalTiles]);

    useEffect(() => {
        recomputeTileSize();
        window.addEventListener('resize', recomputeTileSize);
        return () => window.removeEventListener('resize', recomputeTileSize);
    }, [recomputeTileSize]);

    // helpers
    const toIso = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const startOfDay = (y,m,d) => new Date(y, m-1, d, 0,0,0,0);
    const isSameDay = (d1, d2) =>
        d1.getFullYear()===d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate();
    const isFuture = (y,m,d) => startOfDay(y,m,d) > now;
    const isToday = (y,m,d) => isSameDay(startOfDay(y,m,d), startOfDay(now.getFullYear(), now.getMonth()+1, now.getDate()));
    const timeUntil = (y,m,d) => {
        const target = startOfDay(y,m,d);
        let diff = Math.max(0, target.getTime() - now.getTime());
        const days = Math.floor(diff / (24*3600*1000)); diff -= days*24*3600*1000;
        const hours = Math.floor(diff / (3600*1000)); diff -= hours*3600*1000;
        const mins = Math.floor(diff / (60*1000));
        if (days > 0) return `${days}d ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
        const secs = Math.floor((diff - mins*60*1000)/1000);
        return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    };

    // build grid items
    const gridItems = [];
    for (let i=0;i<offsetMonday;i++) gridItems.push({ empty: true, key:`empty-${i}` });
    for (let d=1; d<=daysInMonth; d++) {
        const iso = toIso(year, month, d);
        gridItems.push({ empty:false, day:d, iso, key:iso });
    }

    const onTileClick = (item) => {
        if (item.empty) return;
        const { day, iso } = item;
        const clip = clipsByDate[iso];
        const y=year,m=month,d=day;
        if (clip) { setSelectedClip({ ...clip, canReplace: isToday(y,m,d) }); return; }
        if (isToday(y,m,d)) { navigate('/camera'); return; }
        if (isFuture(y,m,d)) { window.alert(`Clip can be added in: ${timeUntil(y,m,d)}`); return; }
        // Past day without clip - do nothing or show message
    };

    const closeModal = () => setSelectedClip(null);

    const handleDeleteClip = async () => {
        if (!selectedClip || !userId) return;
        if (!window.confirm('Czy na pewno chcesz usunąć ten klip?')) return;

        setIsDeleting(true);
        try {
            await deleteClip(userId, selectedClip.date);
            // Remove from local state
            setClipsByDate(prev => {
                const copy = { ...prev };
                delete copy[selectedClip.date];
                return copy;
            });
            setSelectedClip(null);
        } catch (err) {
            console.error('Failed to delete clip:', err);
            window.alert('Nie udało się usunąć klipu');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReplaceClip = () => {
        if (!selectedClip) return;
        setSelectedClip(null);
        navigate('/camera');
    };
    const prevMonth = () => { let ny=year, nm=month-1; if (nm<1){nm=12; ny-=1;} setYear(ny); setMonth(nm); };
    const nextMonth = () => { let ny=year, nm=month+1; if (nm>12){nm=1; ny+=1;} setYear(ny); setMonth(nm); };

    // read chosen columns from CSS variable (fallback to preferred)
    const cols = containerRef.current ? Number(containerRef.current.style.getPropertyValue('--calendar-cols')) || PREFERRED_COLUMNS : PREFERRED_COLUMNS;

    return (
        <div className="calendar-root" ref={containerRef}>
            <div className="calendar-inner" style={{ maxWidth: 420 }}>
                <div className="calendar-header" ref={headerRef}>
                    <button className="nav-btn" onClick={prevMonth} aria-label="prev month">◀</button>
                    <div className="month-label">
                        {new Date(year, month-1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                    </div>
                    <button className="nav-btn" onClick={nextMonth} aria-label="next month">▶</button>
                </div>

                {/* Generate monthly video button */}
                {Object.keys(clipsByDate).length > 0 && (
                    <button
                        className="generate-monthly-btn"
                        onClick={() => navigate(`/monthly-video?month=${year}-${String(month).padStart(2, '0')}`)}
                    >
                        &#127909; Wygeneruj film ({Object.keys(clipsByDate).length} klipow)
                    </button>
                )}

                <div
                    className="tiles-grid-fit"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
                        gridAutoRows: `${tileSize}px`,
                        gap: `${GAP}px`,
                        justifyContent: 'center'
                    }}
                >
                    {gridItems.map(item => {
                        if (item.empty) return <div key={item.key} className="tile tile-placeholder" />;
                        const { day, iso } = item;
                        const clip = clipsByDate[iso];
                        const future = isFuture(year,month,day);
                        const todayFlag = isToday(year,month,day);
                        const pastNoClip = !future && !todayFlag && !clip;

                        return (
                            <button
                                key={item.key}
                                className={`tile ${clip ? 'tile-thumb' : 'tile-empty'} ${future ? 'tile-future' : ''} ${todayFlag ? 'tile-today' : ''} ${pastNoClip ? 'tile-past-empty' : ''}`}
                                onClick={() => onTileClick(item)}
                                type="button"
                                style={{ width: `${tileSize}px`, height: `${tileSize}px` }}
                            >
                                <div className="tile-number">{day}</div>
                                {clip ? (
                                    <>
                                        {clip.thumbnailUrl ? (
                                            <img src={clip.thumbnailUrl} alt={`thumb-${iso}`} className="tile-image" />
                                        ) : (
                                            <div className="tile-has-clip" />
                                        )}
                                        {todayFlag && <div className="tile-replace-indicator">&#8635;</div>}
                                    </>
                                ) : (
                                    <>
                                        {future ? <div className="tile-future-fill" /> : <div className="tile-blank" />}
                                        {todayFlag && <div className="tile-add-indicator">+</div>}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                {loading && <div className="loading-overlay">Ładowanie...</div>}

                {selectedClip && (
                    <div className="modal-backdrop" onClick={closeModal}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                            {selectedClip.videoUrl ? (
                                <video controls autoPlay className="modal-video" src={selectedClip.videoUrl} />
                            ) : selectedClip.thumbnailUrl ? (
                                <img className="modal-image" src={selectedClip.thumbnailUrl} alt="clip" />
                            ) : (
                                <div className="modal-empty">No media</div>
                            )}
                            <div className="modal-meta">
                                <div>Data: {selectedClip.date}</div>
                            </div>
                            <div className="modal-actions">
                                {selectedClip.canReplace && (
                                    <button
                                        className="modal-btn modal-btn-replace"
                                        onClick={handleReplaceClip}
                                        disabled={isDeleting}
                                    >
                                        &#8635; Nagraj nowy
                                    </button>
                                )}
                                <button
                                    className="modal-btn modal-btn-delete"
                                    onClick={handleDeleteClip}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Usuwanie...' : '🗑 Usuń klip'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}