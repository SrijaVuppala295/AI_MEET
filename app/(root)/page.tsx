import { getCurrentUser } from "@/lib/auth";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

const Page = async () => {
    const user = await getCurrentUser();
    return <HomePage user={user} />;
};

export default Page;