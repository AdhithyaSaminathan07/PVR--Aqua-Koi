import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { recordRFIDAttendance, getSettings } from '../../services/api';
import { CreditCard, CheckCircle2, AlertCircle, XCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RFIDAttendance = ({ onAttendanceRecorded, branch = 'Aqua' }) => {
    const [rfid, setRfid] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [workerInfo, setWorkerInfo] = useState(null);
    const [workerCooldowns, setWorkerCooldowns] = useState({});

    // Location related states
    const [settings, setSettings] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    };

    const checkLocation = useCallback((position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentLocation({ latitude, longitude, accuracy });
        setLocationError(null);
    }, []);

    const formatDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '00:00:00';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.max(0, end - start);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Derived location state
    const locationStatus = useMemo(() => {
        if (!settings?.locationRestriction?.isEnabled) {
            return { distance: 0, isWithinRange: true };
        }
        if (!currentLocation) {
            return { distance: 0, isWithinRange: false };
        }
        const dist = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            settings.locationRestriction.latitude,
            settings.locationRestriction.longitude
        );
        return { distance: dist, isWithinRange: dist <= settings.locationRestriction.radius };
    }, [currentLocation, settings]);

    const { distance, isWithinRange } = locationStatus;

    useEffect(() => {
        let watchId = null;
        const init = async () => {
            try {
                const settingsRes = await getSettings(branch);
                setSettings(settingsRes.data);

                if (navigator.geolocation) {
                    watchId = navigator.geolocation.watchPosition(
                        checkLocation,
                        (error) => {
                            console.error('Location error:', error);
                            let errorMsg = 'LOCATION ERROR';
                            if (error.code === 1) errorMsg = 'LOCATION PERMISSION DENIED';
                            else if (error.code === 2) errorMsg = 'LOCATION UNAVAILABLE';
                            else if (error.code === 3) errorMsg = 'LOCATION TIMEOUT';
                            setLocationError(errorMsg);
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                } else {
                    setLocationError('GEOLOCATION NOT SUPPORTED');
                }
            } catch (err) {
                console.error('Error initializing RFID settings:', err);
            }
        };
        init();
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [branch, checkLocation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedRfid = rfid.trim();
        if (!trimmedRfid) return;

        // Client-side location check
        if (settings?.locationRestriction?.isEnabled && !isWithinRange) {
            setStatus('error');
            setMessage('OUT OF RANGE: PLEASE MOVE TO THE ALLOWED AREA');
            return;
        }

        // Cooldown check (prevent accidental double punch)
        const now = Date.now();
        if (workerCooldowns[trimmedRfid] && workerCooldowns[trimmedRfid] > now) {
            const remaining = Math.ceil((workerCooldowns[trimmedRfid] - now) / 1000);
            setStatus('error');
            setMessage(`PLEASE WAIT ${remaining}S BEFORE NEXT PUNCH`);
            return;
        }

        setStatus('loading');
        try {
            const res = await recordRFIDAttendance(
                trimmedRfid,
                branch,
                currentLocation?.latitude,
                currentLocation?.longitude
            );

            // Set cooldown
            setWorkerCooldowns(prev => ({ ...prev, [trimmedRfid]: now + 30000 })); // 30s cooldown for RFID

            setStatus('success');
            setMessage(res.data.message);
            setWorkerInfo({
                name: res.data.worker,
                type: res.data.type,
                checkIn: res.data.attendance.checkIn,
                checkOut: res.data.attendance.checkOut
            });
            setRfid('');

            if (onAttendanceRecorded) onAttendanceRecorded();

            // Reset after 4 seconds to allow reading duration
            setTimeout(() => {
                setStatus('idle');
                setWorkerInfo(null);
            }, 4000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Error recording attendance');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <div className="p-6">
            {/* Location Status Badge */}
            <AnimatePresence>
                {settings?.locationRestriction?.isEnabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-2xl border text-center transition-colors ${locationError ? 'bg-orange-50 border-orange-100 text-orange-700' : isWithinRange ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {locationError ? <AlertCircle size={16} className="text-orange-600" /> : isWithinRange ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            <span className="font-bold text-xs uppercase tracking-wider">
                                {locationError ? locationError : isWithinRange ? 'Area Verified' : 'Outside Attendance Area'}
                            </span>
                        </div>
                        {locationError && (
                            <p className="text-[10px] font-medium opacity-70">
                                PLEASE ENSURE GPS IS ENABLED AND PERMISSION IS GRANTED
                            </p>
                        )}
                        {!locationError && currentLocation && (
                            <p className="text-[10px] font-medium opacity-70">
                                {isWithinRange ? 'Your location is within the registered branch coordinates' : `You are ${Math.round(distance - settings.locationRestriction.radius)}m away from the allowed area`}
                            </p>
                        )}
                        {!locationError && !currentLocation && (
                            <p className="text-[10px] font-medium opacity-70 animate-pulse">Detecting your location...</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">RFID Authorization</h3>
                    <p className="text-xs text-gray-500 font-medium">Scan your identification card to proceed</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <input
                        type="text"
                        value={rfid}
                        onChange={(e) => setRfid(e.target.value)}
                        placeholder="TAP CARD OR ENTER RFID ID..."
                        autoFocus
                        disabled={status === 'loading'}
                        className={`w-full pl-6 pr-12 py-4 bg-gray-50 border-2 rounded-[1.5rem] outline-none transition-all font-mono tracking-[0.2em] text-center text-lg ${status === 'error' ? 'border-red-100 text-red-600' : 'border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5'}`}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {status === 'loading' ? (
                            <Loader2 className="animate-spin text-blue-500" size={20} />
                        ) : (
                            <Navigation size={20} className={isWithinRange ? 'text-green-500' : 'text-red-400'} />
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading' || !rfid.trim() || (settings?.locationRestriction?.isEnabled && !isWithinRange)}
                    className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none group flex items-center justify-center gap-2"
                >
                    {status === 'loading' ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                </button>
            </form>

            <div className="mt-8">
                <AnimatePresence mode="wait">
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-6 ${workerInfo?.type === 'checkin' ? 'bg-green-600' : 'bg-red-600'} text-white rounded-[2rem] shadow-xl shadow-gray-200`}
                        >
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-black uppercase tracking-tight leading-tight mb-1">{workerInfo?.name}</h4>
                                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] mb-4">
                                        {workerInfo?.type === 'checkin' ? 'PUNCH IN SUCCESSFUL' : 'PUNCH OUT SUCCESSFUL'}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between bg-black/10 px-4 py-2 rounded-xl">
                                            <span className="text-[10px] font-bold opacity-60 uppercase">Time</span>
                                            <span className="text-xs font-black">
                                                {new Date(workerInfo?.type === 'checkin' ? workerInfo?.checkIn : workerInfo?.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {workerInfo?.type === 'checkout' && (
                                            <div className="bg-white/20 p-4 rounded-xl border border-white/10">
                                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1 text-center">Work Duration</p>
                                                <p className="text-xl font-mono font-black tracking-widest text-center">
                                                    {formatDuration(workerInfo?.checkIn, workerInfo?.checkOut)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 bg-red-50 border border-red-100 rounded-[1.5rem]"
                        >
                            <div className="flex items-start gap-3 text-red-700">
                                <XCircle className="shrink-0 mt-0.5" size={20} />
                                <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">{message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!status || status === 'idle' && (
                <div className="mt-8 p-5 bg-gray-50/50 rounded-[1.5rem] border border-dashed border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin size={12} className="text-gray-400" />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Protocol</h4>
                    </div>
                    <ul className="text-[11px] text-gray-500 space-y-2 font-medium">
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            GPS position must be enabled for identity verification.
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            Identity cards are branch-locked and cannot be reused elsewhere.
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default RFIDAttendance;
