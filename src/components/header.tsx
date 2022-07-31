import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import Search from "./search";

const ThemeSwitch = dynamic(() => import("./theme-switch"), { ssr: false });

const Header = ({ blogName }: { blogName?: string }) => {
	const router = useRouter();

	return (
		<header className="h-14 w-screen fixed top-0 z-10 bg-white dark:bg-neutral-900">
			<div className="mx-auto max-w-3xl flex h-full space-x-1 w-full">
				<Link href="/">
					<a className="my-auto flex-shrink truncate">
						<div className="px-2 py-0.5 text-3xl flex hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg">
							<div className="transform -translate-y-1">🏔</div>
							<h1 className="text-xl font-light ml-2 my-auto truncate text-ellipsis">
								<b>M</b> + <b>D</b> Adventure Journal
							</h1>
						</div>
					</a>
				</Link>
				{blogName && (
					<>
						<div className="my-auto text-xl text-neutral-400 font-light">/</div>

						<button
							onClick={() => router.reload()}
							className="flex-shrink px-2 py-1 flex truncate  hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg my-auto cursor-pointer"
						>
							<h1 className="text-xl font-light py-0.5 text-ellipsis truncate">
								{blogName}
							</h1>
						</button>
					</>
				)}
				<div className="flex-grow"></div>
				<Search />
				<ThemeSwitch />
			</div>
		</header>
	);
};

export default Header;
