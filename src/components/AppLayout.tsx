// src/components/AppLayout.tsx
type AppLayoutProps = {
    children: React.ReactNode;
    className?: string;
};

export function AppLayout({ children, className = "" }: AppLayoutProps) {
    return (
        <main
            className={`min-h-screen bg-cover bg-center bg-[url('/background.png')] ${className}`}
        >
            {children}
        </main>
    );
}