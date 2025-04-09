"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Section {
  heading: string;
  description?: string;
  list?: string[];
}

interface RelatedArticle {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  timeToRead?: string;
}

interface AddResourceFormProps {
  userId: string;
}

const AddResourceForm = ({ userId }: AddResourceFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [category, setCategory] = useState("");
  const [timeToRead, setTimeToRead] = useState("");
  const [tags, setTags] = useState("");
  const [sections, setSections] = useState<Section[]>([
    { heading: "", description: "", list: [""] }
  ]);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageUrl(""); // Clear URL when file is selected

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImageFile(null); // Clear file when URL is provided
    setImagePreview(""); // Clear preview
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Section handlers
  const addSection = () => {
    setSections([...sections, { heading: "", description: "", list: [""] }]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = [...sections];
      newSections.splice(index, 1);
      setSections(newSections);
    }
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const addListItem = (sectionIndex: number) => {
    const newSections = [...sections];
    if (!newSections[sectionIndex].list) {
      newSections[sectionIndex].list = [""];
    } else {
      newSections[sectionIndex].list = [...newSections[sectionIndex].list!, ""];
    }
    setSections(newSections);
  };

  const updateListItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...sections];
    if (newSections[sectionIndex].list) {
      newSections[sectionIndex].list![itemIndex] = value;
      setSections(newSections);
    }
  };

  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    if (newSections[sectionIndex].list && newSections[sectionIndex].list!.length > 1) {
      newSections[sectionIndex].list!.splice(itemIndex, 1);
      setSections(newSections);
    }
  };

  // Related Article handlers
  const addRelatedArticle = () => {
    setRelatedArticles([...relatedArticles, { title: "", description: "", imageUrl: "", link: "", timeToRead: "" }]);
  };

  const removeRelatedArticle = (index: number) => {
    if (relatedArticles.length > 0) {
      const newArticles = [...relatedArticles];
      newArticles.splice(index, 1);
      setRelatedArticles(newArticles);
    }
  };

  const updateRelatedArticle = (index: number, field: keyof RelatedArticle, value: string) => {
    const newArticles = [...relatedArticles];
    newArticles[index] = { ...newArticles[index], [field]: value };
    setRelatedArticles(newArticles);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!title || !description || (!imageUrl && !imageFile) || !category || !timeToRead || !sections[0].heading) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Clean up empty fields in sections and related articles
      const cleanSections = sections.map(section => ({
        ...section,
        list: section.list?.filter(item => item.trim() !== "")
      })).filter(section => section.heading.trim() !== "");

      const cleanRelatedArticles = relatedArticles
        .filter(article => article.title.trim() !== "" && article.description.trim() !== "");
      
      // Direct file upload using FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Prepare the resource data
        const resourceData = {
          title,
          description,
          category,
          timeToRead,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
          sections: cleanSections,
          relatedArticles: cleanRelatedArticles || [],
          userId
        };
        
        formData.append('resourceData', JSON.stringify(resourceData));
        
        const response = await fetch('/api/resources/add', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add resource');
        }
        
        const result = await response.json();
        setSuccess("Resource added successfully!");
        setTimeout(() => {
          router.push('/resources');
        }, 2000);
        
      } else {
        // Using JSON if only URL is provided
        const resourceData = {
          title,
          description,
          imageUrl,
          category,
          timeToRead,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
          sections: cleanSections,
          relatedArticles: cleanRelatedArticles || [],
          userId
        };
        
        const response = await fetch('/api/resources/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resourceData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add resource');
        }
        
        const result = await response.json();
        setSuccess("Resource added successfully!");
        setTimeout(() => {
          router.push('/resources');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while adding the resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Add New Resource</h1>
        <Link href="/resources" className="text-gray-600 hover:text-black">
          Back to Resources
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            <p>{success}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Image <span className="text-red-500">*</span>
              </label>
              
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto h-32 w-auto object-cover"
                          />
                        </div>
                      ) : (
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      
                      <div className="flex justify-center text-sm text-gray-600">
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Upload a file
                          </button>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Or provide an image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(e)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="text-xs text-gray-500">
                      Either upload an image or provide a URL. If both are provided, the uploaded image will be used.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="timeToRead">
                Time to Read <span className="text-red-500">*</span>
              </label>
              <input
                id="timeToRead"
                type="text"
                value={timeToRead}
                onChange={(e) => setTimeToRead(e.target.value)}
                placeholder="e.g. 5 min read"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tags">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="anxiety, meditation, sleep"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h2 className="text-xl font-semibold">Content Sections</h2>
            <button 
              type="button" 
              onClick={addSection}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
            >
              + Add Section
            </button>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Section {sectionIndex + 1}</h3>
                {sections.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSection(sectionIndex, 'heading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required={sectionIndex === 0}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={section.description || ''}
                  onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    List Items
                  </label>
                  <button 
                    type="button" 
                    onClick={() => addListItem(sectionIndex)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Item
                  </button>
                </div>

                {section.list && section.list.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem(sectionIndex, itemIndex, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder={`List item ${itemIndex + 1}`}
                    />
                    {section.list!.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeListItem(sectionIndex, itemIndex)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h2 className="text-xl font-semibold">Related Articles</h2>
            <button 
              type="button" 
              onClick={addRelatedArticle}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
            >
              + Add Article
            </button>
          </div>

          {relatedArticles.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No related articles added. Click the button above to add one.
            </div>
          ) : (
            relatedArticles.map((article, articleIndex) => (
              <div key={articleIndex} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Article {articleIndex + 1}</h3>
                  <button 
                    type="button"
                    onClick={() => removeRelatedArticle(articleIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={article.title}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={article.imageUrl || ''}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link
                    </label>
                    <input
                      type="url"
                      value={article.link || ''}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="https://example.com/article"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time to Read
                    </label>
                    <input
                      type="text"
                      value={article.timeToRead || ''}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'timeToRead', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="5 min read"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={article.description}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-8">
          <Link 
            href="/resources" 
            className="mr-4 px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Resource...
              </>
            ) : (
              'Save Resource'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResourceForm;