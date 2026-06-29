import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import ChatWindow from '@/components/ChatWindow';
import { fetchProduct } from '@/lib/api';

interface Props {
  params: { slug: string };
}

// Métadonnées dynamiques pour le partage Facebook
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { product } = await fetchProduct(params.slug);
    return {
      title: `${product.name} — Daymond`,
      description: product.description,
      openGraph: {
        title: `${product.name} — Daymond`,
        description: product.description,
        images: product.image_url ? [product.image_url] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Daymond Chat' };
  }
}

export default async function ChatPage({ params }: Props) {
  let product, agent;

  try {
    const data = await fetchProduct(params.slug);
    product = data.product;
    agent   = data.agent;
  } catch {
    notFound();
  }

  return (
    <ChatWindow
      slug={params.slug}
      initialProduct={product}
      initialAgent={agent}
    />
  );
}