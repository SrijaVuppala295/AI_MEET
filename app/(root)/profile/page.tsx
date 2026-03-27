import { getUserHistory } from "@/lib/actions/history.action";
import ProfileUI from "@/components/ProfileUI";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const result = await getUserHistory();

    if (!result.success || !result.data) {
        redirect("/sign-in");
    }

    return <ProfileUI data={result.data} />;
}
