import { OrderConfirmationView } from "@/components/orders/OrderConfirmationView";
import { getOrderByReference } from "@/server/orders/service";

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

  const storedOrder = getOrderByReference(id);
  const effectiveStatus = status || storedOrder?.status || "verification_pending";

  return (
    <OrderConfirmationView
      orderReference={id}
      initialStatus={effectiveStatus}
      error={error}
    />
  );
}
