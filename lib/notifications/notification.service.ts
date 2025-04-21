// Main notification service that handles sending notifications via email only

import { sendEmail } from './email.service';
import { connectToDatabase } from '../mongoose';
import User from '../../database/models/user';

interface NotificationContent {
  subject: string;
  message: string;
  moodScore?: number;
  recommendations?: Array<{priority: string, recommendation: string, category: string}>;
}

export async function sendNotification(
  userId: string, 
  content: NotificationContent
): Promise<{success: boolean, message: string}> {
  try {
    await connectToDatabase();
    
    // Find user to get notification preferences and contact details
    const user = await User.findById(userId);
    if (!user) {
      return { 
        success: false, 
        message: "User not found" 
      };
    }
    
    const { notificationPreference, email, name } = user;
    
    // Skip notification if user has opted out
    if (notificationPreference === 'none') {
      return { 
        success: true, 
        message: "User has opted out of notifications" 
      };
    }
    
    // For all other preferences, send email (since SMS is removed)
    const personalizedMessage = `Hi ${name},\n\n${content.message}`;
    const emailSuccess = await sendEmail(email, content.subject, personalizedMessage);
    
    return { 
      success: emailSuccess, 
      message: emailSuccess 
        ? "Notification sent via email" 
        : "Failed to send email notification" 
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { 
      success: false, 
      message: `Error sending notification: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}