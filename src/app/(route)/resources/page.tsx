import React from 'react';
import ResourcesList from '@/components/shared/ResourcesList';
import { getUserId } from '../../../../lib/auth';
const ResourcesPage =  async() => {
    const userId = await getUserId();
  return (
    <div>
        <div className="flex flex-col p-6 gap-y-5 w-full items-center">
            <ResourcesList userId={userId} />
        </div>
    </div>
  );
};

export default ResourcesPage;