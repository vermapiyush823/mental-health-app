"use server";
import Mood_Tracker from '../../../components/shared/Mood_Tracker'
import React from 'react'
import { getUserId } from '../../../../lib/auth'
const page = async () => {
    const userId = await getUserId();
  return (
    <div>
        <Mood_Tracker userId={userId} />
    </div>
  )
}

export default page