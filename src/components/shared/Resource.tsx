"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Resource_Card from "./Resource_Card";
interface MeditationGuideProps {

  title: string;
  imageUrl: string;
  sections: {
    heading: string;
    description?: string;
    list?: string[];
  }[];
  relatedArticles: {
    title: string;
    description: string;
  }[];
}

const Resource = ({
  title,
  imageUrl,
  sections,
  relatedArticles,
}: MeditationGuideProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = (scrollTop / docHeight) * 100;
    setScrollProgress(scroll);
  };

  useEffect(() => {
    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Sticky Top Section */}
      <div className="sticky top-0 z-50 bg-white rounded-t-xl px-6 pt-4 pb-3 ">
     <div className="flex items-center justify-between">
     <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
        </svg>
        <Link
          href="#"
          className="text-sm text-gray-500 hover:text-black transition inline-block  items-center"
        >
          
          Back to Resources
        </Link>
    </div>
     {/* Like Button */}
     <div className="flex items-center justify-end ">
          <button type="button" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2 text-gray-500 hover:text-red-600 transition"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 3v18l7-5 7 5V3a2 2 0 00-2-2H7a2 2 0 00-2 2z"
              />
            </svg>
          </button>
        </div>
        </div>
   
        {/* Scroll Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-black h-1.5 transition-all ease-in-out duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-16">
        <div className="bg-white p-6 rounded-b-xl">
          {/* Title */}
          <h1 className="text-4xl font-bold mb-6 text-gray-900">{title}</h1>

          {/* Image */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto rounded-xl mb-8 shadow"
          />

          {/* Sections */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                {section.heading}
              </h2>

              {section.description && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {section.description}
                </p>
              )}

              {section.list && (
                <ul className="space-y-3 text-gray-700 list-none mb-6">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-lg mr-2 mt-1 text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {idx !== sections.length - 1 && (
                <hr className="my-10 border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Related Articles */}
      <div className="py-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Related Articles
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((article, idx) => (
              <Resource_Card
                key={idx}
                title={article.title}
                description={article.description}
                imageUrl="https://via.placeholder.com/150"
                link="#"
                timeToRead="5 min read"
              />
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Resource;
