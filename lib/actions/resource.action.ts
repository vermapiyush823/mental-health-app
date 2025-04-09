import { connectToDatabase } from "../mongoose";
import ResourceModel from "../../database/models/resource";

export async function getAllResources() {
  try {
    await connectToDatabase();
    
    const resources = await ResourceModel.find({})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .select("title description imageUrl category timeToRead tags"); // Select only necessary fields for list view
    
    return { success: true, data: resources };
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    return { success: false, error: error.message || "Failed to fetch resources" };
  }
}

export async function getResourceById(resourceId: string) {
  try {
    await connectToDatabase();
    
    const resource = await ResourceModel.findById(resourceId);
    
    if (!resource) {
      return { success: false, error: "Resource not found" };
    }
    
    return { success: true, data: resource };
  } catch (error: any) {
    console.error("Error fetching resource by ID:", error);
    return { success: false, error: error.message || "Failed to fetch resource" };
  }
}

export async function getResourcesByCategory(category: string) {
  try {
    await connectToDatabase();
    
    const resources = await ResourceModel.find({ category })
      .sort({ createdAt: -1 })
      .select("title description imageUrl category timeToRead tags");
    
    return { success: true, data: resources };
  } catch (error: any) {
    console.error("Error fetching resources by category:", error);
    return { success: false, error: error.message || "Failed to fetch resources by category" };
  }
}

export async function getResourcesByTags(tags: string[]) {
  try {
    await connectToDatabase();
    
    const resources = await ResourceModel.find({ tags: { $in: tags } })
      .sort({ createdAt: -1 })
      .select("title description imageUrl category timeToRead tags");
    
    return { success: true, data: resources };
  } catch (error: any) {
    console.error("Error fetching resources by tags:", error);
    return { success: false, error: error.message || "Failed to fetch resources by tags" };
  }
}

export async function addResource(resourceData: any, imageBuffer?: Buffer, imageType?: string) {
  try {
    await connectToDatabase();
    
    // If image buffer is provided, convert to data URL
    if (imageBuffer && imageType) {
      resourceData.imageUrl = `data:${imageType};base64,${Buffer.from(imageBuffer).toString("base64")}`;
    }
    
    const newResource = new ResourceModel(resourceData);
    await newResource.save();
    
    return { success: true, data: newResource, message: "Resource added successfully" };
  } catch (error: any) {
    console.error("Error adding resource:", error);
    return { success: false, error: error.message || "Failed to add resource" };
  }
}

export async function updateResourceImage(
  resourceId: string,
  buffer: Buffer,
  type: string
) {
  try {
    await connectToDatabase();
    
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    // Convert buffer to base64 and create a data URL
    resource.imageUrl = `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
    await resource.save();
    
    return { success: true, url: resource.imageUrl };
  } catch (error: any) {
    console.error("Error updating resource image:", error);
    return { success: false, error: error.message || "Failed to update resource image" };
  }
}

export async function toggleBookmark(resourceId: string, userId: string) {
  try {
    await connectToDatabase();
    
    const resource = await ResourceModel.findById(resourceId);
    
    if (!resource) {
      return { success: false, error: "Resource not found" };
    }
    
    // Check if bookmarkedBy exists, if not initialize it as an empty array
    if (!resource.bookmarkedBy) {
      resource.bookmarkedBy = [];
    }
    
    // Check if the user has already bookmarked this resource
    const isBookmarked = resource.bookmarkedBy.includes(userId);
    
    if (isBookmarked) {
      // Remove user from bookmarkedBy array
      await ResourceModel.findByIdAndUpdate(resourceId, {
        $pull: { bookmarkedBy: userId }
      });
      
      return { 
        success: true, 
        message: "Resource unbookmarked successfully",
        isBookmarked: false
      };
    } else {
      // Add user to bookmarkedBy array
      await ResourceModel.findByIdAndUpdate(resourceId, {
        $addToSet: { bookmarkedBy: userId }
      });
      
      return { 
        success: true, 
        message: "Resource bookmarked successfully",
        isBookmarked: true
      };
    }
  } catch (error: any) {
    console.error("Error toggling bookmark:", error);
    return { 
      success: false, 
      error: error.message || "Failed to toggle bookmark status" 
    };
  }
}

export async function getBookmarkStatus(resourceId: string, userId: string) {
  try {
    await connectToDatabase();
    
    const resource = await ResourceModel.findById(resourceId);
    console.log("Resource:", resource);
    
    if (!resource) {
      return { success: false, error: "Resource not found" };
    }
    
    // Check if bookmarkedBy exists, if not initialize it as an empty array
    if (!resource.bookmarkedBy) {
      resource.bookmarkedBy = [];
    }
    
    console.log("BookmarkedBy:", resource.bookmarkedBy);
    // Use includes() to check if userId exists in the array instead of push()
    const isBookmarked = resource.bookmarkedBy.includes(userId);
    console.log("Is Bookmarked:", isBookmarked);
    
    return { success: true, isBookmarked };
  } catch (error: any) {
    console.error("Error checking bookmark status:", error);
    return { 
      success: false, 
      error: error.message || "Failed to check bookmark status" 
    };
  }
}

export async function getUserBookmarkedResources(userId: string) {
  try {
    await connectToDatabase();
    
    const bookmarkedResources = await ResourceModel.find({ 
      bookmarkedBy: userId 
    })
    .sort({ createdAt: -1 })
    .select("title description imageUrl category timeToRead tags");
    
    return { success: true, data: bookmarkedResources };
  } catch (error: any) {
    console.error("Error fetching bookmarked resources:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch bookmarked resources" 
    };
  }
}