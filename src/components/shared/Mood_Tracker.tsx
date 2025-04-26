"use client";
import React, { useState, useEffect } from 'react';
import sparkle from '../../../assets/icons/sparkle.svg';
import { MoodIcons } from '../../lib/MoodIcons';
import { FormIcons } from '../../lib/FormIcons';
import { useRouter } from 'next/navigation';
import { illustrations } from '../../lib/Illustrations';
import Recommendation from './Recommendation';
import LoadingMood from './LoadingMood';
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

interface MoodTrackerProps {
    userId: string;
}
interface MoodData {
    day_rating: string;
    water_intake: string;
    people_met: string;
    exercise: string;
    sleepHours?: string;
    sleepMinutes?: string;
    screenHours?: string;
    screenMinutes?: string;
    outdoorHours?: string;
    outdoorMinutes?: string;
    stress_level: string;
    food_quality: string;
}
interface Recommendations {
    priority: string;
    recommendation: string;
    category: string;
}

const Mood_Tracker = ({ userId }: MoodTrackerProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [score, setScore] = useState(9.4);
    const [showAnimation, setShowAnimation] = useState(false);
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<Recommendations[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [numericFields] = useState<string[]>([
        'water_intake', 'people_met', 'exercise'
    ]);
    const [valueError, setValueError] = useState<Array<{
        type: string;
        loc: string[];
        msg: string;
        input?: any;
        ctx?: any;
    }>>([]);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const [pageLoaded, setPageLoaded] = useState(false);

    // Initial page load animation setup
    const pageAnimation = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.8, 
                ease: "easeOut" 
            } 
        }
    };

    // Animation variants for step 4 (results)
    const resultsVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };
    
    const resultItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };
    
    // Gauge animation variants
    const gaugeVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
                duration: 0.7,
                ease: "easeOut",
                delay: 0.2
            }
        }
    };

    // Handle mounting for theme detection
    useEffect(() => {
        setMounted(true);
    }, []);

    // Effect for initial page load animation only
    useEffect(() => {
        setPageLoaded(true);
        // This effect runs only on component mount, not on subsequent re-renders
    }, []);

    const isDarkMode = mounted && resolvedTheme === 'dark';

    const [moodData, setMoodData] = useState<MoodData>({
        day_rating: '',
        water_intake: '',
        people_met: '',
        exercise: '',
        sleepHours: '',
        sleepMinutes: '',
        screenHours: '',
        screenMinutes: '',
        outdoorHours: '',
        outdoorMinutes: '',
        stress_level: 'Medium',
        food_quality: 'Moderate'
    });

    useEffect(()=>{
        // checking if mood already exists for the day
        const fetchMoodDetails = async () => {
          try{
            const response = await fetch(`/api/mood-track/get?userId=${userId}`);
            const responseData = await response.json();
            console.log('Mood details:', responseData.data);
            if (!response.ok) {
                console.error('Error fetching mood details:', responseData.error);
                return;
            }
            if (responseData.error) {
                console.error('Error fetching mood details:', responseData.error);
                return;
            }
            if (responseData.data) {
                const moodDetails = responseData.data;                
                    setMoodData(moodDetails.moodInput);
                    setScore(moodDetails.score);
                    setRecommendations(moodDetails.reccommendations);
                    setCurrentStep(totalSteps); // Skip to results step
            }
          }
            catch (error) {
                console.error('Error fetching mood details:', error);
            }
        }
        fetchMoodDetails();
    },[]) 

    // Step transition without animation
    useEffect(() => {
        // Just reset window position when switching steps
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });
    }, [currentStep]);

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Clear previous errors
        setErrors({});

        if (step === 1) {
            if (!moodData.day_rating.trim()) {
                newErrors.day_rating = "Please tell us about your day";
                isValid = false;
            }
            
            if (!moodData.water_intake.trim()) {
                newErrors.water_intake = "Please enter your water intake";
                isValid = false;
            } else if (!/^\d*\.?\d*$/.test(moodData.water_intake)) {
                newErrors.water_intake = "Please enter a valid number";
                isValid = false;
            }
            
            if (!moodData.people_met.trim()) {
                newErrors.people_met = "Please enter number of people met";
                isValid = false;
            } else if (!/^\d+$/.test(moodData.people_met)) {
                newErrors.people_met = "Please enter a valid number";
                isValid = false;
            }
            
            if (!moodData.exercise.trim()) {
                newErrors.exercise = "Please enter your exercise duration";
                isValid = false;
            } else if (!/^\d+$/.test(moodData.exercise)) {
                newErrors.exercise = "Please enter a valid number";
                isValid = false;
            }
        } else if (step === 2) {
            if (!moodData.sleepHours?.trim() && !moodData.sleepMinutes?.trim()) {
                newErrors.sleep = "Please enter your sleep duration";
                isValid = false;
            } else if (
                (moodData.sleepHours && !/^\d+$/.test(moodData.sleepHours)) ||
                (moodData.sleepMinutes && !/^\d+$/.test(moodData.sleepMinutes))
            ) {
                newErrors.sleep = "Please enter valid numbers for hours and minutes";
                isValid = false;
            }
            
            if (!moodData.screenHours?.trim() && !moodData.screenMinutes?.trim()) {
                newErrors.screen_time = "Please enter your screen time";
                isValid = false;
            } else if (
                (moodData.screenHours && !/^\d+$/.test(moodData.screenHours)) ||
                (moodData.screenMinutes && !/^\d+$/.test(moodData.screenMinutes))
            ) {
                newErrors.screen_time = "Please enter valid numbers for hours and minutes";
                isValid = false;
            }
            
            if (!moodData.outdoorHours?.trim() && !moodData.outdoorMinutes?.trim()) {
                newErrors.outdoor_time = "Please enter your outdoor time";
                isValid = false;
            } else if (
                (moodData.outdoorHours && !/^\d+$/.test(moodData.outdoorHours)) ||
                (moodData.outdoorMinutes && !/^\d+$/.test(moodData.outdoorMinutes))
            ) {
                newErrors.outdoor_time = "Please enter valid numbers for hours and minutes";
                isValid = false;
            }
        }
        // Step 3 already has default values, so no validation needed

        if (!isValid) {
            setErrors(newErrors);
        }
        return isValid;
    };

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            if (validateStep(currentStep)) {
                setCurrentStep(currentStep + 1);
            } else {
                // Scroll to the first error
                const firstErrorEl = document.querySelector('.error-message');
                if (firstErrorEl) {
                    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } else {
            if (validateStep(currentStep)) {
                setIsLoading(true);
                calculateScore();
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            if(currentStep===3){
                setValueError([]);
            }
            setCurrentStep(currentStep - 1);
        }
    };

    const calculateScore = async () => {
        // Create a new object with parsed numeric values
        const parsedData = {
            day_rating: moodData.day_rating,
            water_intake: parseFloat(moodData.water_intake) || 0,
            people_met: parseInt(moodData.people_met) || 0,
            exercise: parseInt(moodData.exercise) || 0,
            sleep: (parseInt(moodData.sleepHours || '0') || 0) + (parseInt(moodData.sleepMinutes || '0') || 0) / 60,
            screen_time: (parseInt(moodData.screenHours || '0') || 0) + (parseInt(moodData.screenMinutes || '0') || 0) / 60,
            outdoor_time: (parseInt(moodData.outdoorHours || '0') || 0) + (parseInt(moodData.outdoorMinutes || '0') || 0) / 60,
            stress_level: moodData.stress_level,
            food_quality: moodData.food_quality
        };

        // Record the start time to ensure minimum loading time
        const startTime = Date.now();

        try {
            const response = await fetch('https://mood-tracker-ee73.onrender.com/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parsedData)
            });

            const data = await response.json();
            console.log('API response:', data);

            if (!response.ok) {
                // Handle validation errors from the API properly
                if (data.detail && Array.isArray(data.detail)) {
                    // Calculate elapsed time and wait if needed
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime < 2000) {
                        await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
                    }
                    
                    setValueError(data.detail);
                    setIsLoading(false);
                    return;
                } else {
                    throw new Error(`API request failed with status ${response.status}`);
                }
            }
            
            // Clear any previous errors
            setValueError([]);
            
            if (data.error) {
                console.error('Error fetching score:', data.error);
                setIsLoading(false);
                return;
            }
            
            // Use the score from the API response or fallback to current score
            if (data.mood_score !== undefined) {
                setScore(parseFloat(data.mood_score));
            }

            if (data.recommendations) {
                setRecommendations(data.recommendations);
            }

            // Calculate elapsed time and wait if needed to ensure minimum 2 seconds of loading
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
            }

            setCurrentStep(currentStep + 1);
            setIsLoading(false);

            // add the mood data to the database
            const moodDetailsRequest = {
                userId,
                moodDetails: {
                    score: parseFloat(data.mood_score),
                    moodInput: parsedData,
                    reccommendations: data.recommendations,
                }
            };
            console.log('Mood data:', moodDetailsRequest.moodDetails.reccommendations);
            const moodDetailsResponse = await fetch('/api/mood-track/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(moodDetailsRequest)
            });
            const moodDetailsData = await moodDetailsResponse.json();

            if (!moodDetailsResponse.ok) {
                console.error('Error adding mood details:', moodDetailsData);
                return;
            }
            if (moodDetailsData.error) {
                console.error('Error adding mood details:', moodDetailsData.error);
                return;
            }

            // Send notification with mood score and recommendations
            try {
                const notificationResponse = await fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId,
                        score: parseFloat(data.mood_score),
                        recommendations: data.recommendations
                    })
                });
                
                const notificationResult = await notificationResponse.json();
                console.log('Notification result:', notificationResult);
            } catch (notificationError) {
                console.error('Error sending notification:', notificationError);
                // Continue even if notification fails
            }

        } catch (error) {
            // For errors, also ensure minimum loading time
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000 - elapsedTime));
            }
            
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // For numeric fields, only allow digits and decimal point
        if (numericFields.includes(name)) {
            let newValue = value;
            
            // For people met and exercise, only allow integers
            if (name === 'people_met' || name === 'exercise') {
                newValue = value.replace(/[^\d]/g, '');
            } else {
                // For other numeric fields, allow decimals
                newValue = value.replace(/[^\d.]/g, '');
                
                // Ensure only one decimal point
                const parts = newValue.split('.');
                if (parts.length > 2) {
                    newValue = parts[0] + '.' + parts.slice(1).join('');
                }
            }
            
            setMoodData({
                ...moodData,
                [name]: newValue
            });
        } else {
            setMoodData({
                ...moodData,
                [name]: value
            });
        }
        
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = value.replace(/[^\d]/g, ''); // Only allow digits
        setMoodData({
            ...moodData,
            [name]: sanitizedValue
        });

        // Clear error for sleep when user types
        if (errors.sleep) {
            setErrors({
                ...errors,
                sleep: ''
            });
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = value.replace(/[^\d]/g, ''); // Only allow digits
        setMoodData({
            ...moodData,
            [name]: sanitizedValue
        });

        // Clear error for screen time or outdoor time when user types
        if (errors.screen_time || errors.outdoor_time) {
            setErrors({
                ...errors,
                screen_time: '',
                outdoor_time: ''
            });
        }
    };

    // Enhanced score color function with more vibrant colors
    const getScoreColor = () => {
        if (score <= 3) return 'text-rose-500';
        if (score <= 7) return 'text-amber-500';
        return 'text-emerald-500';
    };

    // Get gauge gradient colors based on score
    const getGaugeGradient = () => {
        if (score <= 3) {
            return {
                start: '#FECDD3', // Light rose
                middle: '#FB7185', // Mid rose
                end: '#E11D48'    // Deep rose
            };
        } else if (score <= 7) {
            return {
                start: '#FED7AA', // Light amber
                middle: '#FBBF24', // Mid amber
                end: '#D97706'    // Deep amber
            };
        } else {
            return {
                start: '#A7F3D0', // Light emerald
                middle: '#34D399', // Mid emerald
                end: '#059669'    // Deep emerald
            };
        }
    };

    const getRecommendations = () => {
        return recommendations;
    };

    return (
        <motion.div
            className='flex min-h-screen flex-col w-full p-4 items-center justify-center overflow-hidden relative'
            initial="hidden"
            animate="visible"
            variants={pageAnimation}
        >
            {/* Animated blob backgrounds matching the sign-in page */}
            <div 
                className={`absolute rounded-full filter blur-[60px] opacity-60 ${
                isDarkMode 
                    ? 'bg-blue-500/20 top-1/4 left-1/4 w-80 h-80' 
                    : 'bg-pink-500/30 top-1/4 left-1/4 w-80 h-80'
                }`}
            ></div>
            <div 
                className={`absolute rounded-full filter blur-[60px] opacity-60 ${
                isDarkMode 
                    ? 'bg-indigo-500/20 top-1/3 right-1/3 w-96 h-96' 
                    : 'bg-indigo-500/30 top-1/3 right-1/3 w-96 h-96'
                }`}
            ></div>
            <div 
                className={`absolute rounded-full filter blur-[60px] opacity-60 ${
                isDarkMode 
                    ? 'bg-purple-500/20 bottom-1/4 right-1/4 w-72 h-72' 
                    : 'bg-purple-500/30 bottom-1/4 right-1/4 w-72 h-72'
                }`}
            ></div>

            {isLoading ? (
                <LoadingMood/>
            ) : (
                <div
                    className={`relative z-10 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl mx-6 backdrop-blur-md bg-opacity-80 dark:bg-opacity-30 border border-white/10`}
                >
                    <div className="flex justify-center mb-6">
                        <div className={`relative text-3xl font-extrabold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} tracking-wider flex items-center`}>
                            <span className="relative z-10">
                                Track Your Mood
                                <span className={`${isDarkMode ? 'text-pink-300' : 'text-pink-500'}`}>.</span>
                            </span>
                            <img src={sparkle.src} alt="sparkle" className='ml-3 w-8 h-8 inline' />
                            <div className={`absolute -bottom-1 left-0 h-1 w-full ${isDarkMode ? 'bg-purple-500' : 'bg-indigo-400'}`}></div>
                        </div>
                    </div>

                    <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Record your daily habits to get personalized wellness insights</p>
                    
                    {/* Progress Steps */}
                    <div className="flex justify-between w-full max-w-md mx-auto mb-8">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex flex-col items-center">
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                                        currentStep >= step 
                                            ? isDarkMode 
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white' 
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                            : isDarkMode 
                                                ? 'bg-gray-700 text-gray-400' 
                                                : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step}
                                </div>
                                <div className={`text-xs md:text-sm transition-all duration-500 ${
                                    currentStep >= step 
                                        ? isDarkMode ? 'text-purple-300 font-medium' : 'text-indigo-600 font-medium' 
                                        : isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                }`}>
                                    {step === 1 ? 'Activities' : 
                                     step === 2 ? 'Lifestyle' : 
                                     step === 3 ? 'Wellness' : 'Results'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-2xl mx-auto mb-8">
                        <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                            <div
                                className={`${
                                    isDarkMode 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700' 
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                                } h-2.5 rounded-full transition-all duration-500`}
                                style={{ width: `${(currentStep/totalSteps) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className={`relative overflow-hidden ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {/* Step 1: Daily Activities */}
                        {currentStep === 1 && (
                            <div 
                                className="flex flex-col space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Your Daily Activities</h2>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Tell us about your day's activities</p>
                                    {illustrations.step1}
                                </div>
                                
                                <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                                    <label htmlFor="day_rating" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                        How was your day today? <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                        <input
                                            type="text"
                                            id="day_rating"
                                            name="day_rating"
                                            className={`block w-full px-4 py-2.5 border ${
                                                isDarkMode ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                                            placeholder="Tell us how your day was in a few words"
                                            value={moodData.day_rating}
                                            onChange={handleInputChange}
                                        />
                                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-focus-within:w-full transition-all duration-500"></div>
                                    </div>
                                    {errors.day_rating && (
                                        <p 
                                            className="text-red-500 text-xs mt-1 error-message"
                                        >
                                            {errors.day_rating}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} flex-1`}>
                                        <label htmlFor="water_intake" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                            Water Intake <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                id="water_intake"
                                                name="water_intake"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                        : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                } transition-all duration-300`}
                                                placeholder="Liters"
                                                value={moodData.water_intake}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                                {FormIcons.water}
                                            </span>
                                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 group-focus-within:w-full transition-all duration-500"></div>
                                        </div>
                                        {errors.water_intake && (
                                            <p 
                                                className="text-red-500 text-xs mt-1 error-message"
                                            >
                                                {errors.water_intake}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} flex-1`}>
                                        <label htmlFor="people_met" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                            Social Interactions <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                id="people_met"
                                                name="people_met"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                        : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                } transition-all duration-300`}
                                                placeholder="People met"
                                                value={moodData.people_met}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500">
                                                {FormIcons.people}
                                            </span>
                                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-focus-within:w-full transition-all duration-500"></div>
                                        </div>
                                        {errors.people_met && (
                                            <p 
                                                className="text-red-500 text-xs mt-1 error-message"
                                            >
                                                {errors.people_met}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                                    <label htmlFor="exercise" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                        Physical Activity <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`relative group ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id="exercise"
                                            name="exercise"
                                            className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                    : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                            } transition-all duration-300`}
                                            placeholder="Minutes of exercise"
                                            value={moodData.exercise}
                                            onChange={handleInputChange}
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                            {FormIcons.exercise}
                                        </span>
                                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-green-500 to-emerald-500 group-focus-within:w-full transition-all duration-500"></div>
                                    </div>
                                    {errors.exercise && (
                                        <p 
                                            className="text-red-500 text-xs mt-1 error-message"
                                        >
                                            {errors.exercise}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Lifestyle Metrics */}
                        {currentStep === 2 && (
                            <div 
                                className="flex flex-col space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Your Lifestyle Habits</h2>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Let's learn about your daily routines</p>
                                    {illustrations.step2}
                                </div>
                                
                                <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                                    <label htmlFor="sleep" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                        Sleep Duration <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex space-x-2">
                                        <div className={`relative group flex-1 ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                id="sleepHours"
                                                name="sleepHours"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                        : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                } transition-all duration-300`}
                                                placeholder="Hours"
                                                value={moodData.sleepHours || ''}
                                                onChange={handleSleepChange}
                                            />
                                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-purple-500 group-focus-within:w-full transition-all duration-500"></div>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">hrs</div>
                                        </div>
                                        
                                        <div className={`relative group flex-1 ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                id="sleepMinutes"
                                                name="sleepMinutes"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                        : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                } transition-all duration-300`}
                                                placeholder="Minutes"
                                                value={moodData.sleepMinutes || ''}
                                                onChange={handleSleepChange}
                                            />
                                            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-purple-500 group-focus-within:w-full transition-all duration-500"></div>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">min</div>
                                        </div>
                                    </div>
                                    {errors.sleep && (
                                        <p 
                                            className="text-red-500 text-xs mt-1 error-message"
                                        >
                                            {errors.sleep}
                                        </p>
                                    )}
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>7-9 hours is recommended for adults</p>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} flex-1`}>
                                        <label htmlFor="screen_time" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                            Screen Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <div className={`relative group flex-1 ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    id="screenHours"
                                                    name="screenHours"
                                                    className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                            : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                    } transition-all duration-300`}
                                                    placeholder="Hours"
                                                    value={moodData.screenHours || ''}
                                                    onChange={handleTimeChange}
                                                />
                                                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 group-focus-within:w-full transition-all duration-500"></div>
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">hrs</div>
                                            </div>
                                            
                                            <div className={`relative group flex-1 ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    id="screenMinutes"
                                                    name="screenMinutes"
                                                    className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                            : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                    } transition-all duration-300`}
                                                    placeholder="Minutes"
                                                    value={moodData.screenMinutes || ''}
                                                    onChange={handleTimeChange}
                                                />
                                                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 group-focus-within:w-full transition-all duration-500"></div>
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">min</div>
                                            </div>
                                        </div>
                                        {errors.screen_time && (
                                            <p className="text-red-500 text-xs mt-1 error-message">
                                                {errors.screen_time}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} flex-1`}>
                                        <label htmlFor="outdoor_time" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                            Outdoor Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <div className={`relative group flex-1 ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    id="outdoorHours"
                                                    name="outdoorHours"
                                                    className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                            : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                    } transition-all duration-300`}
                                                    placeholder="Hours"
                                                    value={moodData.outdoorHours || ''}
                                                    onChange={handleTimeChange}
                                                />
                                                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-green-500 to-emerald-500 group-focus-within:w-full transition-all duration-500"></div>
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">hrs</div>
                                            </div>
                                            
                                            <div className={`relative group flex-1 ${isDarkMode ? 'focus-within:ring-purple-500' : 'focus-within:ring-indigo-500'}`}>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    id="outdoorMinutes"
                                                    name="outdoorMinutes"
                                                    className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${
                                                        isDarkMode 
                                                            ? 'bg-gray-800 border-gray-600 focus:border-purple-400 text-white' 
                                                            : 'bg-white/90 border-gray-300 focus:border-indigo-400 text-gray-900'
                                                    } transition-all duration-300`}
                                                    placeholder="Minutes"
                                                    value={moodData.outdoorMinutes || ''}
                                                    onChange={handleTimeChange}
                                                />
                                                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-green-500 to-emerald-500 group-focus-within:w-full transition-all duration-500"></div>
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">min</div>
                                            </div>
                                        </div>
                                        {errors.outdoor_time && (
                                            <p 
                                                className="text-red-500 text-xs mt-1 error-message"
                                            >
                                                {errors.outdoor_time}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Stress & Nutrition */}
                        {currentStep === 3 && (
                            <div 
                                className="flex flex-col space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Wellness Check</h2>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Let us know about your stress and nutrition</p>
                                    {illustrations.step3}
                                </div>
                                
                                <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                                    <label htmlFor="stress_level" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 flex items-center`}>
                                        <span className="mr-2 text-purple-500">{FormIcons.stress}</span> Stress Level
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                        {['Low', 'Medium', 'High'].map(level => (
                                            <button
                                                key={level}
                                                type="button"
                                                className={`py-2 px-4 rounded-lg transition-all ${
                                                    moodData.stress_level === level 
                                                        ? isDarkMode
                                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white' 
                                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                                                        : isDarkMode
                                                            ? 'bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white'
                                                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-800'
                                                }`}
                                                onClick={() => setMoodData({...moodData, stress_level: level})}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>How would you rate your stress today?</p>
                                </div>
                                
                                <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-5 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                                    <label htmlFor="food_quality" className={`block text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 flex items-center`}>
                                        <span className="mr-2 text-red-500">{FormIcons.food}</span> Food Quality
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                        {['Healthy', 'Moderate', 'Unhealthy'].map(quality => (
                                            <button
                                                key={quality}
                                                type="button"
                                                className={`py-2 px-4 rounded-lg transition-all ${
                                                    moodData.food_quality === quality 
                                                        ? isDarkMode
                                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white' 
                                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                                                        : isDarkMode
                                                            ? 'bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white'
                                                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-800'
                                                }`}
                                                onClick={() => setMoodData({...moodData, food_quality: quality})}
                                            >
                                                {quality}
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>How would you describe your food choices today?</p>
                                </div>
                                
                                {valueError.length > 0 && (
                                    <div 
                                        className={`${isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-100'} p-5 rounded-lg border mt-4`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                {valueError.map((error, index) => (
                                                    <div key={index} className="mb-2 gap-x-1 flex items-center last:mb-0">
                                                        <span className="text-red-500 mr-3">{FormIcons.error}</span>
                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                                                            {error.loc[1].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                        </span>
                                                        <span className={`text-sm sm:hidden ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{' value seems '+error.msg.split(' ')[5]}</span>   
                                                        <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'} hidden sm:block`}>{error.msg}</span>   
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className={`${isDarkMode ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} p-5 rounded-lg border mt-4`}>
                                    <div className="flex items-start">
                                        <div className="text-indigo-500 mr-3">{FormIcons.sparkle}</div>
                                        <div>
                                            <h4 className={`sm:text-lg text-sm font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>Almost there!</h4>
                                            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'} mt-1`}>
                                                In the next step, we'll analyze your data and provide personalized wellness recommendations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Results & Recommendations */}
                        {currentStep === 4 && !isLoading && (
                            <motion.div 
                                className="flex flex-col"
                                initial="hidden"
                                animate="visible"
                                variants={resultsVariants}
                            >
                                <motion.div className="text-center mb-6" variants={resultItemVariants}>
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Your Wellness Analysis</h2>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Based on your daily habits and activities</p>
                                </motion.div>
                                
                                <motion.div className="flex flex-col items-center justify-center mb-8" variants={resultItemVariants}>
                                    <motion.div className="relative w-64 h-48 mb-4" variants={gaugeVariants}>
                                        <div className="absolute inset-0">
                                            <svg className="w-full h-full" viewBox="0 0 200 120">
                                                <defs>
                                                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor={getGaugeGradient().start} />
                                                        <stop offset="50%" stopColor={getGaugeGradient().middle} />
                                                        <stop offset="100%" stopColor={getGaugeGradient().end} />
                                                    </linearGradient>
                                                </defs>
                                                
                                                <filter id="trackShadow" x="-10%" y="-10%" width="120%" height="120%">
                                                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.1" />
                                                </filter>
                                                <path
                                                    d="M20 100 A 80 80 0 0 1 180 100"
                                                    fill="none"
                                                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                                                    strokeWidth="12"
                                                    strokeLinecap="round"
                                                    filter="url(#trackShadow)"
                                                />
                                                
                                                <path
                                                    d="M20 100 A 80 80 0 0 1 180 100"
                                                    fill="none"
                                                    stroke="url(#gaugeGradient)"
                                                    strokeWidth="12"
                                                    strokeLinecap="round"
                                                    strokeDasharray="251.2"
                                                    strokeDashoffset={251.2 - (score/10) * 251.2}
                                                />
                                                
                                                
                                                <circle 
                                                    cx={100 + 80 * Math.cos((-180 + (score/10) * 180) * Math.PI / 180)}
                                                    cy={100 + 80 * Math.sin((-180 + (score/10) * 180) * Math.PI / 180)}
                                                    r="6" 
                                                    fill={getGaugeGradient().end}
                                                />
                                            </svg>
                                        </div>
                                        
                                        {/* Digital Score Display */}
                                        <div className="absolute bottom-4 left-0 right-0 text-center">
                                            <div className={`text-5xl font-bold ${getScoreColor()}`}>
                                                {score.toFixed(1)}
                                            </div>
                                            <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-sm mt-1`}>Your Mood Score</div>
                                        </div>
                                    </motion.div>
                                    
                                    {/* Score Interpretation Card with enhanced styling */}
                                    <motion.div 
                                        className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white'} p-5 rounded-xl border ${
                                            isDarkMode ? 'border-gray-700' : 'border-gray-100'
                                        } shadow-md max-w-md mb-8 ${
                                            score <= 3 ? `${isDarkMode ? 'border-l-4 border-l-rose-600' : 'border-l-4 border-l-rose-500'}` : 
                                            score <= 7 ? `${isDarkMode ? 'border-l-4 border-l-amber-600' : 'border-l-4 border-l-amber-500'}` : 
                                            `${isDarkMode ? 'border-l-4 border-l-emerald-600' : 'border-l-4 border-l-emerald-500'}`
                                        }`}
                                        variants={resultItemVariants}
                                    >
                                        <div className="flex items-start">
                                            <div className={`mr-4 ${
                                                score <= 3 ? 'text-rose-600' : 
                                                score <= 7 ? 'text-amber-600' : 
                                                'text-emerald-600'
                                            }`}>
                                                {score <= 3 ? MoodIcons.sad : score <= 7 ? MoodIcons.neutral : MoodIcons.happy}
                                            </div>
                                            <div>
                                                <h3 className={`text-sm sm:text-lg font-semibold ${
                                                    score <= 3 ? `${isDarkMode ? 'text-rose-400' : 'text-rose-700'}` : 
                                                    score <= 7 ? `${isDarkMode ? 'text-amber-400' : 'text-amber-700'}` : 
                                                    `${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`
                                                }`}>{
                                                    score <= 3 ? "Room for Improvement" : 
                                                    score <= 7 ? "Doing Well" : 
                                                    "Excellent!"
                                                }</h3>
                                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-base mt-1`}>
                                                    {score <= 3 ? 
                                                    "Your mood score indicates you might be experiencing some challenges. Consider the recommendations below to help improve your wellbeing." : 
                                                    score <= 7 ? 
                                                    "Your mood score is moderate. There's room for improvement in some areas, but you're doing well overall." : 
                                                    "Great job! Your mood score indicates you're doing very well. Keep up these positive habits!"}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                    
                                    <Recommendation recommendations={getRecommendations()} />
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {currentStep < totalSteps && currentStep !== 1 && !isLoading && (
                                <button 
                                    onClick={prevStep}
                                    className={`px-6 py-3 ${
                                        isDarkMode 
                                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    } rounded-lg transition-all duration-300 flex items-center`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back
                                </button>
                            )}
                            {currentStep < totalSteps && !isLoading && (
                                <button 
                                    onClick={nextStep}
                                    className={`ml-auto px-6 py-3 ${
                                        isDarkMode 
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                    } text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center`}
                                >
                                    {"Continue"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            {currentStep === totalSteps && (
                                <button 
                                    onClick={() => router.push('/')} 
                                    className={`ml-auto px-6 py-3 ${
                                        isDarkMode 
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' 
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                    } text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center`}
                                >
                                    Go to Home
                                </button>
                            )}
                        </div>
                        
                        {/* Error notification if there are errors */}
                        {Object.keys(errors).length > 0 && (
                            <div 
                                className={`mt-4 p-3 ${isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-100'} border rounded-lg`}
                            >
                                <div className="flex items-center">
                                    <div className="text-red-500 mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                                        Please fill in all required fields before proceeding
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default Mood_Tracker;