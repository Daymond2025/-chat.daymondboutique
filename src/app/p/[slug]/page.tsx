import type { Metadata } from 'next';

import ChatWindow from '@/components/ChatWindow';
import { fetchProduct } from '@/lib/api';
import type { Agent, Product } from '@/lib/types';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { product } = await fetchProduct(params.slug);
    if (product) {
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
    }
  } catch {
    // silencieux
  }
  return {
    title: 'Daymond — Commandez en direct',
    description: 'Discutez avec un agent Daymond pour trouver votre ordinateur idéal.',
  };
}

export default async function ChatPage({ params }: Props) {
  let product: Product | null = null;
  let agent: Agent | null = null;

  try {
    const data = await fetchProduct(params.slug);
    product = data.product;
    agent   = data.agent;
  } catch {
    // Erreur réseau — le ChatWindow démarrera quand même côté client
  }

  // On rend toujours le chat, produit présent ou non.
  // Si aucun agent n'est disponible côté serveur, le ChatWindow tentera
  // de démarrer et affichera un message d'erreur si le backend ne répond pas.
  return (
    <ChatWindow
      slug={params.slug}
      initialProduct={product}
      initialAgent={agent}
    />
  );
}