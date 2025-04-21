import { connectToDatabase } from '../mongoose';
import User from '../../database/models/user';
import MoodModel from '../../database/models/mood';
import { 
  sendWeeklySummaryNotification,
  sendInactivityReminderNotification
} from '../actions/notifications.action';

/**
 * Processes weekly summaries for all users
 * This function could be triggered by a cron job, serverless function, or API route
 */
export async function processWeeklySummaries(): Promise<void> {
  try {
    console.log('Starting weekly summary processing');
    await connectToDatabase();
    
    // Get all users who have opted to receive notifications
    const users = await User.find({ notificationPreference: { $ne: 'none' } });
    console.log(`Found ${users.length} users to process`);
    
    // Process each user
    for (const user of users) {
      try {
        await processUserWeeklySummary(user._id.toString());
      } catch (userError) {
        console.error(`Error processing user ${user._id}: ${userError}`);
        // Continue with next user
      }
    }
    
    console.log('Weekly summary processing complete');
  } catch (error) {
    console.error('Error in weekly summary batch process:', error);
  }
}

/**
 * Processes a weekly summary for a specific user
 * @param userId - The ID of the user to process
 */
export async function processUserWeeklySummary(userId: string): Promise<boolean> {
  try {
    console.log(`Processing weekly summary for user ${userId}`);
    
    // Get the user's mood data for the last two weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const moodData = await MoodModel.findOne({ userId });
    
    if (!moodData || !moodData.moodData || moodData.moodData.length === 0) {
      console.log(`No mood data found for user ${userId}`);
      return false;
    }
    
    // Extract mood scores for current and previous week
    const currentWeekData = moodData.moodData.filter((item: any) => {
      const itemDate = new Date(item.date);
      return itemDate >= oneWeekAgo;
    });
    
    const previousWeekData = moodData.moodData.filter((item: any) => {
      const itemDate = new Date(item.date);
      return itemDate >= twoWeeksAgo && itemDate < oneWeekAgo;
    });
    
    // Only proceed if we have data for the current week
    if (currentWeekData.length === 0) {
      console.log(`No current week mood data found for user ${userId}`);
      return false;
    }
    
    // Calculate summary statistics
    const currentWeekScores = currentWeekData.map((item: any) => item.score);
    const averageMood = currentWeekScores.reduce((sum: number, score: number) => sum + score, 0) / currentWeekScores.length;
    const highestMood = Math.max(...currentWeekScores);
    const lowestMood = Math.min(...currentWeekScores);
    
    // Calculate comparison to previous week if data exists
    let comparisonToPrevious = 0;
    if (previousWeekData.length > 0) {
      const previousWeekScores = previousWeekData.map((item: any) => item.score);
      const previousAverage = previousWeekScores.reduce((sum: number, score: number) => sum + score, 0) / previousWeekScores.length;
      comparisonToPrevious = ((averageMood - previousAverage) / previousAverage) * 100;
    }
    
    // Send the notification
    const result = await sendWeeklySummaryNotification(
      userId,
      averageMood,
      highestMood,
      lowestMood,
      comparisonToPrevious
    );
    
    console.log(`Weekly summary for user ${userId} - success: ${result.success}`);
    return result.success;
  } catch (error) {
    console.error(`Error processing weekly summary for user ${userId}:`, error);
    return false;
  }
}

/**
 * Checks for inactive users and sends reminders
 * This function could be triggered by a daily cron job
 */
export async function processInactivityReminders(): Promise<void> {
  try {
    console.log('Starting inactivity reminder processing');
    await connectToDatabase();
    
    // Get all users who have opted to receive notifications
    const users = await User.find({ notificationPreference: { $ne: 'none' } });
    console.log(`Found ${users.length} users to check for inactivity`);
    
    const today = new Date();
    
    // Check each user's activity
    for (const user of users) {
      try {
        const userId = user._id.toString();
        
        // Get the user's mood data
        const moodData = await MoodModel.findOne({ userId });
        
        // If no mood data at all, they haven't started tracking
        if (!moodData || !moodData.moodData || moodData.moodData.length === 0) {
          continue;
        }
        
        // Find the most recent mood entry
        const latestMoodEntry = moodData.moodData
          .map((item: any) => new Date(item.date))
          .reduce((latest: Date, current: Date) => (current > latest ? current : latest), new Date(0));
        
        // Calculate days since last activity
        const daysSinceLastActivity = Math.floor((today.getTime() - latestMoodEntry.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminder if inactive for 3+ days but less than 14 days
        // (we don't want to bother users who have been gone a very long time)
        if (daysSinceLastActivity >= 3 && daysSinceLastActivity < 14) {
          console.log(`User ${userId} has been inactive for ${daysSinceLastActivity} days, sending reminder`);
          
          await sendInactivityReminderNotification(userId, daysSinceLastActivity);
        }
      } catch (userError) {
        console.error(`Error processing inactivity for user ${user._id}:`, userError);
        // Continue with next user
      }
    }
    
    console.log('Inactivity reminder processing complete');
  } catch (error) {
    console.error('Error in inactivity reminders batch process:', error);
  }
}