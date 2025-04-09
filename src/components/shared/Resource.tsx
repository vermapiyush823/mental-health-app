import Link from "next/link";
import { useEffect, useState } from "react";
import Resource_Card from "./Resource_Card";

interface ResourceData {
  title: string;
  imageUrl: string;
  sections: Array<{
    heading: string;
    description?: string;
    list?: string[];
  }>;
  relatedArticles?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    timeToRead?: string;
  }>;
  resourceId: string;
  timeToRead: string;
  category: string;
  tags: string[];
  userId?: string;
  bookmarkedBy?: string[];
}

interface ResourceProps extends ResourceData {
  resourceId: string;
  userId: string;
}

const Resource = ({
  title,
  imageUrl,
  sections,
  relatedArticles = [],
  resourceId,
  timeToRead,
  category,
  tags,
  userId,
  bookmarkedBy = []
}: ResourceProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    if (userId && resourceId) {
      // Set initial bookmark state based on bookmarkedBy prop
      setIsBookmarked(bookmarkedBy.includes(userId));
      
      // Also fetch latest status from API
      const checkBookmarkStatus = async () => {
        try {
          const response = await fetch(`/api/resources/bookmark?resourceId=${resourceId}&userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setIsBookmarked(data.isBookmarked);
          }
        } catch (error) {
          console.error("Error checking bookmark status:", error);
        }
      };
      
      checkBookmarkStatus();
    }
  }, [userId, resourceId]); // Remove bookmarkedBy from dependency array

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

  const toggleBookmark = async () => {
    if (!userId || isBookmarking) return;
    
    try {
      setIsBookmarking(true);
      const response = await fetch('/api/resources/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourceId, userId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } else {
        console.error('Failed to toggle bookmark');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="h-fit w-full sm:px-6">
      {/* Sticky Header */}
      <div className="sticky top-0 rounded-t-xl mx-auto z-50 bg-white px-4 sm:px-6 py-3 max-w-5xl shadow-md">
        <div className="flex items-center justify-between">
          <Link
            href="/resources"
            className="flex items-center text-sm text-gray-600 hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resources
          </Link>

          <div className="flex items-center space-x-3">
            {/* Bookmark Button */}
            <button
              type="button"
              onClick={toggleBookmark}
              disabled={isBookmarking || !userId}
              className={`text-gray-500 hover:text-red-600 transition focus:outline-none ${
                isBookmarking ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this resource"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill={isBookmarked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isBookmarked ? 0 : 2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l7-5 7 5V3a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
            </button>
            
          </div>
        </div>

        {/* Scroll Progress */}
        <div className="w-full h-1.5 bg-gray-100 mt-2 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-black transition-all duration-300 ease-in-out"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        <article className="bg-white rounded-b-xl p-6 sm:p-10 shadow-lg">
          {/* Title and Tags */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h1>

          <div className="flex flex-wrap justify-between gap-y-4  mb-6">
        <div className="flex  flex-wrap gap-2">
        <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full shadow-sm">
              {category}
            </span>
            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
              {timeToRead}
            </span>
        </div>
           <div className="flex flex-wrap gap-2">
           {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm hover:bg-gray-200 transition"
              >
                #{tag}
              </span>
            ))}
           </div>
          </div>

          {/* Cover Image */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full max-h-[400px] object-cover rounded-xl mb-8 shadow-md hover:shadow-lg transition"
          />

          {/* Sections */}
          {sections.map((section, idx) => (
            <section key={idx} className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">{section.heading}</h2>

              {section.description && (
                <p className="text-gray-700 leading-relaxed mb-4">{section.description}</p>
              )}

              {section.list && (
                <ul className="space-y-2 text-gray-700">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-lg mr-2 text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {idx !== sections.length - 1 && (
                <hr className="my-8 border-gray-200" />
              )}
            </section>
          ))}
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Related Articles</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article, idx) => (
                <Resource_Card
                  key={idx}
                  title={article.title}
                  description={article.description}
                  imageUrl={article.imageUrl || "https://via.placeholder.com/300"}
                  link={article.link || "#"}
                  timeToRead={article.timeToRead || "5 min read"}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Resource;
