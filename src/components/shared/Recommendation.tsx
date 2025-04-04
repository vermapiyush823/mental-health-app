"use client"
import React from 'react'
import {RecommendationIcons} from '../../lib/RecommendationIcons';

interface Recommendations {
    priority: string;
    recommendation: string;
    category: string;
}

interface RecommendationProps {
    recommendations: Recommendations[];
}

const Recommendation = ({ recommendations }: RecommendationProps) => {
  // Check if recommendations exist and has items
  if (!recommendations || recommendations.length === 0) {
    return <div className="text-center py-4">No recommendations available</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Your Personalized Plan</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {recommendations.map((rec, index) => (
          <div 
            key={`recommendation-${index}`}
            className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
              rec.priority === 'High' ? 'border-l-4 border-l-red-500' : 
              rec.priority === 'Medium' ? 'border-l-4 border-l-yellow-500' : 
              'border-l-4 border-l-green-500'
            }`}
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="flex items-start min-h-[60px]">
              <div className={`mr-4 ${
                rec.priority === 'High' ? 'text-red-600' : 
                rec.priority === 'Medium' ? 'text-yellow-600' : 
                rec.priority === 'Low' ? 'text-green-600' : ''
              }`}>
                {
                  rec.category === 'Exercise' ? RecommendationIcons.exercise:
                  rec.category === 'Nutrition' ? RecommendationIcons.nutrition:
                  rec.category === 'Sleep' ? RecommendationIcons.sleep :
                  rec.category === 'Social' ? RecommendationIcons.outdoor:
                  rec.category === 'Stress Management' ? RecommendationIcons.stress:
                  rec.category === 'Hydration' ? RecommendationIcons.water :
                  rec.category === 'Social Interaction' ? RecommendationIcons.outdoor :
                  rec.category === 'Screen Time' ? RecommendationIcons.screen :
                  ''
                }
              </div>
              <div>
                <div className="flex items-center">
                  <span className={` text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'High' ? 'bg-red-100 text-red-800' : 
                    rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    rec.priority === 'Low' ? 'bg-green-100 text-green-800' : ''
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{rec.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendation