"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InterviewCardProps, Feedback } from "@/types";
import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "./DisplayTechIcons";

const InterviewCard = ({
    interviewId,
    role,
    type,
    techstack,
    createdAt,
}: InterviewCardProps) => {
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // ✅ Generate random image ONLY on client
    useEffect(() => {
        setCoverImage(getRandomInterviewCover());
    }, []);

    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(createdAt).format("MMM D, YYYY");

    return (
        <div className="card-border w-[360px] max-sm:w-full min-h-96">
            <div className="card-interview">
                <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
                    <p className="badge-text">{normalizedType}</p>
                </div>

                {coverImage && (
                    <Image
                        src={coverImage}
                        alt="cover image"
                        width={90}
                        height={90}
                        className="rounded-full object-cover size-[90px]"
                        priority
                    />
                )}

                <h3 className="mt-5 capitalize">{role} Interview</h3>

                <div className="flex flex-row gap-5 mt-3">
                    <div className="flex flex-row gap-2">
                        <Image src="/calender.svg" alt="calendar" width={22} height={22} />
                        <p>{formattedDate}</p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" alt="star" width={22} height={22} />
                        <p>{feedback?.totalScore ?? "---"}/100</p>
                    </div>
                </div>

                <p className="line-clamp-2 mt-5">
                    {feedback?.finalAssessment ??
                        "You haven't taken the interview yet. Take it now to improve your skills."}
                </p>
            </div>

            <div className="flex flex-row justify-between items-center mt-4">
                <DisplayTechIcons techStack={techstack} />

                <Button className="btn-primary" asChild>
                    <Link
                        href={
                            feedback
                                ? `/interview/${interviewId}/feedback`
                                : `/interview/${interviewId}`
                        }
                    >
                        {feedback ? "Check Feedback" : "View Interview"}
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default InterviewCard;
