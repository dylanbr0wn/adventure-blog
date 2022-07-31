import { FiCommand, FiSearch as SearchIcon } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { IoMdReturnLeft } from "react-icons/io";
import { trpc } from "../utils/trpc";
import * as React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { flushSync } from "react-dom";
import { getBlockTitle, getPageTitle } from "notion-utils";
import {
	Block,
	ExtendedRecordMap,
	RecordMap,
	SearchResult,
} from "notion-types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import { useHotkeys } from "react-hotkeys-hook";

function useDebounce<T>(value: T, delay?: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}

const SearchModalContent = ({ closeModal }: { closeModal: () => void }) => {
	const [search, setSearch] = React.useState("");
	const [loading, setLoading] = React.useState(false);

	const onChange = (newValue: string) => {
		if (newValue === search) return;
		setLoading(true);
		setSearch(newValue);
	};
	const debouncedSearch = useDebounce(search, 400);

	const { data } = trpc.useQuery(["search.query", { query: debouncedSearch }], {
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		// enabled: search.length > 0,
		onSettled: () => setLoading(false),
	});

	const [parent] = useAutoAnimate<HTMLDivElement>();

	const router = useRouter();

	const [selected, setSelected] = React.useState<number>(0);

	return (
		<>
			<div className="my-auto flex px-2 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 dark:focus-within:bg-neutral-700  focus-within:bg-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
				<input
					className="h-6 w-full bg-transparent focus-visible:ring-0 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
					placeholder="Search something.."
					value={search}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							const page = data?.results[selected];

							if (!page) return;

							const page_id = page.page?.id;

							if (!page_id) return;
							router.push(`/${page_id}`);
							onChange("");
							closeModal();
						}
						if (e.key === "ArrowUp") {
							e.preventDefault();
							setSelected((old) => {
								if (old === 0) return old;
								return old - 1;
							});
						}
						if (e.key === "ArrowDown") {
							e.preventDefault();
							const maxLen = data?.results?.length || 0;
							setSelected((old) => {
								if (old + 1 >= maxLen) return old;
								return old + 1;
							});
						}
					}}
					onChange={(e) => {
						onChange(e.target.value);
					}}
				/>
				{loading ? (
					<ImSpinner2 className="animate-spin h-6 w-6 text-neutral-500 dark:text-neutral-400" />
				) : (
					<SearchIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
				)}
			</div>
			<div ref={parent} className="mt-2 flex flex-col space-y-1">
				{data?.results?.map((result, i) => {
					const title = result.page
						? getBlockTitle(result.page, result.recordMap as ExtendedRecordMap)
						: result.title;

					const isSelected = i === selected;

					return (
						<button
							key={result.id}
							onClick={() => {
								router.push(`/${result.page?.id}`);
								onChange("");
								closeModal();
							}}
							className={`flex w-full space-y-1 py-3 px-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 items-center ${
								isSelected ? "bg-neutral-100 dark:bg-neutral-800" : ""
							}`}
						>
							<div className="flex flex-col text-left h-ful pr-4 flex-grow">
								<div className=" text-neutral-500 dark:text-neutral-400 font-bold">
									{title ?? ""}
								</div>
								{result.highlight?.html ? (
									<div
										className="line-clamp-1"
										dangerouslySetInnerHTML={{
											__html: result.highlight?.html ?? "",
										}}
									></div>
								) : (
									<div className="line-clamp-1 text-sm">{result.title}</div>
								)}
							</div>
							<div className=" my-auto ">
								<IoMdReturnLeft
									className={`my-auto h-5 w-5 text-neutral-500 dark:text-neutral-400 ${
										isSelected ? "block" : "hidden"
									}`}
								/>
							</div>
						</button>
					);
				})}

				<div className="text-sm text-neutral-400 py-2 w-full text-center">
					{data?.results?.length ?? 0} results
				</div>
			</div>
		</>
	);
};

// hook to check if a user is on macos
const useIsMac = () => {
	const [isMac, setIsMac] = React.useState<boolean>(false);
	React.useEffect(() => {
		const isMac = navigator.userAgent.includes("Mac");
		setIsMac(isMac);
	}, []);
	return isMac;
};

const Search = () => {
	const [isOpen, setIsOpen] = React.useState(false);
	// const ref = React.useRef<HTMLInputElement>(null);

	const isMac = useIsMac();

	const closeModal = () => {
		setIsOpen(false);
	};

	useHotkeys<HTMLDivElement>("command+k,ctrl+k", () => {
		setIsOpen(true);
	});
	return (
		<>
			<button
				onClick={() => {
					flushSync(() => {
						setIsOpen(true);
					});
					// ref.current?.focus();
				}}
				className="my-auto md:space-x-2 flex px-2 md:px-3 py-2 focus-visible:ring-0 outline-none rounded-lg  hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400"
			>
				<div className="hidden md:block">Search...</div>
				<div className="hidden md:flex bg-neutral-200 dark:bg-neutral-700 my-auto py-0.5 px-1 rounded text-neutral-500 dark:text-neutral-400 text-xs  items-center">
					{isMac ? <FiCommand className="h-3 w-3" /> : <div>Ctrl</div>}
					<div> + K</div>
				</div>
				<SearchIcon className="h-6 w-6 text-neutral-400 md:ml-2" />
			</button>
			<Transition appear show={isOpen} as={React.Fragment}>
				<Dialog as="div" className="relative z-10" onClose={closeModal}>
					<Transition.Child
						as={React.Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed top-10 md:top-1/2 transform -translate-y-1/2 inset-x-0 overflow-y-auto w-full">
						<div className="flex min-h-full items-center justify-center p-10 text-center ">
							<Transition.Child
								as={React.Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full  md:w-2/5 transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
									<SearchModalContent closeModal={closeModal} />
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
};

export default Search;
