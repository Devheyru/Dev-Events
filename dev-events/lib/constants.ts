export type EventItem = {
  title: string;
  image: string; // path under /public, e.g. '/images/xyz.jpg'
  slug: string; // url-friendly id
  location: string;
  date: string; // ISO date (YYYY-MM-DD) or user-friendly string
  time: string; // start time (local)
  description?: string;
  link?: string;
  tags?: string[];
};

export const events: EventItem[] = [
  {
    title: "React Summit 2026",
    image: "/images/event1.png",
    slug: "react-summit-2026",
    location: "Amsterdam, NL",
    date: "2026-04-14",
    time: "09:00 AM",
    description:
      "A large community-driven conference focused on React, React Native and the React ecosystem — talks, workshops and networking.",
    link: "https://reactsummit.com/",
    tags: ["react", "frontend", "javascript"],
  },

  {
    title: "JSConf EU 2026",
    image: "/images/event2.png",
    slug: "jsconf-eu-2026",
    location: "Berlin, DE",
    date: "2026-05-20",
    time: "10:00 AM",
    description:
      "A leading JavaScript conference in Europe covering modern JS, tooling, and platform innovation.",
    link: "https://jsconf.eu/",
    tags: ["javascript", "web", "performance"],
  },

  {
    title: "Next.js Conf 2026",
    image: "/images/event3.png",
    slug: "nextjs-conf-2026",
    location: "Online",
    date: "2026-02-10",
    time: "11:00 AM",
    description:
      "Official Next.js conference with product announcements, talks and workshops from the Vercel and Next.js community.",
    link: "https://nextjs.org/conf",
    tags: ["nextjs", "react", "serverless"],
  },

  {
    title: "ETHGlobal Hackathon 2026",
    image: "/images/event4.png",
    slug: "ethglobal-hackathon-2026",
    location: "Hybrid (Online + Various Cities)",
    date: "2026-06-05",
    time: "06:00 PM",
    description:
      "One of the largest Web3 hackathons — teams build on Ethereum and Web3 primitives over several days. Great for devs exploring blockchain tooling.",
    link: "https://ethglobal.co/",
    tags: ["web3", "blockchain", "hackathon"],
  },

  {
    title: "HackZurich 2026",
    image: "/images/event5.png",
    slug: "hackzurich-2026",
    location: "Zurich, CH",
    date: "2026-09-18",
    time: "09:30 AM",
    description:
      "Europe's largest hackathon bringing students and professionals together to build creative products and prototypes over 48 hours.",
    link: "https://hackzurich.com/",
    tags: ["hackathon", "innovation", "product"],
  },

  {
    title: "GitHub Universe 2026",
    image: "/images/event6.png",
    slug: "github-universe-2026",
    location: "San Francisco, CA",
    date: "2026-11-03",
    time: "09:00 AM",
    description:
      "GitHub's flagship event focused on the developer experience, collaboration, security and product updates.",
    link: "https://github.com/universe",
    tags: ["devops", "tools", "collaboration"],
  },
];

export default events;
