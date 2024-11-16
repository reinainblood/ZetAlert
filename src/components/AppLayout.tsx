// src/components/AppLayout.tsx
type AppLayoutProps = {
    children: React.ReactNode;
    className?: string;
};

export function AppLayout({ children, className = "" }: AppLayoutProps) {
    return (
        <main
            className={`min-h-screen ${className}`}
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed', // This ensures the background stays fixed while scrolling
            }}
        >
            {children}
        </main>
    );
}