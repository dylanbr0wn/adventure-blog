import Link from "next/link";
import { useRouter } from "next/router";
import { Search as SearchIcon } from "react-feather";
import { Search } from "react-notion-x";
import { trpc } from "../utils/trpc";

const Header = ({ blogName }: { blogName?: string }) => {
	const router = useRouter();

	const { data, refetch } = trpc.useQuery(["search.query", { query: "" }], {
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		onSuccess: (data) => {
			console.log(data);
		},
	});

	return (
		<header className="h-14 w-screen fixed top-0 z-10 bg-white">
			<div className="mx-auto max-w-4xl flex h-full space-x-1 w-full">
				<Link href="/">
					<a className="my-auto">
						<div className=" px-2 py-0.5 text-3xl flex hover:bg-neutral-100 transition-colors rounded-lg">
							<div className="transform -translate-y-1">🏔</div>
							<h1 className="text-xl font-light ml-2 my-auto">
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
							className=" px-2 py-1 flex hover:bg-neutral-100 transition-colors rounded-lg my-auto cursor-pointer"
						>
							<h1 className="text-xl font-light py-0.5">{blogName}</h1>
						</button>
					</>
				)}
				<div className="flex-grow"></div>
				{/* <div className="my-auto" onClick={() => refetch()}>
					<SearchIcon className="h-6 w-6 " />
				</div> */}
			</div>
		</header>
	);
};

export default Header;
