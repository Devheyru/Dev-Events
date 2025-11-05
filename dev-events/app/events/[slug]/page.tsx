import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailspage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const slug = await params.then((p) => p.slug);

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <EventDetails params={Promise.resolve(slug)} />
      </Suspense>
    </main>
  );
};

export default EventDetailspage;
