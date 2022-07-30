import type { GetServerSideProps, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { fetchTable, notion, Row } from "../utils/notion";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import dayjs from "dayjs";
import Link from "next/link";
import Header from "../components/header";
import { getTagColor } from "../utils/utils";
import Footer from "../components/footer";
import Main from "../components/main";
import { Block, ExtendedRecordMap } from "notion-types";
import dynamic from "next/dynamic";

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
		<>
			<Head>
				<title>M + D Adventure Blog</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Header />

			<Main>
				<h1 className="text-4xl text-center font-bold pb-20 text-neutral-700">
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
									<article className="flex rounded-lg  overflow-hidden hover:bg-gray-100 transition-colors p-3">
										<div>
											<img
												className="w-48 h-48 object-cover rounded-lg "
												src={thumbnail[0].url}
											/>
										</div>
										<div className="flex flex-col py-3 px-5 w-96 h-48">
											<div className="text-gray-400 pt-1">
												{dayjs(created_time).format("D/MM/YYYY")}
											</div>

											<div className="font-bold text-neutral-700 text-3xl ">
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
		</>
	);
};

export default Home;
