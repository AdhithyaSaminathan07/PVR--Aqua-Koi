import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Navigation,
    LocateFixed,
    ShieldCheck,
    ShieldAlert,
    Info,
    Save,
    Camera,
    UserCheck,
    Loader2
} from 'lucide-react';
import { getSettings, updateSettings, getEmployeesWithFace } from '../../services/api';

// Simple notification replacement since react-hot-toast isn't installed
const notify = {
    success: (msg) => console.log('SUCCESS:', msg),
    error: (msg) => alert('ERROR: ' + msg)
};

const Settings = ({ type = 'Aqua' }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState({
        locationRestriction: {
            isEnabled: false,
            latitude: 10.7828199,
            longitude: 79.1160742,
            radius: 150
        }
    });

    const [faceStats, setFaceStats] = useState({
        registeredCount: 0,
        modelsLoaded: false
    });

    useEffect(() => {
        fetchSettings();
        fetchFaceStats();
    }, [type]);

    const fetchSettings = async () => {
        try {
            const res = await getSettings(type);
            if (res.data) {
                setSettings(res.data);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            notify.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchFaceStats = async () => {
        try {
            const res = await getEmployeesWithFace(type);
            setFaceStats({
                registeredCount: res.data?.length || 0,
                modelsLoaded: window.faceModelsLoaded || false
            });
        } catch (err) {
            console.error('Error fetching face stats:', err);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSettings(settings, type);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error updating settings:', err);
            notify.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const captureLocation = () => {
        if (!navigator.geolocation) {
            notify.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setSettings({
                    ...settings,
                    locationRestriction: {
                        ...settings.locationRestriction,
                        latitude: parseFloat(latitude.toFixed(7)),
                        longitude: parseFloat(longitude.toFixed(7))
                    }
                });
                console.log('Location captured:', latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                notify.error('Failed to capture location');
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 relative">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-8 right-8 bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl shadow-emerald-900/20 z-[100] flex items-center gap-3 border border-emerald-400/20 backdrop-blur-xl"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black uppercase text-[10px] tracking-widest text-emerald-100 leading-none mb-1">Success</span>
                            <span className="font-bold text-sm tracking-tight">Settings Saved Properly</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {type} <span className="text-blue-600 uppercase">Settings</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-widest">Configure location boundaries and system parameters</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`
                        flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                        ${saving
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20'}
                    `}
                >
                    {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {saving ? 'Updating...' : 'Update Settings'}
                </button>
            </header>

            {/* Location Settings Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden"
            >
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                            <MapPin size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 uppercase">Location Settings</h2>
                    </div>

                    {/* Enable Toggle */}
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] flex items-center justify-between border border-gray-100">
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900 uppercase text-sm">Enable Location Restriction</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Restrict attendance marking to a specific location</p>
                        </div>
                        <button
                            onClick={() => setSettings({
                                ...settings,
                                locationRestriction: {
                                    ...settings.locationRestriction,
                                    isEnabled: !settings.locationRestriction.isEnabled
                                }
                            })}
                            className={`w-14 h-8 rounded-full transition-all duration-500 relative ${settings.locationRestriction.isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${settings.locationRestriction.isEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Lat/Lng Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Latitude</label>
                            <div className="relative group">
                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="number"
                                    step="0.0000001"
                                    value={settings.locationRestriction.latitude}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        locationRestriction: {
                                            ...settings.locationRestriction,
                                            latitude: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full bg-gray-50/50 border border-transparent focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Longitude</label>
                            <div className="relative group">
                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors rotate-90" size={18} />
                                <input
                                    type="number"
                                    step="0.0000001"
                                    value={settings.locationRestriction.longitude}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        locationRestriction: {
                                            ...settings.locationRestriction,
                                            longitude: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full bg-gray-50/50 border border-transparent focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Radius (meters)</label>
                        <div className="relative group">
                            <LocateFixed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="number"
                                value={settings.locationRestriction.radius}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    locationRestriction: {
                                        ...settings.locationRestriction,
                                        radius: parseInt(e.target.value)
                                    }
                                })}
                                className="w-full bg-gray-50/50 border border-transparent focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold ml-4 uppercase tracking-wider">Workers must be within this radius to mark attendance (10-1000 meters)</p>
                    </div>

                    <button
                        onClick={captureLocation}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all group"
                    >
                        <LocateFixed size={18} className="group-active:scale-95 transition-transform" />
                        Capture Current Location
                    </button>

                    <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100/50">
                        <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-wide">
                            <span className="font-black">Tip:</span> Enable location restriction to ensure workers can only mark attendance when they are physically present at the designated location.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Face Recognition Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden"
            >
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                            <Camera size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 uppercase">Face Recognition Status</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 rounded-[2rem] border ${faceStats.modelsLoaded ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} transition-colors`}>
                            <div className="flex items-center gap-3">
                                {faceStats.modelsLoaded ? (
                                    <ShieldCheck className="text-emerald-600" size={24} />
                                ) : (
                                    <ShieldAlert className="text-rose-600" size={24} />
                                )}
                                <div>
                                    <p className="font-bold text-gray-900 uppercase text-xs">AI Models</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${faceStats.modelsLoaded ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {faceStats.modelsLoaded ? 'Loaded & Active' : 'Not Loaded'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <UserCheck className="text-indigo-600" size={24} />
                                <div>
                                    <p className="font-bold text-gray-900 uppercase text-xs">Enrolled Staff</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                        {faceStats.registeredCount} Registered Faces
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Settings;
