// Build trigger: vercel-fix-v3
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { interviewCovers, mappings } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomInterviewCover() {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return interviewCovers[randomIndex];
}

export async function getTechLogos(techStack: string[]) {
  return techStack.map((tech) => {
    const key = tech.toLowerCase().replace(/\s/g, "");
    const techName = (mappings as any)[key] || key;

    // Default to .png, but handle common .svg logos we saw in public/
    let extension = "png";
    if (["react", "nextjs", "tailwindcss", "typescript", "javascript"].includes(techName)) {
      extension = "svg";
    }

    // Special cases based on file list in public/
    if (techName === "react") return { tech, url: "/react.svg" };
    if (techName === "tailwindcss") return { tech, url: "/tailwind.svg" };
    
    // Check if it's one of the covers or company logos in public root
    return { tech, url: `/${techName}.${extension}` };
  });
}
