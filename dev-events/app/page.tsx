import ExploreBtn from "@/components/ExploreBtn";
import React from "react";

const page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev Event <br /> you can&apos;t miss out{" "}
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups and Conferences all in one place
      </p>

      <ExploreBtn />
    </section>
  );
};

export default page;
