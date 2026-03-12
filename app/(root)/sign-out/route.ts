import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/sign-in");
}