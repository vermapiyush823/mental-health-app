'use client'
import React, { useEffect } from 'react'
import MentalHealthChart from './Mental_Health_Charts'
import Overview_single_score from './Overview_single_score'
import Ai_insights from './Ai_insights'
interface OverviewProps {
  userId: string;
}
const Overview = ({ userId }: OverviewProps) => {
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

   useEffect(() => {
      // Fetch data from the server
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/mood-track/get-week-data?userId=${userId}`);
          const result = await response.json();
      
          const transformedData = result.data.map((item: any) => ({
            x: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
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
          setSleepQuality(result.data[result.data.length - 1].sleep);
          setStressLevel(result.data[result.data.length - 1].stress);
          const formattedRecommendations = result.data[result.data.length - 1].recommendations.map((rec: any) => rec.recommendation);
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
    <div className='flex flex-col gap-y-5 bg-white h-fit  rounded-md p-5'>
        <h1 className='text-lg font-bold'>Mental Health Overview</h1>

        <MentalHealthChart 
            chartData={data}
        />
        <div className='grid justify-center items-center gap-5 grid-cols-2 sm:grid-cols-3  w-full'>
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