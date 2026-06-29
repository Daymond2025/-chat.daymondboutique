import { redirect } from 'next/navigation';

// La racine redirige — les liens Facebook pointent vers /p/{slug}
export default function Home() {
  redirect('/p/not-found');
}