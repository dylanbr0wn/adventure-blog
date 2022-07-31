import { a, config, useTransition } from "@react-spring/web";
import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeSwitch = () => {
	const { theme, setTheme } = useTheme();

	const transitions = useTransition(theme, {
		initial: { position: "absolute", opacity: 1, y: 0 },
		from: { position: "absolute", opacity: 0, y: -10 },
		enter: { opacity: 1, y: 0 },
		leave: { opacity: 0, y: -10 },
		config: config.wobbly,
	});
	return (
		<div className="my-auto text-neutral-400 ">
			<button
				className="p-2 h-10 w-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md relative"
				onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			>
				{transitions(({ opacity, y }, item) =>
					item === "light" ? (
						<a.div className="absolute mx-auto top-2" style={{ opacity, y }}>
							<FiSun className="h-6 w-6" />
						</a.div>
					) : (
						<a.div className="absolute mx-auto top-2" style={{ opacity, y }}>
							<FiMoon className="h-6 w-6" />
						</a.div>
					)
				)}
			</button>
		</div>
	);
};
export default ThemeSwitch;
