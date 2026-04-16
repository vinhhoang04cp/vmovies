import ViewerHeader from '@/Components/Viewer/ViewerHeader';
import ViewerFooter from '@/Components/Viewer/ViewerFooter';

export default function ViewerLayout({ children }) {
    return (
        <div className="viewer-layout">
            <ViewerHeader />
            <main className="viewer-layout__main">
                {children}
            </main>
            <ViewerFooter />
        </div>
    );
}
