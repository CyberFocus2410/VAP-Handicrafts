import { OrderConfirmationView } from "@/components/orders/OrderConfirmationView";

interface OrderStatusPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
}

export async function generateMetadata({ params }: OrderStatusPageProps) {
  const { orderId } = await params;
  return {
    title: `Order Status: ${orderId} | VAP Handicrafts`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderStatusPage({ params, searchParams }: OrderStatusPageProps) {
  const { orderId } = await params;
  const { status, error } = await searchParams;

  return (
    <OrderConfirmationView
      orderReference={orderId}
      initialStatus={status || "paid"}
      error={error}
    />
  );
}
