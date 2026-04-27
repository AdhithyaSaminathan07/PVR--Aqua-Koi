import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Webcam from 'react-webcam';
import faceService from '../../services/faceRecognitionService';
import { recordRFIDAttendance, getSettings, getEmployeesWithFace } from '../../services/api';
import { Camera, CheckCircle2, Loader2, AlertCircle, MapPin, Navigation, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaceAttendance = ({ onAttendanceRecorded, branch = 'Aqua' }) => {
    const [status, setStatus] = useState('initializing'); // initializing, ready, scanning, success, error
    const [message, setMessage] = useState('FACE ENGINE LOADING...');
    const [workerInfo, setWorkerInfo] = useState(null);
    const [webcamLoaded, setWebcamLoaded] = useState(false);
    const [workerCooldowns, setWorkerCooldowns] = useState({});
    const [autoScanEnabled, setAutoScanEnabled] = useState(true);
    const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'

    // Location related states
    const [settings, setSettings] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [registeredCount, setRegisteredCount] = useState(0);

    const webcamRef = useRef(null);
    const scanIntervalRef = useRef(null);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        setWebcamLoaded(false);
    };

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
    }, []);

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

    const fetchStats = useCallback(async () => {
        try {
            const res = await getEmployeesWithFace(branch);
            setRegisteredCount(res.data?.length || 0);
        } catch (err) {
            console.error('Error fetching face stats:', err);
        }
    }, [branch]);

    useEffect(() => {
        let watchId = null;
        const init = async () => {
            try {
                const settingsRes = await getSettings(branch);
                setSettings(settingsRes.data);

                await fetchStats();
                await faceService.initialize(branch);

                setStatus('ready');
                setMessage('AWAITING FACE DETECTION');

                if (navigator.geolocation) {
                    watchId = navigator.geolocation.watchPosition(
                        checkLocation,
                        (error) => {
                            console.error('Location error:', error);
                        },
                        { enableHighAccuracy: true }
                    );
                }
            } catch (err) {
                setStatus('error');
                setMessage('SYSTEM INITIALIZATION ERROR');
            }
        };
        init();

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        };
    }, [branch, checkLocation, fetchStats]);


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

    const handleScan = useCallback(async () => {
        if (!webcamRef.current || status === 'scanning' || status === 'success') return;

        if (settings?.locationRestriction?.isEnabled && !isWithinRange) {
            setMessage('OUT OF RANGE');
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setStatus('scanning');
        setMessage('DEDUCING IDENTITY...');

        try {
            const result = await faceService.recognizeFaceFromDataURL(imageSrc);

            if (result && result.success) {
                const now = Date.now();
                if (workerCooldowns[result.workerId] && workerCooldowns[result.workerId] > now) {
                    const remaining = Math.ceil((workerCooldowns[result.workerId] - now) / 1000);
                    throw new Error(`WAIT ${remaining}S`);
                }

                const res = await recordRFIDAttendance(result.workerId, branch, currentLocation?.latitude, currentLocation?.longitude);
                setWorkerCooldowns(prev => ({ ...prev, [result.workerId]: now + 120000 }));

                setStatus('success');
                setMessage(`SUCCESS: ${res.data.message.toUpperCase()}`);
                setWorkerInfo({
                    name: res.data.worker,
                    type: res.data.type,
                    checkIn: res.data.attendance.checkIn,
                    checkOut: res.data.attendance.checkOut
                });

                if (onAttendanceRecorded) onAttendanceRecorded();

                setTimeout(() => {
                    setStatus('ready');
                    setMessage('AWAITING FACE DETECTION');
                }, 4000);
            }
        } catch (err) {
            setStatus('ready');
            setMessage(err.message.includes('recognized') ? 'AWAITING FACE DETECTION' : err.message.toUpperCase());

            setTimeout(() => {
                setStatus('ready');
                setMessage('AWAITING FACE DETECTION');
            }, 3000);
        }
    }, [status, workerCooldowns, onAttendanceRecorded, isWithinRange, settings, branch, currentLocation]);

    useEffect(() => {
        if (status === 'ready' && autoScanEnabled && webcamLoaded && isWithinRange) {
            scanIntervalRef.current = setInterval(handleScan, 2000);
        } else {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        }
        return () => {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        };
    }, [status, autoScanEnabled, webcamLoaded, handleScan, isWithinRange]);

    const isSystemError = (status === 'error');

    return (
        <div className="p-6 max-w-lg mx-auto">
            {/* Location Status Badge */}
            <AnimatePresence>
                {settings?.locationRestriction?.isEnabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-3 rounded-xl border text-center ${isWithinRange ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-0.5">
                            {isWithinRange ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            <span className="font-bold text-xs">
                                {isWithinRange ? 'YOU ARE WITHIN THE ALLOWED ATTENDANCE AREA' : 'OUTSIDE ALLOWED ATTENDANCE AREA'}
                            </span>
                        </div>
                        {currentLocation && (
                            <p className="text-[10px] font-medium opacity-80">
                                CURRENT LOCATION: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}(±{Math.round(currentLocation.accuracy)}m)
                            </p>
                        )}
                        {!currentLocation && (
                            <p className="text-[10px] font-medium opacity-80 animate-pulse">DETECTING LOCATION...</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera View */}
            <div className="relative aspect-[4/3] bg-orange-400 rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-4">
                {isWithinRange && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        onUserMedia={() => setWebcamLoaded(true)}
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: facingMode }}
                    />
                )}

                {/* Camera Switch Button */}
                <button
                    onClick={toggleCamera}
                    className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-black/60 transition-all border border-white/20 active:scale-90"
                    title="Switch Camera"
                >
                    <motion.div
                        animate={{ rotate: facingMode === 'user' ? 0 : 180 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <RefreshCw size={20} />
                    </motion.div>
                </button>

                {/* HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-48 h-48 border-2 rounded-full transition-all duration-700 ${status === 'scanning' ? 'border-blue-500 scale-110' : 'border-white/30'}`}>
                        <div className="w-full h-full border-2 border-dashed border-white/20 rounded-full animate-spin-slow" />
                    </div>
                </div>

                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className={`absolute inset-0 ${workerInfo?.type === 'checkin' ? 'bg-green-600/90' : 'bg-red-600/90'} backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center`}
                        >
                            <CheckCircle2 size={48} className="mb-2" />
                            <h3 className="text-xl font-bold uppercase tracking-tight">{workerInfo?.name}</h3>
                            <p className="text-[10px] font-black opacity-80 mt-1 uppercase tracking-[0.2em]">
                                {workerInfo?.type === 'checkin' ? 'PUNCH IN SUCCESSFUL' : 'PUNCH OUT SUCCESSFUL'}
                            </p>
                            <div className="mt-4 space-y-1">
                                <p className="text-sm font-bold">
                                    {workerInfo?.type === 'checkin' ? 'PUNCH IN:' : 'PUNCH OUT:'} {new Date(workerInfo?.type === 'checkin' ? workerInfo?.checkIn : workerInfo?.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {workerInfo?.type === 'checkout' && (
                                    <div className="bg-white/20 px-6 py-3 rounded-2xl mt-4 border border-white/20">
                                        <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Duration Worked</p>
                                        <p className="text-2xl font-mono font-black tracking-wider">
                                            {formatDuration(workerInfo?.checkIn, workerInfo?.checkOut)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-center text-gray-500 text-[10px] font-bold mb-6 uppercase tracking-widest">Position your face within the circular frame</p>

            {/* Error Message Box */}
            <AnimatePresence>
                {isSystemError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6"
                    >
                        <p className="text-red-700 text-sm font-bold uppercase">
                            MODELS NOT LOADED OR SYSTEM ERROR
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Footer */}
            <div className="text-center space-y-2">
                <h4 className="text-xs font-black text-gray-700 mb-1 uppercase tracking-widest">Face Recognition Status</h4>
                <div className="flex items-center justify-center gap-2">
                    {status === 'scanning' ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />}
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{message}</p>
                </div>
                <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.1em]">
                    REGISTERED EMPLOYEES WITH FACE DATA: {registeredCount}
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}} />
        </div>
    );
};

export default FaceAttendance;
