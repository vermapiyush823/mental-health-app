'use client'
import React, { useEffect, useState } from 'react'
import MentalHealthChart from './Mental_Health_Charts'
import Overview_single_score from './Overview_single_score'
import Ai_insights from './Ai_insights'
import { useTheme } from 'next-themes'

interface OverviewProps {
  userId: string;
}
const Overview = ({ userId }: OverviewProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkMode = mounted && resolvedTheme === 'dark';
  
  const [data, setData] = React.useState([
    {
      id: "Mood Score",
      color: "hsl(200, 70%, 50%)",
      data: [
        { x: "Mon", y: 7 },
        { x: "Tue", y: 8 },
        { x: "Wed", y: 6 },
        { x: "Thu", y: 9 },
        { x: "Fri", y: 5 },
        { x: "Sat", y: 8 },
        { x: "Sun", y: 7 },
      ],
    },
  ]);
  const [moodScore, setMoodScore] = React.useState(0);
  const [sleepQuality, setSleepQuality] = React.useState(0);
  const [stressLevel, setStressLevel] = React.useState('Low');
  const [recommendations, setRecommendations] = React.useState([
    'You are doing great',
    'Keep up the good work',
    'You are on the right track'
  ]);

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

   useEffect(() => {
      // Fetch data from the server
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/mood-track/get-week-data?userId=${userId}`);
          const result = await response.json();
          const transformedData = result.data.map((item: any) => ({
            x: new Date(item.date).toLocaleDateString("en-US",
              { weekday: "short", month: "short", day: "numeric" 
                , timeZone: "UTC"
              },
            ),
            y: item.score,
          }));

          const formattedData = [
            {
              id: "Mood Score",
              color: "hsl(200, 70%, 50%)",
              data: transformedData,
            },
          ];
          setData(formattedData);
          
          setMoodScore(result.data[result.data.length - 1].score);
          const totalMoodScore = result.data.reduce((acc: number, item: any) => acc + item.score, 0);
          const averageMoodScore = totalMoodScore / result.data.length;
          setMoodScore(Number(averageMoodScore.toFixed(1)));
          const totalSleep = result.data.reduce((acc: number, item: any) => acc + item.sleep, 0);
          const averageSleep = totalSleep / result.data.length;
          setSleepQuality(Number(averageSleep.toFixed(1)));
          setStressLevel(result.data[0].stress);
          const formattedRecommendations = result.data[0].recommendations.map((rec: any) => rec.recommendation);
          setRecommendations(formattedRecommendations);     
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData(); // Call the fetch function
    }, [userId]);

   useEffect(() => {
     console.log('Updated data state:', data);
   }, [data]);

  return (
    <div className={`flex flex-col gap-y-5 ${mounted ? (isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900') : 'bg-white text-gray-900'} h-fit rounded-md p-5 transition-colors duration-300`}>
        <h1 className='text-lg font-bold'>Mental Health Overview</h1>

        <MentalHealthChart 
            chartData={data}
        />
        <div className='grid justify-center items-center gap-5 grid-cols-2 sm:grid-cols-3 w-full'>
            <Overview_single_score catgory='Weekly Mood Score' score={moodScore}/>
            <Overview_single_score catgory='Average Sleep Hours' score={sleepQuality}/>
            <Overview_single_score catgory='Stress Level' score={stressLevel}/>
        </div>
        <Ai_insights
            insights={recommendations}
        />
    </div>
  )
}

export default Overview