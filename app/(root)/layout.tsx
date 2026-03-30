import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/actions/auth.action';
import AIChatbot from "@/components/AIChatbot";

const RootLayout = async ({ children }: { children: ReactNode }) => {
    const user = await getCurrentUser();

    return (
        <div className="flex flex-col min-h-screen" style={{ background: "#08090D", color: "#fff" }}>
            <Header user={user} />
            <main className="flex-grow">
                {children}
                <AIChatbot />
            </main>
            <Footer />
        </div>
    );
};

export default RootLayout;