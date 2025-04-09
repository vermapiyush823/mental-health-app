import mongoose from "mongoose";

interface Resource {
  title: string;
  description: string;
  imageUrl: string;
  sections: Array<{
    heading: string;
    description?: string;
    list?: string[];
  }>;
  relatedArticles: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    timeToRead?: string;
  }>;
  tags: string[];
  category: string;
  timeToRead: string;
  bookmarkedBy: string[]; // Array of userIds who bookmarked the resource
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    sections: [
      {
        heading: {
          type: String,
          required: [true, "Section heading is required"],
        },
        description: {
          type: String,
        },
        list: {
          type: [String],
        },
      },
    ],
    relatedArticles: [
      {
        title: {
          type: String,
          required: [true, "Related article title is required"],
        },
        description: {
          type: String,
          required: [true, "Related article description is required"],
        },
        imageUrl: {
          type: String,
          default: "https://via.placeholder.com/150",
        },
        link: {
          type: String,
          default: "#",
        },
        timeToRead: {
          type: String,
          default: "5 min read",
        },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    timeToRead: {
      type: String,
      required: [true, "Time to read is required"],
    },
    bookmarkedBy: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ResourceModel = mongoose.models.Resource || mongoose.model<Resource>("Resource", resourceSchema);
export default ResourceModel;