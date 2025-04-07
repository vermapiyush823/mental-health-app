import Resource from '@/components/shared/Resource';
import React from 'react';
import resource from '../../../../../assets/icons/resource.png';

const Page = () => {

  return (
    <div className='flex flex-col mt-4 sm:mt-8 px-4 mb-8 gap-y-5 w-full items-center'>
      <Resource
        title="Mindfulness Meditation Guide"
        imageUrl={resource.src}
        sections={[
          {
            heading: "Introduction to Mindfulness",
            description:
              "Mindfulness meditation is a mental training practice that teaches you to slow down racing thoughts, let go of negativity, and calm both your mind and body. It combines meditation with the practice of mindfulness, which can be defined as a mental state that involves being fully focused on 'the now' so you can acknowledge and accept your thoughts, feelings, and sensations without judgment.",
          },
          {
            heading: "Basic Techniques",
            description: "Start with these fundamental practices:",
            list: [
              "Find a quiet and comfortable place",
              "Set a time limit (5–10 minutes for beginners)",
              "Pay attention to your body and breath",
              "Notice when your mind wanders",
              "Be kind to your wandering mind",
            ],
          },
          {
            heading: "Benefits of Regular Practice",
            description: "Regular mindfulness meditation can provide numerous benefits:",
            list: [
              "Reduced stress and anxiety",
              "Improved emotional regulation",
              "Better focus and concentration",
              "Enhanced self-awareness",
              "Better sleep quality",
            ],
          },
        ]}
        relatedArticles={[
          {
            title: "Meditation for Sleep",
            description: "Learn how sleep meditation improves rest.",
          },
          {
            title: "Breathing Techniques",
            description: "Master simple breathing methods for calm.",
          },
          {
            title: "Gratitude Journaling",
            description: "Boost positivity with journaling habits.",
          },
        ]}
      />
     
    </div>
  );
};

export default Page;
