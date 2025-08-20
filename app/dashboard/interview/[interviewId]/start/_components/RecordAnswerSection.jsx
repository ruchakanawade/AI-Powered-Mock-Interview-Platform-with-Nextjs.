"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatSession } from '@/utils/GeminiAIModal';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import moment from 'moment';

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, setActiveQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState('');
  const user = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (results.length > 0) {
      const fullText = results.map(r => r.transcript).join(' ');
      setUserAnswer(fullText);
    }
  }, [results]);


  useEffect(()=>{
    if(!isRecording&&userAnswer.length>10){
      UpdateUserAnswer();
    }

  },[userAnswer])

  
  const StartStopRecording = async () => {
    if (isRecording) {
      
      stopSpeechToText();

    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer= async()=>{

        console.log(userAnswer);
        setLoading(true);
       const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, 
User Answer: ${userAnswer}. Based on the question and user's answer, 
please give us a rating (out of 5) and feedback (in 3–5 lines) 
in JSON format with 'rating' and 'feedback' fields.`;

      try {
        const result = await chatSession.sendMessage(feedbackPrompt);
        const mockJsonResp = (await result.response.text())
          .replace(/^```json/, '')
          .replace(/^```/, '')
          .replace(/```$/, '')
          .trim();

        console.log(mockJsonResp);
        const JsonFeedbackResp = JSON.parse(mockJsonResp);

        const resp = await db.insert(UserAnswer).values({
          mockIdRef: interviewData.mockId,
          question: mockInterviewQuestion[activeQuestionIndex]?.question,
          correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
          userAns: userAnswer,
          feedback: JsonFeedbackResp?.feedback,
          rating: JsonFeedbackResp?.rating,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-yyyy')
        });

        if (resp) {
          toast.success('User answer recorded successfully!');
             setUserAnswer('');
             setResults([]);
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('Something went wrong while processing your answer.');
      }

      setResults([]);
      setLoading(false);
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={'/webcam.png'}
          width={200}
          height={200}
          className="absolute"
          alt="webcam"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: '100%',
            zIndex: 10,
          }}
        />
      </div>

      <Button disabled={loading} variant="outline" className="my-10" onClick={StartStopRecording}>
        {isRecording ? (
          <h2 className="text-red-600 flex gap-2">
            <Mic /> Stop Recording
          </h2>
        ) : (
          "Record Answer"
        )}
      </Button>

      {/* <Button onClick={() => console.log(userAnswer)}>Show User Answer</Button> */}

    </div>
  );
}

export default RecordAnswerSection;
