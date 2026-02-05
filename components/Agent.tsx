"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { AgentProps } from "@/types";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

const Agent = ({ userName }: AgentProps) => {
    // ✅ correct enum usage
    const status = CallStatus.ACTIVE;
    const isSpeaking = true;

    return (
        <>
            <div className="call-view">
                {/* AI interviewer */}
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI interviewer"
                            width={65}
                            height={65}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                {/* User */}
                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="user avatar"
                            width={120}
                            height={120}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {/* Call controls */}
            <div className="w-full flex justify-center mt-6">
                {status !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call">
            <span
                className={cn(
                    "absolute animate-ping rounded-full opacity-75",
                    status !== CallStatus.CONNECTING && "hidden"
                )}
            />
                        <span>
              {status === CallStatus.INACTIVE || status === CallStatus.FINISHED
                  ? "Call"
                  : "..."}
            </span>
                    </button>
                ) : (
                    <button className="btn-disconnect">End</button>
                )}
            </div>
        </>
    );
};

export default Agent;
