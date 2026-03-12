import { getCurrentUser } from "@/lib/actions/auth.action";
import HomePage from "@/components/HomePage";

const Page = async () => {
    const user = await getCurrentUser();
    return <HomePage user={user} />;
};

export default Page;