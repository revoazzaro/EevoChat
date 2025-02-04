import React from "react";

const chat = () => {
  return (
    <div className="h-full">
      <form
        action=""
        className="flex w-auto justify-center fixed bottom-0 items-end inset-x-0 mx-auto mb-8"
      >
        <textarea
          type="text"
          placeholder="ask me anything"
          className="w-[500px] pb-10 pl-5 pr-5 pt-3 rounded-lg field-sizing-content resize-none rounded-base border-2 font-base border-border px-3 py-2 text-md ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 bg-white text-black "
          />
          <button className="bottom-0 text-md bg-[#88aaee] border-2 rounded-md border-black px-6 py-3 border-solid shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ml-4 transition-all hover:cursor-pointer">send</button>
      </form>
    </div>
  );
};

export default chat;
