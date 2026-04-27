import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import faceService from '../../services/faceRecognitionService';
import api from '../../services/api';
import { Camera, Check, X, Loader2, UserPlus, Upload, Trash2, Plus, RefreshCcw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaceEnrollment = ({ employee, onComplete, onCancel }) => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isCapturing, setIsCapturing] = useState(true);
    const [facingMode, setFacingMode] = useState('user');
    const webcamRef = useRef(null);

    const captureImage = () => {
        if (webcamRef.current && images.length < 5) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setImages(prev => [...prev, imageSrc]);
            }
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            setMessage({ type: 'error', text: 'Capture at least one photo' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: 'info', text: 'Extracting face features...' });

        try {
            await faceService.initialize();
            const faceDescriptors = [];

            for (const imgData of images) {
                const img = await faceService.faceapi.fetchImage(imgData);
                const detection = await faceService.faceapi
                    .detectSingleFace(img, new faceService.faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    faceDescriptors.push(Array.from(detection.descriptor));
                }
            }

            if (faceDescriptors.length === 0) {
                throw new Error('No faces detected in photos. Ensure good lighting.');
            }

            if (employee._id && !employee._id.startsWith('temp')) {
                await api.post('/attendance/enroll-face', {
                    employeeId: employee._id,
                    faceDescriptors
                });
            }

            setMessage({ type: 'success', text: 'Face enrolled successfully!' });
            setTimeout(() => onComplete(faceDescriptors), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={onCancel}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    title="Go back"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/50 text-indigo-700">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {employee.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold leading-tight">Registration: {employee.name}</h3>
                        <p className="text-[8px] uppercase font-bold tracking-widest opacity-60">5 Angles Required</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 items-center max-w-[280px] sm:max-w-[320px] mx-auto w-full">
                {/* Camera View */}
                <div className="relative aspect-square bg-gray-900 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden group w-full shadow-2xl">
                    {isCapturing ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            videoConstraints={{ facingMode: facingMode, width: 480, height: 480 }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                            <Upload size={40} className="mb-4 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">Camera Off</p>
                        </div>
                    )}

                    <div className="absolute inset-0 border-4 border-dashed border-white/20 rounded-[2rem] pointer-events-none scale-90" />

                    <button
                        onClick={captureImage}
                        disabled={images.length >= 5}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all disabled:opacity-50"
                    >
                        <div className="w-9 h-9 border-4 border-gray-900 rounded-full" />
                    </button>

                    <button
                        onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                        className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-lg backdrop-blur-md hover:bg-black/70 transition-colors z-10"
                        title="Switch Camera"
                    >
                        <RefreshCcw size={16} />
                    </button>

                    <button
                        onClick={() => setIsCapturing(!isCapturing)}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg backdrop-blur-md hover:bg-black/70 transition-colors z-10"
                        title="Toggle Power"
                    >
                        <Camera size={16} />
                    </button>
                </div>

                {/* Gallery View */}
                <div className="w-full space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Gallery ({images.length}/5)</h4>
                        {images.length > 0 && <button onClick={() => setImages([])} className="text-red-500 hover:text-red-600 font-bold text-[9px] uppercase tracking-tighter">Reset</button>}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {images.map((img, i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-sm"
                            >
                                <img src={img} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full shadow-lg"
                                >
                                    <X size={8} />
                                </button>
                            </motion.div>
                        ))}
                        {Array.from({ length: 5 - images.length }).map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                                <Plus size={14} className="opacity-20" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={images.length === 0 || isLoading}
                        className={`w-full py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl ${images.length > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                        {isLoading ? 'Enrolling...' : 'Enroll Face Data'}
                    </button>



                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-3 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-100 text-green-700' :
                                message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaceEnrollment;
