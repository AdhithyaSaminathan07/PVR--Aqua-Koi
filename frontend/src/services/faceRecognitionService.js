import * as faceapi from 'face-api.js';
export { faceapi };
import api from './api';

class FaceRecognitionService {
    constructor() {
        this.faceapi = faceapi;
        this.isModelLoaded = false;
        this.enrolledFaces = new Map();
        this.initPromise = null;
    }

    async initialize(branch = 'Aqua') {
        if (!this.isModelLoaded) {
            await this._loadModels();
        }

        // Always sync if branch changes or first load
        if (this.currentBranch !== branch) {
            this.currentBranch = branch;
            await this._loadEnrolledFaces(branch);
        }

        return true;
    }

    async _loadModels() {
        if (this.isModelLoaded) return;
        try {
            console.log('Loading face-api.js models from /models ...');
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            console.log('✅ TinyFaceDetector loaded');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            console.log('✅ FaceLandmark68Net loaded');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            console.log('✅ FaceRecognitionNet loaded');

            this.isModelLoaded = true;
            window.faceModelsLoaded = true;

            // Speed boost: Load from cache first
            this._loadFromStorage();
        } catch (error) {
            console.error('❌ Error loading face-api.js models:', error);
            window.faceModelsLoaded = false;
            throw error;
        }
    }


    async _loadEnrolledFaces(branch = 'Aqua') {
        try {
            console.log(`Syncing face data for branch: ${branch}...`);
            const response = await api.get(`/attendance/employees-with-face?branch=${branch}`);
            const employees = response.data;

            this.enrolledFaces.clear();
            for (const emp of employees) {
                if (emp.faceEncodings && emp.faceEncodings.length > 0) {
                    const descriptors = emp.faceEncodings.map(enc => new Float32Array(enc));
                    this.enrolledFaces.set(emp._id, descriptors);
                }
            }
            this._saveToStorage();
            console.log(`Face deduction engine ready for ${branch} with ${this.enrolledFaces.size} enrolled workers.`);
        } catch (error) {
            console.error(`Error syncing face data for ${branch}:`, error);
        }
    }

    _saveToStorage() {
        try {
            const data = {};
            for (const [id, descriptors] of this.enrolledFaces.entries()) {
                data[id] = descriptors.map(d => Array.from(d));
            }
            localStorage.setItem('cachedFaceEncodings', JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage limit reached for face cache');
        }
    }

    _loadFromStorage() {
        try {
            const data = localStorage.getItem('cachedFaceEncodings');
            if (data) {
                const parsed = JSON.parse(data);
                for (const [id, descriptors] of Object.entries(parsed)) {
                    this.enrolledFaces.set(id, descriptors.map(d => new Float32Array(d)));
                }
                console.log('Loaded face cache from storage.');
            }
        } catch (e) {
            console.error('Error loading face cache:', e);
        }
    }

    async recognizeFaceFromDataURL(dataURL) {
        if (!this.isModelLoaded) await this.initialize();

        const img = await faceapi.fetchImage(dataURL);
        const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return null;

        let bestMatch = null;
        let bestDistance = 0.5; // High accuracy threshold

        for (const [employeeId, descriptors] of this.enrolledFaces.entries()) {
            for (const enrolledDescriptor of descriptors) {
                const distance = faceapi.euclideanDistance(detection.descriptor, enrolledDescriptor);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = employeeId;
                }
            }
        }

        if (bestMatch) {
            return {
                success: true,
                workerId: bestMatch,
                confidence: 1 - bestDistance,
                descriptor: detection.descriptor
            };
        } else {
            throw new Error('Face not recognized.');
        }
    }
}

export default new FaceRecognitionService();
