    // SVG illustrations for each step
    export const illustrations = {
        step1: (
            <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendar background with gradient */}
                <rect x="30" y="40" width="140" height="120" rx="8" fill="url(#calendarGradient)" stroke="#4B5563" strokeWidth="2" />
                <defs>
                    <linearGradient id="calendarGradient" x1="30" y1="40" x2="170" y2="160" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f3f4f6" />
                        <stop offset="1" stopColor="#e5e7eb" />
                    </linearGradient>
                </defs>
                
                {/* Calendar header with vibrant color */}
                <rect x="30" y="40" width="140" height="30" rx="8" fill="#8B5CF6" stroke="#4B5563" strokeWidth="2" />
                <circle cx="50" cy="55" r="6" fill="#EF4444" />
                <circle cx="70" cy="55" r="6" fill="#F59E0B" />
                <circle cx="90" cy="55" r="6" fill="#10B981" />
                
                {/* Activity items with color */}
                <rect x="45" y="85" width="110" height="12" rx="2" fill="#bfdbfe" />
                <rect x="45" y="105" width="80" height="12" rx="2" fill="#fde68a" />
                <rect x="45" y="125" width="100" height="12" rx="2" fill="#a7f3d0" />
                
                {/* Activity icons with vibrant colors */}
                <circle cx="170" cy="85" r="6" fill="#3B82F6" stroke="#2563EB" strokeWidth="1" />
                <circle cx="135" cy="105" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
                <circle cx="155" cy="125" r="6" fill="#10B981" stroke="#059669" strokeWidth="1" />
                
                {/* Person silhouette with gradient */}
                <circle cx="170" cy="170" r="20" fill="#C084FC" />
                <path d="M160 160L165 165M180 160L175 165" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
                <path d="M165 176C165 176 170 180 175 176" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
                <path d="M150 190C150 190 160 200 170 200C180 200 190 190 190 190" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
                
                {/* Decorative elements */}
                <circle cx="40" cy="175" r="15" fill="#FCA5A5" />
                <circle cx="45" cy="170" r="5" fill="#FEF3C7" />
                <path d="M25 175L35 185M55 165L45 175" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Water glass */}
                <path d="M85 175H105L100 195H90L85 175Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
                <path d="M87 175L103 175" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M90 185L100 185" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" />
            </svg>
        ),
        step2: (
            <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="notepadGradient" x1="40" y1="60" x2="160" y2="140" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f3f4f6" />
                        <stop offset="1" stopColor="#e5e7eb" />
                    </linearGradient>
                    <linearGradient id="sunriseGradient" x1="70" y1="20" x2="130" y2="60" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FEF3C7" />
                        <stop offset="1" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient id="moonGradient" x1="70" y1="160" x2="130" y2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#C7D2FE" />
                        <stop offset="1" stopColor="#6366F1" />
                    </linearGradient>
                </defs>
                
                {/* Main notepad with gradient */}
                <rect x="40" y="60" width="120" height="80" rx="5" fill="url(#notepadGradient)" stroke="#4B5563" strokeWidth="3" />
                
                {/* Notepad lines in different colors */}
                <rect x="50" y="70" width="100" height="15" rx="2" fill="#93C5FD" />
                <rect x="50" y="95" width="100" height="15" rx="2" fill="#A7F3D0" />
                <rect x="50" y="120" width="100" height="10" rx="2" fill="#FCA5A5" />
                
                {/* Sunrise with gradient */}
                <path d="M70 40C70 40 85 20 100 20C115 20 130 40 130 40" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="30" r="12" fill="url(#sunriseGradient)" />
                
                {/* Night/Moon with gradient */}
                <path d="M70 180C70 180 85 160 100 160C115 160 130 180 130 180" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="170" r="12" fill="url(#moonGradient)" />
                
                {/* Decorative elements */}
                <circle cx="30" cy="100" r="10" fill="#FCA5A5" stroke="#F87171" strokeWidth="2" />
                <circle cx="170" cy="100" r="10" fill="#A7F3D0" stroke="#34D399" strokeWidth="2" />
            </svg>
        ),
        step3: (
            <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="clockFaceGradient" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f3f4f6" />
                        <stop offset="1" stopColor="#e5e7eb" />
                    </linearGradient>
                    <linearGradient id="starGradient" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop stopColor="#FEF3C7" />
                        <stop offset="1" stopColor="#F59E0B" />
                    </linearGradient>
                </defs>
                
                {/* Clock face with gradient */}
                <path d="M100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30Z" fill="url(#clockFaceGradient)" stroke="#4B5563" strokeWidth="3" />
                
                {/* Clock hands with color */}
                <path d="M100 50V100L130 130" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="100" cy="100" r="10" fill="#93C5FD" />
                
                {/* Decorative star elements */}
                <path d="M160 40L180 60M20 40L40 60M160 160L180 140M20 160L40 140" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                
                {/* Additional decorative elements */}
                <circle cx="180" cy="50" r="8" fill="url(#starGradient)" />
                <circle cx="20" cy="50" r="8" fill="url(#starGradient)" />
                <circle cx="180" cy="150" r="8" fill="url(#starGradient)" />
                <circle cx="20" cy="150" r="8" fill="url(#starGradient)" />
            </svg>
        ),
        step4: (
            <svg className="w-48 h-48 mx-auto mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="faceGradient" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f3f4f6" />
                        <stop offset="1" stopColor="#e5e7eb" />
                    </linearGradient>
                    <linearGradient id="smileGradient" x1="65" y1="130" x2="135" y2="150" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10B981" />
                        <stop offset="1" stopColor="#34D399" />
                    </linearGradient>
                    <radialGradient id="glowGradient" cx="100" cy="100" r="50" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A7F3D0" stopOpacity="0.4" />
                        <stop offset="1" stopColor="#A7F3D0" stopOpacity="0" />
                    </radialGradient>
                </defs>
                
                {/* Face circle with gradient */}
                <path d="M170 100C170 138.66 138.66 170 100 170C61.3401 170 30 138.66 30 100C30 61.3401 61.3401 30 100 30C138.66 30 170 61.3401 170 100Z" fill="url(#faceGradient)" stroke="#4B5563" strokeWidth="3" />
                
                {/* Smile with gradient */}
                <path d="M65 130C65 130 80 150 100 150C120 150 135 130 135 130" stroke="url(#smileGradient)" strokeWidth="4" strokeLinecap="round" />
                
                {/* Eyes with color */}
                <circle cx="75" cy="80" r="8" fill="#4B5563" />
                <circle cx="125" cy="80" r="8" fill="#4B5563" />
                <circle cx="75" cy="80" r="3" fill="#F3F4F6" />
                <circle cx="125" cy="80" r="3" fill="#F3F4F6" />
                
                {/* Decorative elements */}
                <path d="M80 40L75 60M120 40L125 60M50 60L65 75M150 60L135 75" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                
                {/* Glow effect */}
                <circle cx="100" cy="100" r="50" fill="url(#glowGradient)" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="2 4" />
            </svg>
        )
    };