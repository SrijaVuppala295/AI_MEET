"use client"; // Make sure this is a client component

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Assuming this utility function is available
import { getTechLogos } from '@/lib/utils'; // Assuming this function is in a file like utils.ts

// Define the types that are missing in your original code
interface TechIconProps {
    techStack: string[];
}

interface TechLogo {
    tech: string;
    url: string;
}

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
    // State to hold the fetched tech icons
    const [techIcons, setTechIcons] = useState<TechLogo[]>([]);

    // useEffect hook to fetch data on the client side after the component mounts
    useEffect(() => {
        const fetchIcons = async () => {
            const icons = await getTechLogos(techStack);
            setTechIcons(icons);
        };

        fetchIcons();
    }, [techStack]); // The effect will re-run if techStack changes

    return (
        <div className="flex flex-row">
            {techIcons.slice(0, 3).map(({ tech, url }, index) => (
                <div
                    key={tech}
                    className={cn(
                        "relative group bg-dark-300 rounded-full p-2 flex flex-center",
                        index >= 1 && "-ml-3"
                    )}
                >
                    <span className="tech-tooltip">{tech}</span>

                    <Image
                        src={url}
                        alt={tech}
                        width={100}
                        height={100}
                        className="size-5"
                    />
                </div>
            ))}
        </div>
    );
};

export default DisplayTechIcons;