import * as React from "react";

const Main = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="max-w-4xl mx-auto  flex flex-col items-center h-full px-4 min-h-screen pt-20">
			{children}
		</main>
	);
};

export default Main;
