import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Reeltrail — Follow the feed',description:'Your subreddits. One continuous video trail.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
