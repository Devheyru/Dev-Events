import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "./BookEvent";
import EventCard from "./EventCard";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not defined");
}

const bookings = 10;

const EventDetailsItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2> Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);
const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetails = async ({ params }: { params: Promise<string> }) => {
  "use cache";
  cacheLife("hours");

  const slug = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
    next: { revalidate: 60 }, // Add caching strategy
  });

  if (!request.ok) {
    if (request.status === 404) {
      return notFound();
    }
    throw new Error(`Failed to fetch event: ${request.status}`);
  }

  const { event } = await request.json();
  if (!event) return notFound();

  const bookings = 10;
  const similarEvents: IEvent[] = (await getSimilarEventsBySlug(
    slug
  )) as unknown as IEvent[];

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{event.description}</p>
      </div>
      <div className="details">
        {/* Left side for Event content */}
        <div className="content">
          <Image
            src={event.image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{event.overview}</p>
          </section>
          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailsItem
              icon="/icons/calendar.svg"
              alt="date"
              label={event.date}
            />
            <EventDetailsItem
              icon="/icons/clock.svg"
              alt="time"
              label={event.time}
            />
            <EventDetailsItem
              icon="/icons/pin.svg"
              alt="location"
              label={event.location}
            />
            <EventDetailsItem
              icon="/icons/mode.svg"
              alt="mode"
              label={event.mode}
            />
            <EventDetailsItem
              icon="/icons/audience.svg"
              alt="audience"
              label={event.audience}
            />
          </section>
          <EventAgenda agendaItems={event.agenda} />
          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{event.organizer}</p>
          </section>
          <EventTags
            tags={
              event.tags?.[0]
                ? (() => {
                    try {
                      return JSON.parse(event.tags[0]);
                    } catch {
                      return [];
                    }
                  })()
                : []
            }
          />
        </div>
        {/* Right side for Event booking */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book your spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first one to book your spot!</p>
            )}
            <BookEvent eventId={event._id} slug={event.slug} />
          </div>
        </aside>
      </div>
      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: IEvent) => (
              <EventCard key={similarEvent.title} {...similarEvent} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
