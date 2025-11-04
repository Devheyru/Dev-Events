"use client";
import { useState } from "react";

const BookEvent = () => {
  // TODO
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };
  return (
    <div className="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signup!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">
              Email Address <br />
            </label>
            <input
              className="py-3 px-4 mt-4 bg-[#4A756A] rounded-md w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            className="button-submit bg-primary hover:bg-primary/90 w-full cursor-pointer items-center justify-center rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black mt-6"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
