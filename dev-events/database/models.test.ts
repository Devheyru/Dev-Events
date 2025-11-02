import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Booking, { IBooking } from "./booking.model";
import Event, { IEvent } from "./event.model";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up and close connections
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Booking Model Tests", () => {
  describe("1. Booking model successfully saves with valid data and validates email format", () => {
    it("should save a booking with valid data", async () => {
      // Create a valid event first
      const event = await Event.create({
        title: "Test Event",
        description: "Test Description",
        overview: "Test Overview",
        image: "https://example.com/image.jpg",
        venue: "Test Venue",
        location: "Test Location",
        date: "2024-12-31",
        time: "14:30",
        mode: "online",
        audience: "Developers",
        agenda: ["Introduction", "Main Session"],
        organizer: "Test Organizer",
        tags: ["javascript", "testing"],
      });

      const bookingData = {
        eventId: event._id,
        email: "test@example.com",
      };

      const booking = await Booking.create(bookingData);

      expect(booking).toBeDefined();
      expect(booking.eventId.toString()).toBe(event._id.toString());
      expect(booking.email).toBe("test@example.com");
      expect(booking.createdAt).toBeInstanceOf(Date);
      expect(booking.updatedAt).toBeInstanceOf(Date);
    });

    it("should validate and accept valid email formats", async () => {
      const event = await Event.create({
        title: "Test Event",
        description: "Test Description",
        overview: "Test Overview",
        image: "https://example.com/image.jpg",
        venue: "Test Venue",
        location: "Test Location",
        date: "2024-12-31",
        time: "14:30",
        mode: "online",
        audience: "Developers",
        agenda: ["Introduction"],
        organizer: "Test Organizer",
        tags: ["testing"],
      });

      const validEmails = [
        "user@example.com",
        "test.user@example.com",
        "test+tag@example.co.uk",
        "user123@test-domain.com",
      ];

      for (const email of validEmails) {
        const booking = await Booking.create({
          eventId: event._id,
          email,
        });
        expect(booking.email).toBe(email.toLowerCase());
      }
    });

    it("should reject invalid email formats", async () => {
      const event = await Event.create({
        title: "Test Event",
        description: "Test Description",
        overview: "Test Overview",
        image: "https://example.com/image.jpg",
        venue: "Test Venue",
        location: "Test Location",
        date: "2024-12-31",
        time: "14:30",
        mode: "online",
        audience: "Developers",
        agenda: ["Introduction"],
        organizer: "Test Organizer",
        tags: ["testing"],
      });

      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user @example.com",
        "user@.com",
      ];

      for (const email of invalidEmails) {
        await expect(
          Booking.create({
            eventId: event._id,
            email,
          })
        ).rejects.toThrow(/Please provide a valid email address/);
      }
    });

    it("should convert email to lowercase", async () => {
      const event = await Event.create({
        title: "Test Event",
        description: "Test Description",
        overview: "Test Overview",
        image: "https://example.com/image.jpg",
        venue: "Test Venue",
        location: "Test Location",
        date: "2024-12-31",
        time: "14:30",
        mode: "online",
        audience: "Developers",
        agenda: ["Introduction"],
        organizer: "Test Organizer",
        tags: ["testing"],
      });

      const booking = await Booking.create({
        eventId: event._id,
        email: "TEST@EXAMPLE.COM",
      });

      expect(booking.email).toBe("test@example.com");
    });
  });

  describe("2. Booking model prevents saving if the referenced eventId does not exist", () => {
    it("should throw an error when eventId does not exist", async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();

      await expect(
        Booking.create({
          eventId: nonExistentEventId,
          email: "test@example.com",
        })
      ).rejects.toThrow(
        `Event with ID ${nonExistentEventId} does not exist. Please provide a valid event ID.`
      );
    });

    it("should successfully save when eventId exists", async () => {
      const event = await Event.create({
        title: "Valid Event",
        description: "Test Description",
        overview: "Test Overview",
        image: "https://example.com/image.jpg",
        venue: "Test Venue",
        location: "Test Location",
        date: "2024-12-31",
        time: "14:30",
        mode: "hybrid",
        audience: "Developers",
        agenda: ["Session 1"],
        organizer: "Organizer",
        tags: ["tag1"],
      });

      const booking = await Booking.create({
        eventId: event._id,
        email: "valid@example.com",
      });

      expect(booking.eventId.toString()).toBe(event._id.toString());
    });

    it("should require eventId field", async () => {
      await expect(
        Booking.create({
          email: "test@example.com",
        } as any)
      ).rejects.toThrow(/Event ID is required/);
    });
  });
});

describe("Event Model Tests", () => {
  describe("3. Event model successfully saves with valid data and generates a slug", () => {
    it("should save an event with valid data", async () => {
      const eventData = {
        title: "JavaScript Conference 2024",
        description: "Annual JavaScript conference",
        overview: "Learn about the latest in JavaScript",
        image: "https://example.com/js-conf.jpg",
        venue: "Convention Center",
        location: "San Francisco, CA",
        date: "2024-12-15",
        time: "09:00",
        mode: "hybrid",
        audience: "Developers",
        agenda: ["Keynote", "Workshop", "Networking"],
        organizer: "JS Foundation",
        tags: ["javascript", "conference", "web"],
      };

      const event = await Event.create(eventData);

      expect(event).toBeDefined();
      expect(event.title).toBe(eventData.title);
      expect(event.description).toBe(eventData.description);
      expect(event.slug).toBeDefined();
      expect(event.createdAt).toBeInstanceOf(Date);
      expect(event.updatedAt).toBeInstanceOf(Date);
    });

    it("should automatically generate slug from title", async () => {
      const event = await Event.create({
        title: "React & TypeScript Workshop",
        description: "Workshop description",
        overview: "Workshop overview",
        image: "https://example.com/image.jpg",
        venue: "Tech Hub",
        location: "New York",
        date: "2024-11-20",
        time: "10:00",
        mode: "online",
        audience: "Developers",
        agenda: ["Intro", "Hands-on"],
        organizer: "Tech Academy",
        tags: ["react", "typescript"],
      });

      expect(event.slug).toBe("react-typescript-workshop");
    });

    it("should generate unique slugs for duplicate titles", async () => {
      const eventData = {
        title: "Web Development Summit",
        description: "Summit description",
        overview: "Summit overview",
        image: "https://example.com/image.jpg",
        venue: "Conference Hall",
        location: "Boston",
        date: "2024-10-10",
        time: "11:00",
        mode: "offline",
        audience: "Developers",
        agenda: ["Talk 1", "Talk 2"],
        organizer: "Dev Community",
        tags: ["web", "development"],
      };

      const event1 = await Event.create(eventData);
      const event2 = await Event.create(eventData);

      expect(event1.slug).toBe("web-development-summit");
      expect(event2.slug).toMatch(/^web-development-summit-\d+$/);
      expect(event1.slug).not.toBe(event2.slug);
    });

    it("should handle special characters in title when generating slug", async () => {
      const event = await Event.create({
        title: "Node.js & Express.js: REST API!",
        description: "API description",
        overview: "API overview",
        image: "https://example.com/image.jpg",
        venue: "Tech Space",
        location: "Seattle",
        date: "2024-09-05",
        time: "13:30",
        mode: "online",
        audience: "Backend Developers",
        agenda: ["Setup", "Building APIs"],
        organizer: "Code School",
        tags: ["nodejs", "api"],
      });

      expect(event.slug).toBe("nodejs-expressjs-rest-api");
    });
  });

  describe("4. Event model enforces validation for required fields, mode enum, agenda length, and tags length", () => {
    it("should require all mandatory fields", async () => {
      const requiredFields = [
        "title",
        "description",
        "overview",
        "image",
        "venue",
        "location",
        "date",
        "time",
        "mode",
        "audience",
        "agenda",
        "organizer",
        "tags",
      ];

      for (const field of requiredFields) {
        const eventData: any = {
          title: "Test Event",
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "2024-12-01",
          time: "10:00",
          mode: "online",
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: ["tag1"],
        };

        delete eventData[field];

        await expect(Event.create(eventData)).rejects.toThrow();
      }
    });

    it("should only accept valid mode enum values", async () => {
      const validModes = ["online", "offline", "hybrid"];

      for (const mode of validModes) {
        const event = await Event.create({
          title: `Event ${mode}`,
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "2024-12-01",
          time: "10:00",
          mode,
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: ["tag1"],
        });

        expect(event.mode).toBe(mode);
      }
    });

    it("should reject invalid mode enum values", async () => {
      await expect(
        Event.create({
          title: "Invalid Mode Event",
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "2024-12-01",
          time: "10:00",
          mode: "invalid-mode",
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: ["tag1"],
        })
      ).rejects.toThrow();
    });

    it("should convert mode to lowercase", async () => {
      const event = await Event.create({
        title: "Uppercase Mode Event",
        description: "Description",
        overview: "Overview",
        image: "https://example.com/image.jpg",
        venue: "Venue",
        location: "Location",
        date: "2024-12-01",
        time: "10:00",
        mode: "ONLINE" as any,
        audience: "Audience",
        agenda: ["Item 1"],
        organizer: "Organizer",
        tags: ["tag1"],
      });

      expect(event.mode).toBe("online");
    });

    it("should require at least one agenda item", async () => {
      await expect(
        Event.create({
          title: "No Agenda Event",
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "2024-12-01",
          time: "10:00",
          mode: "online",
          audience: "Audience",
          agenda: [],
          organizer: "Organizer",
          tags: ["tag1"],
        })
      ).rejects.toThrow(/Agenda must contain at least one item/);
    });

    it("should accept multiple agenda items", async () => {
      const event = await Event.create({
        title: "Multi-Agenda Event",
        description: "Description",
        overview: "Overview",
        image: "https://example.com/image.jpg",
        venue: "Venue",
        location: "Location",
        date: "2024-12-01",
        time: "10:00",
        mode: "online",
        audience: "Audience",
        agenda: ["Opening", "Keynote", "Workshops", "Closing"],
        organizer: "Organizer",
        tags: ["tag1"],
      });

      expect(event.agenda).toHaveLength(4);
      expect(event.agenda).toEqual([
        "Opening",
        "Keynote",
        "Workshops",
        "Closing",
      ]);
    });

    it("should require at least one tag", async () => {
      await expect(
        Event.create({
          title: "No Tags Event",
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "2024-12-01",
          time: "10:00",
          mode: "online",
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: [],
        })
      ).rejects.toThrow(/At least one tag is required/);
    });

    it("should accept multiple tags", async () => {
      const event = await Event.create({
        title: "Multi-Tag Event",
        description: "Description",
        overview: "Overview",
        image: "https://example.com/image.jpg",
        venue: "Venue",
        location: "Location",
        date: "2024-12-01",
        time: "10:00",
        mode: "online",
        audience: "Audience",
        agenda: ["Item 1"],
        organizer: "Organizer",
        tags: ["javascript", "typescript", "react", "nodejs"],
      });

      expect(event.tags).toHaveLength(4);
      expect(event.tags).toEqual([
        "javascript",
        "typescript",
        "react",
        "nodejs",
      ]);
    });
  });

  describe("5. Event model normalizes date and time formats before saving", () => {
    it("should normalize date to ISO format (YYYY-MM-DD)", async () => {
      const event = await Event.create({
        title: "Date Normalization Test",
        description: "Description",
        overview: "Overview",
        image: "https://example.com/image.jpg",
        venue: "Venue",
        location: "Location",
        date: "12/31/2024",
        time: "14:30",
        mode: "online",
        audience: "Audience",
        agenda: ["Item 1"],
        organizer: "Organizer",
        tags: ["tag1"],
      });

      expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(event.date).toBe("2024-12-31");
    });

    it("should accept ISO date format", async () => {
      const event = await Event.create({
        title: "ISO Date Event",
        description: "Description",
        overview: "Overview",
        image: "https://example.com/image.jpg",
        venue: "Venue",
        location: "Location",
        date: "2024-06-15",
        time: "09:00",
        mode: "offline",
        audience: "Audience",
        agenda: ["Item 1"],
        organizer: "Organizer",
        tags: ["tag1"],
      });

      expect(event.date).toBe("2024-06-15");
    });

    it("should reject invalid date formats", async () => {
      await expect(
        Event.create({
          title: "Invalid Date Event",
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "invalid-date",
          time: "10:00",
          mode: "online",
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: ["tag1"],
        })
      ).rejects.toThrow(/Invalid date format/);
    });

    it("should validate time format (HH:MM)", async () => {
      const validTimes = ["00:00", "09:30", "14:45", "23:59"];

      for (const time of validTimes) {
        const event = await Event.create({
          title: `Time Test ${time}`,
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: "2024-12-01",
          time,
          mode: "online",
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: ["tag1"],
        });

        expect(event.time).toBe(time);
      }
    });

    it("should reject invalid time formats", async () => {
      const invalidTimes = ["25:00", "12:60", "1:30", "12:5", "invalid"];

      for (const time of invalidTimes) {
        await expect(
          Event.create({
            title: "Invalid Time Event",
            description: "Description",
            overview: "Overview",
            image: "https://example.com/image.jpg",
            venue: "Venue",
            location: "Location",
            date: "2024-12-01",
            time,
            mode: "online",
            audience: "Audience",
            agenda: ["Item 1"],
            organizer: "Organizer",
            tags: ["tag1"],
          })
        ).rejects.toThrow(/Invalid time format/);
      }
    });

    it("should normalize various date formats to ISO", async () => {
      const dateFormats = [
        { input: "2024-08-20", expected: "2024-08-20" },
        { input: "08/20/2024", expected: "2024-08-20" },
        { input: "Aug 20, 2024", expected: "2024-08-20" },
      ];

      for (const { input, expected } of dateFormats) {
        const event = await Event.create({
          title: `Date Format ${input}`,
          description: "Description",
          overview: "Overview",
          image: "https://example.com/image.jpg",
          venue: "Venue",
          location: "Location",
          date: input,
          time: "10:00",
          mode: "online",
          audience: "Audience",
          agenda: ["Item 1"],
          organizer: "Organizer",
          tags: ["tag1"],
        });

        expect(event.date).toBe(expected);
      }
    });
  });
});
