"use client";
import React, { useState, useEffect } from 'react';
import sparkle from '../../../assets/icons/sparkle.svg';
import { MoodIcons } from '../../lib/MoodIcons';
import { FormIcons } from '../../lib/FormIcons';
import { useRouter } from 'next/navigation';
import { illustrations } from '../../lib/Illustrations';
import Recommendation from './Recommendation';
import LoadingMood from './LoadingMood';

interface MoodTrackerProps {
    userId: string;
}
interface MoodData {
    day_rating: string;
    water_intake: string;
    people_met: string;
    exercise: string;
    sleep: string;
    screen_time: string;
    outdoor_time: string;
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
        'water_intake', 'people_met', 'exercise', 
        'sleep', 'screen_time', 'outdoor_time'
    ]);
    const [valueError, setValueError] = useState<Array<{
        type: string;
        loc: string[];
        msg: string;
        input?: any;
        ctx?: any;
    }>>([]);

    const [moodData, setMoodData] = useState<MoodData>({
        day_rating: '',
        water_intake: '',
        people_met: '',
        exercise: '',
        sleep: '',
        screen_time: '',
        outdoor_time: '',
        stress_level: 'Medium',
        food_quality: 'Moderate'
    });

    // Animation trigger when changing steps
    useEffect(() => {
        setShowAnimation(true);
        const timer = setTimeout(() => {
            setShowAnimation(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [currentStep]);

    // Scroll to top whenever currentStep changes
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
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
            if (!moodData.sleep.trim()) {
                newErrors.sleep = "Please enter your sleep duration";
                isValid = false;
            } else if (!/^\d*\.?\d*$/.test(moodData.sleep)) {
                newErrors.sleep = "Please enter a valid number";
                isValid = false;
            }
            
            if (!moodData.screen_time.trim()) {
                newErrors.screen_time = "Please enter your screen time";
                isValid = false;
            } else if (!/^\d*\.?\d*$/.test(moodData.screen_time)) {
                newErrors.screen_time = "Please enter a valid number";
                isValid = false;
            }
            
            if (!moodData.outdoor_time.trim()) {
                newErrors.outdoor_time = "Please enter your outdoor time";
                isValid = false;
            } else if (!/^\d*\.?\d*$/.test(moodData.outdoor_time)) {
                newErrors.outdoor_time = "Please enter a valid number";
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
            sleep: parseFloat(moodData.sleep) || 0,
            screen_time: parseFloat(moodData.screen_time) || 0,
            outdoor_time: parseFloat(moodData.outdoor_time) || 0,
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
        <div className='flex min-h-screen flex-col w-full p-4 bg-gray-50 items-center justify-center'>
            {isLoading ? (
                <LoadingMood/>
            ) : (
                <div className='flex bg-white p-4 sm:p-6 w-full rounded-xl shadow-lg flex-col items-center justify-center max-w-4xl mx-auto'>
                    <h1 className='text-3xl md:text-4xl flex items-center font-bold text-gray-800 mb-2'>
                        Track Your Mood 
                        <img src={sparkle.src} alt="sparkle" className='ml-3 w-10 h-10 md:w-12 md:h-12 inline animate-pulse' />
                    </h1>
                    <p className="text-gray-500 text-center mb-6">Record your daily habits to get personalized wellness insights</p>

                    {/* Progress Steps */}
                    <div className="flex justify-between w-full max-w-md mb-8">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex flex-col items-center">
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                                        currentStep >= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step}
                                </div>
                                <div className={`text-xs md:text-sm transition-all duration-500 ${
                                    currentStep >= step ? 'text-black font-medium' : 'text-gray-400'
                                }`}>
                                    {step === 1 ? 'Activities' : 
                                     step === 2 ? 'Lifestyle' : 
                                     step === 3 ? 'Wellness' : 'Results'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-2xl mb-8">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-black h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${(currentStep/totalSteps) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className='flex h-full bg-white p-3 sm:p-6 w-full flex-col relative overflow-hidden'>
                        {/* Step 1: Daily Activities */}
                        {currentStep === 1 && (
                            <div className={`flex flex-col space-y-6 ${showAnimation ? 'animate-fadeInRight' : ''}`}>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Daily Activities</h2>
                                    <p className="text-gray-500">Tell us about your day's activities</p>
                                    {illustrations.step1}
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                    <label htmlFor="day_rating" className="block text-md font-semibold text-gray-700 mb-2">
                                        How was your day today? <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="day_rating"
                                        name="day_rating"
                                        className={`border mt-1 rounded-lg p-3 text-sm w-full focus:outline-none focus:ring-2 ${errors.day_rating ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'} transition-all`}
                                        placeholder="Tell us how your day was in a few words"
                                        value={moodData.day_rating}
                                        onChange={handleInputChange}
                                    />
                                    {errors.day_rating && <p className="text-red-500 text-xs mt-1 error-message">{errors.day_rating}</p>}
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                        <label htmlFor="water_intake" className="block text-md font-semibold text-gray-700 mb-2">
                                            Water Intake <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                id="water_intake"
                                                name="water_intake"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${errors.water_intake ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-400'} transition-all`}
                                                placeholder="Liters"
                                                value={moodData.water_intake}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                                {FormIcons.water}
                                            </span>
                                        </div>
                                        {errors.water_intake && <p className="text-red-500 text-xs mt-1 error-message">{errors.water_intake}</p>}
                                    </div>
                                    
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                        <label htmlFor="people_met" className="block text-md font-semibold text-gray-700 mb-2">
                                            Social Interactions <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                id="people_met"
                                                name="people_met"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${errors.people_met ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-400'} transition-all`}
                                                placeholder="People met"
                                                value={moodData.people_met}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500">
                                                {FormIcons.people}
                                            </span>
                                        </div>
                                        {errors.people_met && <p className="text-red-500 text-xs mt-1 error-message">{errors.people_met}</p>}
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                    <label htmlFor="exercise" className="block text-md font-semibold text-gray-700 mb-2">
                                        Physical Activity <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id="exercise"
                                            name="exercise"
                                            className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${errors.exercise ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-400'} transition-all`}
                                            placeholder="Minutes of exercise"
                                            value={moodData.exercise}
                                            onChange={handleInputChange}
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                            {FormIcons.exercise}
                                        </span>
                                    </div>
                                    {errors.exercise && <p className="text-red-500 text-xs mt-1 error-message">{errors.exercise}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Lifestyle Metrics */}
                        {currentStep === 2 && (
                            <div className={`flex flex-col space-y-6 ${showAnimation ? 'animate-fadeInRight' : ''}`}>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Lifestyle Habits</h2>
                                    <p className="text-gray-500">Let's learn about your daily routines</p>
                                    {illustrations.step2}
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                    <label htmlFor="sleep" className="block text-md font-semibold text-gray-700 mb-2">
                                        Sleep Duration <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            id="sleep"
                                            name="sleep"
                                            className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${errors.sleep ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-400'} transition-all`}
                                            placeholder="Hours of sleep"
                                            value={moodData.sleep}
                                            onChange={handleInputChange}
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500">
                                            {FormIcons.sleep}
                                        </span>
                                    </div>
                                    {errors.sleep && <p className="text-red-500 text-xs mt-1 error-message">{errors.sleep}</p>}
                                    <p className="text-xs text-gray-500 mt-1">7-9 hours is recommended for adults</p>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                        <label htmlFor="screen_time" className="block text-md font-semibold text-gray-700 mb-2">
                                            Screen Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                id="screen_time"
                                                name="screen_time"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${errors.screen_time ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-400'} transition-all`}
                                                placeholder="Hours"
                                                value={moodData.screen_time}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                                {FormIcons.screen}
                                            </span>
                                        </div>
                                        {errors.screen_time && <p className="text-red-500 text-xs mt-1 error-message">{errors.screen_time}</p>}
                                    </div>
                                    
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                        <label htmlFor="outdoor_time" className="block text-md font-semibold text-gray-700 mb-2">
                                            Outdoor Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                id="outdoor_time"
                                                name="outdoor_time"
                                                className={`border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 ${errors.outdoor_time ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-400'} transition-all`}
                                                placeholder="Hours"
                                                value={moodData.outdoor_time}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                                {FormIcons.outdoor}
                                            </span>
                                        </div>
                                        {errors.outdoor_time && <p className="text-red-500 text-xs mt-1 error-message">{errors.outdoor_time}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Stress & Nutrition */}
                        {currentStep === 3 && (
                            <div className={`flex flex-col space-y-6 ${showAnimation ? 'animate-fadeInRight' : ''}`}>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Wellness Check</h2>
                                    <p className="text-gray-500">Let us know about your stress and nutrition</p>
                                    {illustrations.step3}
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                    <label htmlFor="stress_level" className="block text-md font-semibold text-gray-700 mb-2 flex items-center">
                                        <span className="mr-2 text-purple-500">{FormIcons.stress}</span> Stress Level
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                        {['Low', 'Medium', 'High'].map(level => (
                                            <button
                                                key={level}
                                                type="button"
                                                className={`py-2 px-4 rounded-lg transition-all ${
                                                    moodData.stress_level === level 
                                                        ? 'bg-black text-white' 
                                                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                                                }`}
                                                onClick={() => setMoodData({...moodData, stress_level: level})}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">How would you rate your stress today?</p>
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                    <label htmlFor="food_quality" className=" text-md font-semibold text-gray-700 mb-2 flex items-center">
                                        <span className="mr-2 text-red-500">{FormIcons.food}</span> Food Quality
                                    </label>
                                    <div className="grid grid-col-1 sm:grid-cols-3 gap-4 mb-2">
                                        {['Healthy', 'Moderate', 'Unhealthy'].map(quality => (
                                            <button
                                                key={quality}
                                                type="button"
                                                className={`py-2 px-4 rounded-lg transition-all ${
                                                    moodData.food_quality === quality 
                                                        ? 'bg-black text-white' 
                                                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                                                }`}
                                                onClick={() => setMoodData({...moodData, food_quality: quality})}
                                            >
                                                {quality}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">How would you describe your food choices today?</p>
                                </div>
                                
                                {valueError.length > 0 && (
                                    <div className="bg-red-50 p-5 rounded-lg border border-red-100 mt-4">
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                {valueError.map((error, index) => (
                                                    <div key={index} className="mb-2 flex items-center last:mb-0">
                                                        <span className="text-red-500 mr-3">{FormIcons.error}</span>
                                                        <span className="text-sm font-medium text-red-800">
                                                            {error.loc[1]}: {' '}
                                                        </span>
                                                        <span className="text-sm text-red-500">{error.msg}</span>   
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 mt-4">
                                    <div className="flex items-start">
                                        <div className="text-indigo-500 mr-3">{FormIcons.sparkle}</div>
                                        <div>
                                            <h4 className="sm:text-lg text-sm font-semibold text-indigo-800">Almost there!</h4>
                                            <p className="text-xs sm:text-sm text-indigo-700 mt-1">
                                                In the next step, we'll analyze your data and provide personalized wellness recommendations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Results & Recommendations */}
                        {currentStep === 4 && !isLoading && (
                            <div className={`flex flex-col ${showAnimation ? 'animate-fadeInUp' : ''}`}>
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Wellness Analysis</h2>
                                    <p className="text-gray-500">Based on your daily habits and activities</p>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center mb-8">
                                    <div className="relative w-64 h-48 mb-4">
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
                                                    stroke="#e5e7eb"
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
                                                    className="animate-gaugeReveal"
                                                />
                                                
                                                
                                                <circle 
                                                    cx={100 + 80 * Math.cos((-180 + (score/10) * 180) * Math.PI / 180)}
                                                    cy={100 + 80 * Math.sin((-180 + (score/10) * 180) * Math.PI / 180)}
                                                    r="6" 
                                                    fill={getGaugeGradient().end}
                                                    className="animate-pulse"
                                                />
                                            </svg>
                                        </div>
                                        
                                        {/* Digital Score Display */}
                                        <div className="absolute bottom-4 left-0 right-0 text-center">
                                            <div className={`text-5xl font-bold ${getScoreColor()} animate-scoreReveal drop-shadow-md`}>
                                                {score.toFixed(1)}
                                            </div>
                                            <div className="text-black text-sm mt-1">Your Mood Score</div>
                                        </div>
                                    </div>
                                    
                                    {/* Score Interpretation Card - with SVG instead of emoji */}
                                    <div 
                                        className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm  max-w-md mb-8 ${
                                            score <= 3 ? 'border-l-4 border-l-rose-500' : 
                                            score <= 7 ? 'border-l-4 border-l-amber-500' : 
                                            'border-l-4 border-l-emerald-500'
                                        }`}
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
                                                    score <= 3 ? 'text-rose-700' : 
                                                    score <= 7 ? 'text-amber-700' : 
                                                    'text-emerald-700'
                                                }`}>{
                                                    score <= 3 ? "Room for Improvement" : 
                                                    score <= 7 ? "Doing Well" : 
                                                    "Excellent!"
                                                }</h3>
                                                <p className="text-gray-600 text-xs sm:text-base mt-1">
                                                    {score <= 3 ? 
                                                    "Your mood score indicates you might be experiencing some challenges. Consider the recommendations below to help improve your wellbeing." : 
                                                    score <= 7 ? 
                                                    "Your mood score is moderate. There's room for improvement in some areas, but you're doing well overall." : 
                                                    "Great job! Your mood score indicates you're doing very well. Keep up these positive habits!"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Recommendation recommendations={getRecommendations()} />
                                    
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {currentStep < totalSteps && currentStep!==1&& !isLoading && (
                                <button 
                                    onClick={prevStep}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all flex items-center"
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
                                    className="ml-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center"
                                >{"Continue"}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            {currentStep === totalSteps && (
                                <button 
                                    onClick={() => 
                                        // navigate to the home page using the router
                                        router.push('/')
                                    } 
                                    className="ml-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center"
                                >
                                    Go to Home
                                </button>
                            )}
                        </div>
                        
                        {/* Error notification if there are errors */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div className="flex items-center">
                                    <div className="text-red-500 mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-red-700">
                                        Please fill in all required fields before proceeding
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Mood_Tracker;
