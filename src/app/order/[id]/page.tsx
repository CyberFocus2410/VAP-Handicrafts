import { OrderConfirmationView } from "@/components/orders/OrderConfirmationView";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params;
  return {
    title: `Order: ${id} | VAP Handicrafts`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { status, error } = await searchParams;

  return (
    <OrderConfirmationView
      orderReference={id}
      initialStatus={status || "paid"}
      error={error}
    />
  );
}
