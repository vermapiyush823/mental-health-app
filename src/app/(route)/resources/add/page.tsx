"use server";
import React, { useState, useEffect } from 'react';
import AddResourceForm from '../../../../components/shared/AddResourceForm';
import { getUserId } from "../../../../../lib/auth";

const AddResourcePage = async () => {
    const userId =  await getUserId();
    if(!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return <AddResourceForm userId={userId} />;
};

export default AddResourcePage;