"use client";
import Resource from '@/components/shared/Resource';
import React, { useEffect, useState } from 'react';
import resourceDefaultImg from '../../../../../../assets/icons/resource.png';
import { useParams } from 'next/navigation';



const ResourcePage = async () => {
  
  const params = useParams();
  const resourceId = params.resourceId as string;
  const userId = params.id as string;

  return (
    <div className='flex flex-col mt-4 sm:mt-8 px-4  gap-y-5 w-full items-center'>
      <Resource
        resourceId={resourceId}
        userId={userId || ""} // Pass userId to Resource component
        title="Resource Details"
        imageUrl={resourceDefaultImg.src}
        sections={[
          {
            heading: "Section 1",
            description: "Description for section 1",
            list: ["Item 1", "Item 2", "Item 3"]
          },
          {
            heading: "Section 2",
            description: "Description for section 2"
          }
        ]}
        relatedArticles={[
          {
            title: "Related Article 1",
            description: "Description for related article 1",
            imageUrl: resourceDefaultImg.src,
            link: "/resources/related-article-1",
            timeToRead: "5 min read"
          },
          {
            title: "Related Article 2",
            description: "Description for related article 2",
            imageUrl: resourceDefaultImg.src,
            link: "/resources/related-article-2",
            timeToRead: "10 min read"
          }
        ]}
        category="Category 1"
        tags={["Tag 1", "Tag 2"]}
        timeToRead="5 min read"
    
      />
    </div>
  );
};

export default ResourcePage;
