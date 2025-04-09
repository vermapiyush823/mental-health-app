"use client";
import React, { useState, useEffect } from 'react';
import Resource_Card from './Resource_Card';
import recource from '../../../assets/icons/resource.png';
import Link from 'next/link';

interface Resource {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  timeToRead: string;
  tags: string[];
}

interface ResourcesListProps {
  userId: string | null;
}

const ResourcesList = ({ userId }: ResourcesListProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources/get');
        if (!response.ok) throw new Error('Failed to fetch resources');
        const data = await response.json();
        setResources(data);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };

    fetchResources();
  }, []);

  return (
    <div className="w-full sm:px-6 mx-auto mb-12 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mental Health Resources</h1>
        {userId && (
          <Link 
            href="/resources/add" 
            className="bg-black text-white px-4 py-2 text-sm rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Resource
          </Link>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center py-12 animate-fadeIn">
          <div className="mb-8">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {[...Array(typeof window !== 'undefined' && window.innerWidth <= 400 ? 16 : 25)].map((_, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 md:w-6 md:h-6 rounded-full bg-black opacity-0 animate-gridFadeIn" 
                  style={{
                    animationDelay: `${(Math.random() * 1.2).toFixed(2)}s`,
                    animationDuration: `${(Math.random() * 1 + 1.2).toFixed(2)}s`,
                    animationIterationCount: 'infinite'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-red-600 mb-2">{error}</h3>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No resources available yet</h3>
          <p className="text-gray-500">Check back later for helpful mental health resources.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {resources.map((resource) => (
            <Resource_Card 
              key={resource._id}
              title={resource.title}
              description={resource.description}
              imageUrl={resource.imageUrl || recource.src}
              link={`/resources/${userId}/${resource._id}`}
              timeToRead={resource.timeToRead || "5 min read"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesList;
