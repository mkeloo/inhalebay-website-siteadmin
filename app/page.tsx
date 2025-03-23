// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard/analytics/ga4-analytics');
}