import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { fetchTable, Row } from "../utils/notion";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import dayjs from "dayjs";
import Link from "next/link";
import Header from "../components/header";
import { getTagColor } from "../utils/utils";
import Footer from "../components/footer";
import Main from "../components/main";
import { getPageImageUrls } from "notion-utils";

export const getStaticProps: GetStaticProps = async () => {
	const table = await fetchTable("f13fd760a7a548d489d309fb7c17a4d1");
	const data = table.filter((row) => row.Published);

	return {
		props: {
			title: "Home",
			tableData: data,
		},
		revalidate: 60 * 60, //once every hour
	};
};

const Home: NextPage<{
	title: string;
	tableData: Row[];
}> = ({ title, tableData }) => {
	const [parent] = useAutoAnimate<HTMLDivElement>();
	return (
		<div className="bg-white dark:bg-neutral-900">
			<Head>
				<title>M + D Adventure Blog</title>

				<meta name="title" content="M + D Adventure Blog" />
				<meta
					name="description"
					content="The notes and scribbles of the adventures of Metea and Dylan."
				/>

				<meta property="og:type" content="website" />
				<meta
					property="og:url"
					content={`https://adventure-blog.vercel.app/`}
				/>
				<meta property="og:title" content="M + D Adventure Blog" />
				<meta
					property="og:description"
					content="The notes and scribbles of the adventures of Metea and Dylan."
				/>
				<meta
					property="og:image"
					content="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe05e1ac1-d080-4e5a-816e-b2609152ea12%2F2018-10-08_01.07.59_1.jpg?table=block&id=fed2dac5-4715-46b6-acef-f0b8e2b82409&spaceId=db385518-0177-4ea1-8abe-68e425d4cb80&width=600&userId=07871874-2f15-4324-b8e9-25e01c2b038a&cache=v2"
				/>

				<meta property="twitter:card" content="summary_large_image" />
				<meta
					property="twitter:url"
					content={`https://adventure-blog.vercel.app/`}
				/>
				<meta property="twitter:title" content="M + D Adventure Blog" />
				<meta
					property="twitter:description"
					content="The notes and scribbles of the adventures of Metea and Dylan."
				/>
				<meta
					property="twitter:image"
					content="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe05e1ac1-d080-4e5a-816e-b2609152ea12%2F2018-10-08_01.07.59_1.jpg?table=block&id=fed2dac5-4715-46b6-acef-f0b8e2b82409&spaceId=db385518-0177-4ea1-8abe-68e425d4cb80&width=600&userId=07871874-2f15-4324-b8e9-25e01c2b038a&cache=v2"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#171717"></meta>
				<meta
					name="google-site-verification"
					content="5zVAlNs4LjEzKU5g8YOjEow-xUYS61ORRa7B2I3qppg"
				/>
			</Head>
			<Header />

			<Main>
				<h1 className="text-4xl text-center font-bold pb-20 text-neutral-700 dark:text-neutral-300">
					{title}
				</h1>
				<div ref={parent} className="flex flex-col space-y-2">
					{tableData.map((row) => {
						const thumbnail = row.Thumbnail as [
							{ name: string; rawUrl: string; url: string }
						];

						const tags = row.Tags as string[];

						const created_time = row.created_time as string;

						const description = row.Description as string;
						return (
							<Link key={row.id} href={`/${row.id}`}>
								<a>
									<article className="flex rounded-lg  overflow-hidden hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors p-3">
										<div>
											<img
												className="w-48 h-48 object-cover rounded-lg "
												src={thumbnail[0].url}
											/>
										</div>
										<div className="flex flex-col py-3 px-5 w-96 h-48">
											<div className="text-neutral-400 pt-1">
												{dayjs(created_time).format("D/MM/YYYY")}
											</div>

											<div className="font-bold text-neutral-700 dark:text-neutral-300 text-3xl ">
												{(row?.Name as string) ?? ""}
											</div>
											<div className="py-1 flex flex-wrap">
												{tags.map((tag, i) => {
													return (
														<div
															key={i}
															className={`px-2 py-0.5 rounded-full mr-0.5 my-0.5 text-sm ${getTagColor(
																tag
															)}`}
														>
															{tag}
														</div>
													);
												})}
											</div>
											<p className="line-clamp-3">{description}</p>
										</div>
									</article>
								</a>
							</Link>
						);
					})}
				</div>
			</Main>
			<Footer />
		</div>
	);
};

export default Home;
