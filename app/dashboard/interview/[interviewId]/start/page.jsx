"use client"

import React , {useEffect , useState} from 'react'
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const QuestionsSection = dynamic(() => import('./_components/QuestionsSection'), { ssr: false });
const RecordAnswerSection = dynamic(() => import('./_components/RecordAnswerSection'), { ssr: false });

function StartInterview() {
    const { interviewId } = useParams(); 
    const [interviewData , setInterviewData] = useState();
    const [mockInterviewQuestion , setMockInterviewQuestion] = useState([]);
    const [activeQuestionIndex , setActiveQuestionIndex]=useState(0);

    useEffect(()=>{
        GetInterviewDetails();
    }, []);

    const GetInterviewDetails = async () => {
        const result = await db.select().from(MockInterview)
          .where(eq(MockInterview.mockId, interviewId));

        const jsonMockResp=JSON.parse(result[0].jsonMockResp);
        console.log(jsonMockResp);
        setMockInterviewQuestion(jsonMockResp);
        setInterviewData(result[0]);
    };

  return (
    <div className='p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb:1'>

            {/* Questions */}
           
                <QuestionsSection 
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    setActiveQuestionIndex={setActiveQuestionIndex}
                    />

            {/* video/audio recording */}

                 <RecordAnswerSection
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    setActiveQuestionIndex={setActiveQuestionIndex}
                    interviewData={interviewData}
                 />
        </div>

        <div className='flex justify-end gap-4'>
            {activeQuestionIndex>0&&
             <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex - 1)}>Previous Question</Button>}
             {activeQuestionIndex!= mockInterviewQuestion?.length-1&&
             <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>Next Question</Button>}
            {activeQuestionIndex == mockInterviewQuestion?.length-1&&
            <Link href={'/dashboard/interview/' + interviewData?.mockId+'/feedback'} >
            <Button>End Interview</Button>
            </Link>}
        
        </div>
    </div>
  )
}

export default StartInterview
