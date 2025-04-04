"use client";
import React, { useState, useEffect } from 'react';
import sparkle from '../../../assets/icons/sparkle.svg';
import { MoodIcons} from '../../lib/MoodIcons';
import { FormIcons } from '../../lib/FormIcons';
import { useRouter } from 'next/navigation';
import { illustrations } from '../../lib/Illustrations';
import Recommendation from './Recommendation';
interface MoodTrackerProps {
    userId: string;
}
interface MoodData {
    day_rating: string;
    water_intake: number;
    people_met: number;
    exercise: number;
    sleep: number;
    screen_time: number;
    outdoor_time: number;
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
    const [recommendations, setRecommendations] = useState<Recommendations[]>([
        {
            priority: 'High',
            recommendation: 'Increase your water intake to at least 2 liters daily.',
            category: 'Hydration'
        },
        {
            priority: 'Medium',
            recommendation: 'Try to meet at least 3 new people this week.',
            category: 'Social Interaction'
        },
        {
            priority: 'Low',
            recommendation: 'Aim for 30 minutes of exercise daily.',
            category: 'Exercise'
        },
        {
            priority: 'Medium',
            recommendation: 'Limit screen time to 2 hours a day.',
            category: 'Screen Time'
        },
        {
            priority: 'High',
            recommendation: 'Get at least 7-9 hours of sleep each night.',
            category: 'Sleep'
        },
        {
            priority: 'Low',
            recommendation: 'Spend at least 1 hour outdoors daily.',
            category: 'Exercise'
        },
        {
            priority: 'Medium',
            recommendation: 'Try to reduce your stress level through mindfulness or relaxation techniques.',
            category: 'Stress Management'
        },
        {
            priority: 'High',
            recommendation: 'Focus on eating more fruits and vegetables for better nutrition.',
            category: 'Nutrition'
        }
    ]);

    const [moodData, setMoodData] = useState<MoodData>({
        day_rating: '',
        water_intake: 0,
        people_met: 0,
        exercise: 0,
        sleep: 0,
        screen_time: 0,
        outdoor_time: 0,
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

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            calculateScore();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const calculateScore = () => {
        const { water_intake, people_met, exercise, sleep, screen_time, outdoor_time } = moodData;
        const totalActivities = water_intake + people_met + exercise + sleep + screen_time + outdoor_time;
        const score = Math.min(10, (totalActivities / 60) * 10); // Normalize to a score out of 10
        setScore(score);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMoodData({
            ...moodData,
            [name]: name === 'water_intake' || name === 'people_met' || 
                    name === 'exercise' || name === 'sleep' || 
                    name === 'screen_time' || name === 'outdoor_time' 
                ? Number(value) : value
        });
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
                                    How was your day today?
                                </label>
                                <input
                                    type="text"
                                    id="day_rating"
                                    name="day_rating"
                                    className="border mt-1 rounded-lg p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="Tell us how your day was in a few words"
                                    value={moodData.day_rating}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                    <label htmlFor="water_intake" className="block text-md font-semibold text-gray-700 mb-2">
                                        Water Intake
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="water_intake"
                                            name="water_intake"
                                            className="border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                            placeholder="Liters"
                                            value={moodData.water_intake}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.1"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                            {FormIcons.water}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                    <label htmlFor="people_met" className="block text-md font-semibold text-gray-700 mb-2">
                                        Social Interactions
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="people_met"
                                            name="people_met"
                                            className="border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                            placeholder="People met"
                                            value={moodData.people_met}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500">
                                            {FormIcons.people}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                <label htmlFor="exercise" className="block text-md font-semibold text-gray-700 mb-2">
                                    Physical Activity
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="exercise"
                                        name="exercise"
                                        className="border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                                        placeholder="Minutes of exercise"
                                        value={moodData.exercise}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                        {FormIcons.exercise}
                                    </span>
                                </div>
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
                                    Sleep Duration
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="sleep"
                                        name="sleep"
                                        className="border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                        placeholder="Hours of sleep"
                                        value={moodData.sleep}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="24"
                                        step="0.5"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500">
                                        {FormIcons.sleep}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">7-9 hours is recommended for adults</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                    <label htmlFor="screen_time" className="block text-md font-semibold text-gray-700 mb-2">
                                        Screen Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="screen_time"
                                            name="screen_time"
                                            className="border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                            placeholder="Hours"
                                            value={moodData.screen_time}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.5"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                            {FormIcons.screen}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 flex-1">
                                    <label htmlFor="outdoor_time" className="block text-md font-semibold text-gray-700 mb-2">
                                        Outdoor Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="outdoor_time"
                                            name="outdoor_time"
                                            className="border rounded-lg p-3 pr-12 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                                            placeholder="Hours"
                                            value={moodData.outdoor_time}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.5"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                            {FormIcons.outdoor}
                                        </span>
                                    </div>
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
                            
                            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 mt-4">
                                <div className="flex items-start">
                                    <div className="text-indigo-500 mr-3">{FormIcons.sparkle}</div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-800">Almost there!</h4>
                                        <p className="text-sm text-indigo-700 mt-1">
                                            In the next step, we'll analyze your data and provide personalized wellness recommendations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Results & Recommendations */}
                    {currentStep === 4 && (
                        <div className={`flex flex-col ${showAnimation ? 'animate-fadeInUp' : ''}`}>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Wellness Analysis</h2>
                                <p className="text-gray-500">Based on your daily habits and activities</p>
                            </div>
                            
                            {/* Enhanced Gauge without Needle */}
                            <div className="flex flex-col items-center justify-center mb-8">
                                <div className="relative w-64 h-48 mb-4">
                                    {/* Gauge Background */}
                                    <div className="absolute inset-0">
                                        <svg className="w-full h-full" viewBox="0 0 200 120">
                                            {/* Dynamic Gradient for score colors */}
                                            <defs>
                                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor={getGaugeGradient().start} />
                                                    <stop offset="50%" stopColor={getGaugeGradient().middle} />
                                                    <stop offset="100%" stopColor={getGaugeGradient().end} />
                                                </linearGradient>
                                            </defs>
                                            
                                            {/* Base Track with Shadow */}
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
                                            
                                            {/* Gradient Track with Enhanced Animation */}
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
                                            
                                            
                                            {/* Score Indicator Dot */}
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
                                            <h3 className={`text-lg font-semibold ${
                                                score <= 3 ? 'text-rose-700' : 
                                                score <= 7 ? 'text-amber-700' : 
                                                'text-emerald-700'
                                            }`}>{
                                                score <= 3 ? "Room for Improvement" : 
                                                score <= 7 ? "Doing Well" : 
                                                "Excellent!"
                                            }</h3>
                                            <p className="text-gray-600 mt-1">
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
                        {currentStep < totalSteps && (
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
                        {currentStep < totalSteps && (
                            <button 
                                onClick={nextStep}
                                className="ml-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center"
                            >
                                Continue
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
                </div>
            </div>
        </div>
    );
}

export default Mood_Tracker;
