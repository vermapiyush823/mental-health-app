import { sendNotification } from '../notifications/notification.service';

/**
 * Send a mood recommendation notification to the user
 * @param userId - The user's ID
 * @param score - The user's mood score
 * @param recommendations - Array of recommendations
 */
export async function sendMoodNotification(
  userId: string, 
  score: number,
  recommendations: Array<{priority: string, recommendation: string, category: string}>
): Promise<{success: boolean, message: string}> {
  try {
    // Get emoji based on score
    const getMoodEmoji = (score: number) => {
      if (score <= 3) return '😔';
      if (score <= 7) return '😊';
      return '🌟';
    };
    
    // Get color based on score
    const getMoodColor = (score: number) => {
      if (score <= 3) return '#6366f1'; // indigo for lower scores
      if (score <= 7) return '#8b5cf6'; // purple for mid scores
      return '#ec4899'; // pink for high scores
    };
    
    // Format recommendations with HTML for better visual presentation
    const formattedRecommendations = recommendations
      .slice(0, 2) // Only include the top two recommendations
      .map((rec, index) => `
        <div style="margin-bottom: 16px; padding: 12px; border-radius: 8px; background-color: #f9fafb; border-left: 4px solid ${getMoodColor(score)};">
          <p style="margin: 0; font-weight: 500; color: #111827;">${index + 1}. ${rec.recommendation}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${rec.category}</p>
        </div>
      `)
      .join('');
      
    // Customize message based on score
    let message = '';
    let subject = '';
    
    if (score <= 3) {
      subject = "Self-care Recommendations for Today";
      message = `
        <div style="padding: 8px 0;">
          <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; display: flex; align-items: center; justify-content: center;">
            <span style="display: inline-block; margin-right: 8px; font-size: 24px;">${getMoodEmoji(score)}</span>
            Your Mood Score: <span style="color: ${getMoodColor(score)}; font-weight: 600;">${score.toFixed(1)}</span>
          </h2>
          
          <p style="margin: 0 0 20px 0; color: #4b5563;">We noticed you might need some support today. Here are some personalized recommendations to help you feel better:</p>
          
          ${formattedRecommendations}
          
          <p style="margin: 24px 0 0 0; color: #4b5563; font-style: italic;">Remember, small steps can make a big difference. Visit the app for more recommendations tailored just for you.</p>
        </div>
      `;
    } else if (score <= 7) {
      subject = "Your Wellness Recommendations";
      message = `
        <div style="padding: 8px 0;">
          <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; display: flex; align-items: center;justify-content: center;">
            <span style="display: inline-block; margin-right: 8px; font-size: 24px;">${getMoodEmoji(score)}</span>
            Your Mood Score: <span style="color: ${getMoodColor(score)}; font-weight: 600;">${score.toFixed(1)}</span>
          </h2>
          
          <p style="margin: 0 0 20px 0; color: #4b5563;">Your mood score today is looking good! Here are some suggestions to maintain and improve your wellbeing:</p>
          
          ${formattedRecommendations}
          
          <p style="margin: 24px 0 0 0; color: #4b5563; font-style: italic;">Check the app for more personalized recommendations tailored just for you.</p>
        </div>
      `;
    } else {
      subject = "Keep Up the Great Work!";
      message = `
        <div style="padding: 8px 0;">
          <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; display: flex; align-items: center; justify-content: center;">
            <span style="display: inline-block; margin-right: 8px; font-size: 24px;">${getMoodEmoji(score)}</span>
            Your Mood Score: <span style="color: ${getMoodColor(score)}; font-weight: 600;">${score.toFixed(1)}</span>
          </h2>
          
          <p style="margin: 0 0 20px 0; color: #4b5563;">Congratulations! Your mood score today is impressive. To help maintain this positive state, consider:</p>
          
          ${formattedRecommendations}
          
          <p style="margin: 24px 0 0 0; color: #4b5563; font-style: italic;">Visit the app to see all your recommendations and keep up the great work!</p>
        </div>
      `;
    }
    
    // Send the notification with appropriate content
    return await sendNotification(userId, { 
      subject, 
      message,
      moodScore: score,
      recommendations
    });
  } catch (error) {
    console.error("Error sending mood notification:", error);
    return { 
      success: false, 
      message: `Error sending mood notification: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
