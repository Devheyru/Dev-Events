import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  "use cache";
  cacheLife("hours");
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not defined!");
  }
  const res = await fetch(`${BASE_URL}/api/events`);
  const { events } = await res.json();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev Event <br /> you can&apos;t miss out{" "}
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups and Conferences all in one place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3 id="events">Featured Events</h3> {/* Events List */}
        <ul className="events list-none ">
          {events &&
            events.length > 0 &&
            events.map((event: IEvent, index: number) => (
              <li key={`${event.title}-${index}`}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
