
import React from 'react'
import { FormIcons } from '../../lib/FormIcons';

const LoadingMood = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
    <div className="mb-8 relative">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
            {[...Array(
                // adjust number of dots based on screen size
                window.innerWidth <= 400 ? 16 : 25
            )].map((_, i) => (
                <div 
                    key={i}
                    className="w-3 h-3 md:w-7 md:h-7 rounded-md bg-indigo-800 opacity-0 animate-gridFadeIn" 
                    style={{
                        animationDelay: `${(Math.random() * 1.2).toFixed(2)}s`,
                        animationDuration: `${(Math.random() * 1 + 1.2).toFixed(2)}s`,
                        animationIterationCount: 'infinite'
                    }}
                ></div>
            ))}
        </div>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing your data...</h3>
    <p className="text-gray-500 text-center max-w-md">
        We're calculating your personalized mood score and generating recommendations based on your inputs.
    </p>
    <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-center">
            <div className="text-indigo-500 mr-3 animate-pulse">{FormIcons.sparkle}</div>
            <p className="text-sm text-indigo-700">
                This usually takes just a moment...
            </p>
        </div>
    </div>
</div>

  )
}

export default LoadingMood