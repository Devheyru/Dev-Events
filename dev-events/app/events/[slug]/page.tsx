import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

// Pass the params object into the Suspense-wrapped server component and
// avoid unwrapping the promise at the route level. The child component
// (EventDetails) will await params inside the Suspense boundary.
const EventDetailspage = ({ params }: { params: any }) => {
  return (
    <main>
      <Suspense fallback={<p>Loading...</p>}>
        {/* params may be a Promise in Next.js — pass through without unwrapping
            and let EventDetails await it inside the Suspense boundary. */}
        <EventDetails {...({ params } as any)} />
      </Suspense>
    </main>
  );
};

export default EventDetailspage;
