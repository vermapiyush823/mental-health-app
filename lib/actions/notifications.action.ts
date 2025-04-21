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
    // Format the recommendations for readability in the notification
    const formattedRecommendations = recommendations
      .slice(0, 2) // Only include the top two recommendations
      .map(rec => `- ${rec.recommendation}`)
      .join('\n');
      
    // Customize message based on score
    let message = '';
    let subject = '';
    
    if (score <= 3) {
      subject = "Self-care Recommendations for Today";
      message = `We noticed your mood score today is ${score.toFixed(1)}. Here are some personalized recommendations to help you feel better:\n\n${formattedRecommendations}\n\nRemember, small steps can make a big difference. Visit the app for more recommendations.`;
    } else if (score <= 7) {
      subject = "Your Wellness Recommendations";
      message = `Your mood score today is ${score.toFixed(1)}. Here are some suggestions to maintain and improve your wellbeing:\n\n${formattedRecommendations}\n\nCheck the app for more personalized recommendations.`;
    } else {
      subject = "Keep Up the Great Work!";
      message = `Congratulations! Your mood score today is an impressive ${score.toFixed(1)}. To help maintain this positive state, consider:\n\n${formattedRecommendations}\n\nVisit the app to see all your recommendations.`;
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

/**
 * Send a goal achievement notification to the user
 * @param userId - The user's ID
 * @param goalDescription - The description of the completed goal
 * @param totalGoals - Total number of goals the user has
 * @param completedGoals - Number of completed goals
 */
export async function sendGoalAchievementNotification(
  userId: string,
  goalDescription: string,
  totalGoals: number,
  completedGoals: number
): Promise<{success: boolean, message: string}> {
  try {
    const subject = "Congratulations on your achievement!";
    
    // Calculate completion percentage
    const completionPercentage = Math.round((completedGoals / totalGoals) * 100);
    
    // Create a personalized message based on overall progress
    let message;
    if (completionPercentage === 100) {
      message = `Amazing! You've completed all your goals! 🎉\n\nYou just achieved: "${goalDescription}"\n\nYou've completed ${completedGoals} out of ${totalGoals} goals. That's 100% completion!\n\nTake a moment to celebrate this accomplishment. Setting and achieving goals is a powerful way to improve your mental wellbeing.`;
    } else if (completionPercentage >= 75) {
      message = `Fantastic progress! 🌟\n\nYou just achieved: "${goalDescription}"\n\nYou've now completed ${completedGoals} out of ${totalGoals} goals (${completionPercentage}% complete). You're making excellent progress on your wellness journey!`;
    } else if (completionPercentage >= 50) {
      message = `Great job! 👏\n\nYou just achieved: "${goalDescription}"\n\nYou've completed ${completedGoals} out of ${totalGoals} goals (${completionPercentage}% complete). You're making steady progress toward your wellness goals!`;
    } else {
      message = `Well done! 💪\n\nYou just achieved: "${goalDescription}"\n\nYou've completed ${completedGoals} out of ${totalGoals} goals (${completionPercentage}% complete). Remember, every step forward matters in your wellness journey.`;
    }
    
    // Send the notification
    return await sendNotification(userId, { subject, message });
    
  } catch (error) {
    console.error("Error sending goal achievement notification:", error);
    return { 
      success: false, 
      message: `Error sending goal achievement notification: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Send an inactivity reminder notification to encourage app usage
 * @param userId - The user's ID
 * @param daysSinceLastLogin - Days since the user's last activity
 */
export async function sendInactivityReminderNotification(
  userId: string,
  daysSinceLastLogin: number
): Promise<{success: boolean, message: string}> {
  try {
    const subject = "We miss you! Time for a quick check-in";
    
    // Customize message based on inactivity duration
    let message;
    if (daysSinceLastLogin > 7) {
      message = `It's been over a week since you last tracked your mood. Taking just a minute each day to check in with yourself can make a big difference in understanding your mental health patterns.\n\nWe hope you'll take a moment today to log your mood and see how things are going.`;
    } else {
      message = `We noticed it's been ${daysSinceLastLogin} days since you last checked in. Regular mood tracking can help you recognize patterns and take better care of your mental wellbeing.\n\nTaking just a minute to log how you're feeling today could provide valuable insights.`;
    }
    
    // Send the notification
    return await sendNotification(userId, { subject, message });
    
  } catch (error) {
    console.error("Error sending inactivity reminder:", error);
    return { 
      success: false, 
      message: `Error sending inactivity reminder: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Send a weekly wellness summary notification
 * @param userId - The user's ID
 * @param averageMood - Average mood score for the week
 * @param highestMood - Highest mood score for the week
 * @param lowestMood - Lowest mood score for the week
 * @param comparisonToPrevious - Percentage change from previous week
 */
export async function sendWeeklySummaryNotification(
  userId: string,
  averageMood: number,
  highestMood: number,
  lowestMood: number,
  comparisonToPrevious: number
): Promise<{success: boolean, message: string}> {
  try {
    const subject = "Your Weekly Wellness Summary";
    
    // Format the comparison text
    let comparisonText = "";
    if (comparisonToPrevious > 0) {
      comparisonText = `That's ${Math.abs(comparisonToPrevious).toFixed(1)}% higher than last week!`;
    } else if (comparisonToPrevious < 0) {
      comparisonText = `That's ${Math.abs(comparisonToPrevious).toFixed(1)}% lower than last week.`;
    } else {
      comparisonText = "That's the same as last week.";
    }
    
    // Create the weekly summary message
    const message = `Here's your weekly wellness summary:\n\n` +
      `📊 Average Mood: ${averageMood.toFixed(1)}/10 ${comparisonText}\n` +
      `📈 Highest Mood: ${highestMood.toFixed(1)}/10\n` +
      `📉 Lowest Mood: ${lowestMood.toFixed(1)}/10\n\n` +
      `Tracking your mood helps you understand your patterns and take better care of your mental health. Check the app for more detailed insights.`;
    
    // Send the notification
    return await sendNotification(userId, { subject, message });
    
  } catch (error) {
    console.error("Error sending weekly summary:", error);
    return { 
      success: false, 
      message: `Error sending weekly summary: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Send a notification about new resources added that match user interests
 * @param userId - The user's ID
 * @param resourceTitle - Title of the new resource
 * @param resourceCategory - Category of the resource
 * @param resourceId - ID of the resource for linking
 */
export async function sendNewResourceNotification(
  userId: string,
  resourceTitle: string,
  resourceCategory: string,
  resourceId: string
): Promise<{success: boolean, message: string}> {
  try {
    const subject = `New Resource: ${resourceTitle}`;
    
    const message = `We've added a new resource that might help you:\n\n` +
      `📚 "${resourceTitle}"\n` +
      `Category: ${resourceCategory}\n\n` +
      `This resource was selected based on your interests and wellness goals. You can view it in the app to learn more.\n\n` +
      `Continuously exploring new strategies and resources can be beneficial for your mental wellbeing.`;
    
    // Send the notification
    return await sendNotification(userId, { subject, message });
    
  } catch (error) {
    console.error("Error sending new resource notification:", error);
    return { 
      success: false, 
      message: `Error sending new resource notification: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Send a support network update notification
 * @param userId - The user's ID
 * @param action - The action taken (added/updated/removed)
 * @param supportMemberName - Name of the support network member
 */
export async function sendSupportNetworkUpdateNotification(
  userId: string,
  action: 'added' | 'updated' | 'removed',
  supportMemberName: string
): Promise<{success: boolean, message: string}> {
  try {
    const subject = "Support Network Update";
    
    let actionText;
    switch (action) {
      case 'added':
        actionText = `added to`;
        break;
      case 'updated':
        actionText = `updated in`;
        break;
      case 'removed':
        actionText = `removed from`;
        break;
      default:
        actionText = `updated in`;
    }
    
    const message = `${supportMemberName} has been ${actionText} your support network.\n\n` +
      `Having a support network is an important part of maintaining good mental health. ` +
      `Remember that reaching out to your support contacts during challenging times can make a significant difference in how you feel.`;
    
    // Send the notification
    return await sendNotification(userId, { subject, message });
    
  } catch (error) {
    console.error("Error sending support network update notification:", error);
    return { 
      success: false, 
      message: `Error sending support network update notification: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}