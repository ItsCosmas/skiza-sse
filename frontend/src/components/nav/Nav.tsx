function Nav() {
  return (
      <nav className="navbar justify-center bg-base-100">
        <div className="shrink flex-col h-10 prose">
          <a className="link no-underline text-xl font-bold flex justify-center cursor-pointer">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="green"
                className="size-6 mr-4"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span>Skiza</span>
          </a>
          <span className="mt-2">Postback Receiver and Stream</span>
        </div>
      </nav>
  );
}

export default Nav;

