import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";
import { getAllEvents } from "@/lib/actions/event.actions";

const page = async () => {
  "use cache";
  cacheLife("hours");
  // Fetch events directly from the database on the server to avoid
  // making an HTTP request to our own API during build/prerender.
  const events = await getAllEvents();

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
