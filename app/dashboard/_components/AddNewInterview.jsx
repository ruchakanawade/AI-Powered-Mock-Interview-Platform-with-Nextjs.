"use client"

import React, { useState , useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { chatSession } from '@/utils/GeminiAIModal'
import { LoaderCircle } from 'lucide-react'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { db } from '@/utils/db'
import { useRouter } from 'next/navigation'

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false)
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience ,setJobExperience] = useState();
  const [loading  , setLoading] = useState(false);
  const [jsonResponse , setJsonResponse] = useState([]);
  const {user}=useUser();
  const router=useRouter();

    const onSubmit = async (e) => {
      setLoading(true);
      e.preventDefault();

      const prompt = `
      Job position: ${jobPosition}
      Job description: ${jobDesc}
      Years of experience: ${jobExperience}

      Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format.
      Return an array of objects with fields:
      - question
      - answer

      Only respond with valid JSON.
      `;

      try {
        const result = await chatSession.sendMessage(prompt);
        console.log("Full Result:", result);

        if (result?.response?.text && typeof result.response.text === "function") {
          let responseText = await result.response.text();

          responseText = responseText
            .replace(/^```json/, '')
            .replace(/^```/, '')
            .replace(/```$/, '')
            .trim();

          try {
            const parsed = JSON.parse(responseText);
            console.log("✅ Parsed AI Response:", parsed);

            setJsonResponse(parsed); // save to state if needed

            // Insert into DB
            const resp = await db.insert(MockInterview)
              .values({
                mockId: uuidv4(),
                jsonMockResp: responseText,
                jobPosition: jobPosition,
                jobDesc: jobDesc,
                jobExperience: jobExperience,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-YYYY'),
              })
              .returning({ mockId: MockInterview.mockId });

            console.log("✅ Inserted ID:", resp);

            if(resp){
              setOpenDialog(false);
              router.push('/dashboard/interview/'+resp[0]?.mockId)
            }


          } catch (jsonErr) {
            console.error("❌ JSON parse error:", jsonErr);
            console.log("⚠️ Raw responseText:", responseText);
          }
        } else {
          console.error("❌ Unexpected structure from Gemini:", result);
        }
      } catch (error) {
        console.error("🔥 Error communicating with Gemini:", error);
      }

      setLoading(false);
    };



  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
        onClick={() => setOpenDialog(true)}>

        <h2 className='text-lg text-center'>+ Add New</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-full max-w-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>

            <form onSubmit={onSubmit}>
                <div> 
                    <h2>Add details about your job position/role, job description, and years of experience</h2>

                    <div className='mt-7  my-3'>
                        <label>Job Role/Job Position</label>
                        <Input placeholder="Ex. Full Stack Developer" required
                        onChange={(event)=>setJobPosition(event.target.value)}/>
                    </div>

                    <div className='my-3'>
                        <label>Job Description/Tech Stack (In Short)</label>
                        <Textarea placeholder="Ex. React , Angular , Node.js, Mysql, etc" required
                        onChange={(event)=>setJobDesc(event.target.value)}/>
                    </div>

                    <div className='my-3'>
                        <label>Years of experience</label>
                        <Input placeholder="Ex. 5" type="number" max="100" required
                        onChange={(event)=>setJobExperience(event.target.value)}/>
                    </div>


                </div>

                <div className='flex gap-5 justify-end'>
                    <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading? <>
                        <LoaderCircle className='animate-spin'/>'Generating from AI'
                         </>:'Start Interview'}</Button>
                </div>
            </form>
        </DialogContent>


      </Dialog>
    </div>
  )
}

export default AddNewInterview
