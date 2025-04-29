"use client";
import Resource from '@/components/shared/Resource';
import React, { useEffect, useState } from 'react';
import resourceDefaultImg from '../../../../../../assets/icons/resource.png';
import { useParams } from 'next/navigation';

interface ResourceData {
  title: string;
  imageUrl: string;
  description: string;
  sections: Array<{
    heading: string;
    description?: string;
    list?: string[];
  }>;
  relatedArticles?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    timeToRead?: string;
  }>;
  resourceId: string;
  timeToRead: string;
  category: string;
  tags: string[];
  userId?: string;
  bookmarkedBy?: string[];
}
const ResourcePage = () => {
  const params = useParams();
  const resourceId = params.resourceId as string;
  const userId = params.userId as string;
  const [resourceData, setResourceData] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/resources/get-resource', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resourceId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch resource data');
        }
        const data = await response.json();
        setResourceData(data);
      } catch (error:any) {
        console.error('Error fetching resource data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [resourceId, userId]);

  if (loading) return <div className="text-center p-4">Loading resource...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className='flex flex-col mt-4 sm:mt-8 px-4 gap-y-5 w-full items-center'>
      {resourceData && (
        <Resource
          title={resourceData.title}
          imageUrl={resourceData.imageUrl || resourceDefaultImg.src}
          sections={resourceData.sections}
          relatedArticles={resourceData.relatedArticles}
          resourceId={resourceId}
          timeToRead={resourceData.timeToRead}
          category={resourceData.category}
          tags={resourceData.tags}
          userId={userId}
          description={resourceData.description}
          bookmarkedBy={resourceData.bookmarkedBy}
          />
      )}
    </div>
  );
};

export default ResourcePage;
