"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

  // Theme handling
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Make sure component is mounted before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define dynamic theme mode
  const isDarkMode = mounted && resolvedTheme === 'dark';

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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };
  
  // Theme-dependent styles
  const cardBgClass = isDarkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-100";
  const headingClass = isDarkMode ? "text-white" : "text-gray-900";
  const subHeadingClass = isDarkMode ? "text-gray-300" : "text-gray-700";
  const textClass = isDarkMode ? "text-gray-300" : "text-gray-700";
  const mutedTextClass = isDarkMode ? "text-gray-500" : "text-gray-500";
  const borderClass = isDarkMode ? "border-gray-700" : "border-gray-200";
  const inputBgClass = isDarkMode ? "bg-gray-700" : "bg-white";
  const inputBorderClass = isDarkMode ? "border-gray-600" : "border-gray-300";
  const inputFocusClass = isDarkMode 
    ? "focus:border-purple-500 focus:ring-purple-500" 
    : "focus:border-indigo-500 focus:ring-indigo-500";
  const buttonGradientClass = isDarkMode 
    ? "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white" 
    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white";
  const secondaryButtonClass = isDarkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
    : "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-200";
  const dangerButtonClass = isDarkMode
    ? "text-red-400 hover:text-red-300"
    : "text-red-600 hover:text-red-700";
  const successAlertClass = isDarkMode
    ? "bg-green-900/50 border-green-700 text-green-300"
    : "bg-green-50 border-green-500 text-green-700";
  const errorAlertClass = isDarkMode
    ? "bg-red-900/50 border-red-700 text-red-300"
    : "bg-red-50 border-red-500 text-red-700";

  // Early return if not mounted
  if (!mounted) {
    return <div className="h-screen"></div>;
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={`max-w-5xl mx-auto py-8 px-4 sm:px-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
    >
      <motion.div 
        variants={fadeInUp}
        className="mb-8 flex items-center justify-between"
      >
        <h1 className={`text-3xl font-bold ${headingClass}`}>Add New Resource</h1>
        <Link 
          href="/resources" 
          className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors duration-300`}
        >
          <span>Back to Resources</span>
        </Link>
      </motion.div>

      <motion.form 
        variants={fadeInUp}
        onSubmit={handleSubmit} 
        className={`${cardBgClass} shadow-md rounded-lg p-6 border transition-colors duration-300`}
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-md border-l-4 ${errorAlertClass}`}
          >
            <p className="flex items-center">
              <XMarkIcon className="h-5 w-5 mr-2" />
              {error}
            </p>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-md border-l-4 ${successAlertClass}`}
          >
            <p>{success}</p>
          </motion.div>
        )}

        <div className="mb-6">
          <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${borderClass} ${headingClass}`}>Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-1`} htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textClass} mb-1`}>
                Resource Image <span className="text-red-500">*</span>
              </label>
              
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-1">
                  <div className={`flex justify-center px-6 pt-5 pb-6 border-2 ${isDarkMode ? 'border-gray-700 border-dashed' : 'border-gray-300 border-dashed'} rounded-md transition-colors duration-300`}>
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
                          className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
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
                      
                      <div className="flex justify-center text-sm">
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
                          className="relative cursor-pointer rounded-md font-medium focus-within:outline-none"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={triggerFileInput}
                            className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-600 hover:text-indigo-700'} transition-colors duration-300`}
                          >
                            Upload a file
                          </motion.button>
                        </label>
                      </div>
                      <p className={`text-xs ${mutedTextClass}`}>PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col space-y-2">
                    <label className={`block text-sm font-medium ${textClass}`}>
                      Or provide an image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(e)}
                      placeholder="https://example.com/image.jpg"
                      className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                    />
                    <p className={`text-xs ${mutedTextClass}`}>
                      Either upload an image or provide a URL. If both are provided, the uploaded image will be used.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-1`} htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-1`} htmlFor="timeToRead">
                Time to Read <span className="text-red-500">*</span>
              </label>
              <input
                id="timeToRead"
                type="text"
                value={timeToRead}
                onChange={(e) => setTimeToRead(e.target.value)}
                placeholder="e.g. 5 min read"
                className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textClass} mb-1`} htmlFor="description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${textClass} mb-1`} htmlFor="tags">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="anxiety, meditation, sleep"
                className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className={`flex items-center justify-between mb-4 pb-2 border-b ${borderClass}`}>
            <h2 className={`text-xl font-semibold ${headingClass}`}>Content Sections</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button" 
              onClick={addSection}
              className={`${buttonGradientClass} flex items-center px-3 py-1.5 rounded-lg text-sm shadow-sm transition-all duration-300`}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Section
            </motion.button>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={`mb-6 p-4 border rounded-md ${borderClass}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-medium ${textClass}`}>Section {sectionIndex + 1}</h3>
                {sections.length > 1 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className={`${dangerButtonClass} transition-colors duration-300`}
                  >
                    Remove
                  </motion.button>
                )}
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${textClass} mb-1`}>
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSection(sectionIndex, 'heading', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                  required={sectionIndex === 0}
                />
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${textClass} mb-1`}>
                  Description
                </label>
                <textarea
                  value={section.description || ''}
                  onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium ${textClass}`}>
                    List Items
                  </label>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    onClick={() => addListItem(sectionIndex)}
                    className={`${buttonGradientClass} flex items-center px-3 py-1.5 rounded-lg text-sm shadow-sm transition-all duration-300`}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Item
                  </motion.button>
                </div>

                {section.list && section.list.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem(sectionIndex, itemIndex, e.target.value)}
                      className={`flex-grow px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                      placeholder={`List item ${itemIndex + 1}`}
                    />
                    {section.list!.length > 1 && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => removeListItem(sectionIndex, itemIndex)}
                        className={`ml-2 ${dangerButtonClass} transition-colors duration-300`}
                      >
                        ✕
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className={`flex items-center justify-between mb-4 pb-2 border-b ${borderClass}`}>
            <h2 className={`text-xl font-semibold ${headingClass}`}>Related Articles</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button" 
              onClick={addRelatedArticle}
              className={`${buttonGradientClass} flex items-center px-3 py-1.5 rounded-lg text-sm shadow-sm transition-all duration-300`}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Article
            </motion.button>
          </div>

          {relatedArticles.length === 0 ? (
            <div className={`text-center py-4 ${mutedTextClass}`}>
              No related articles added. Click the button above to add one.
            </div>
          ) : (
            relatedArticles.map((article, articleIndex) => (
              <div key={articleIndex} className={`mb-4 p-4 border rounded-md ${borderClass}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-medium ${textClass}`}>Article {articleIndex + 1}</h3>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => removeRelatedArticle(articleIndex)}
                    className={`${dangerButtonClass} transition-colors duration-300`}
                  >
                    Remove
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-1`}>
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={article.title}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-1`}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={article.imageUrl || ''}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'imageUrl', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-1`}>
                      Link
                    </label>
                    <input
                      type="url"
                      value={article.link || ''}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'link', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                      placeholder="https://example.com/article"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-1`}>
                      Time to Read
                    </label>
                    <input
                      type="text"
                      value={article.timeToRead || ''}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'timeToRead', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                      placeholder="5 min read"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${textClass} mb-1`}>
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={article.description}
                      onChange={(e) => updateRelatedArticle(articleIndex, 'description', e.target.value)}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-md ${inputBgClass} ${inputBorderClass} ${textClass} ${inputFocusClass} focus:outline-none focus:ring-2 transition-colors duration-300`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/resources" 
              className={`inline-flex items-center justify-center px-5 py-2 rounded-lg ${secondaryButtonClass} transition-all duration-300 min-w-[100px]`}
            >
              Cancel
            </Link>
          </motion.div>
          
          <motion.button 
            whileHover={!isSubmitting ? { scale: 1.05 } : undefined}
            whileTap={!isSubmitting ? { scale: 0.95 } : undefined}
            type="submit" 
            className={`inline-flex items-center justify-center px-5 py-2 rounded-lg ${buttonGradientClass} shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] transition-all duration-300`}
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
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AddResourceForm;