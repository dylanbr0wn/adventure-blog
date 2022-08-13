import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { fetchTable, notion } from "../../utils/notion";
import dayjs from "dayjs";
import Link from "next/link";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Main from "../../components/main";
import { NotionRenderer } from "react-notion-x";
import { ExtendedRecordMap } from "notion-types";
import { getPageProperty, getPageTitle } from "notion-utils";
import { deter_dark, deter_pastel } from "../../utils/color";

import { Block } from "notion-types";
import { defaultMapImageUrl } from "react-notion-x";
import Image from "next/future/image";

export const mapImageUrl = (url: string, block: Block) => {
	return defaultMapImageUrl(url, block) || url;
};

export const getStaticProps: GetStaticProps = async (ctx) => {
	const id = ctx.params?.id as string;
	const recordMap = await notion.getPage(id);

	let title = getPageTitle(recordMap);

	let tags: string[] = getPageProperty(
		"Tags",
		Object.values(recordMap.block)[0]!.value,
		recordMap
	);

	if (typeof title !== "string") title = "";

	const desc: string = getPageProperty(
		"Description",
		Object.values(recordMap.block)[0]!.value,
		recordMap
	);

	const thumbnail: string = Object.values(recordMap.block)[0]!.value.properties[
		"aZei"
	][0][1][0][1];

	return {
		props: {
			recordMap,
			title,
			createdAt: Object.values(recordMap.block)[0]!.value?.created_time,
			tags,
			id,
			desc,
			thumbnail,
		},
		revalidate: 60 * 60 * 24 * 30, //once every month
	};
};

export async function getStaticPaths() {
	if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
		return {
			paths: [],
			fallback: true,
		};
	}

	const table = await fetchTable("f13fd760a7a548d489d309fb7c17a4d1");

	// This crawls all public pages starting from the given root page in order
	// for next.js to pre-generate all pages via static site generation (SSG).
	// This is a useful optimization but not necessary; you could just as easily
	// set paths to an empty array to not pre-generate any pages at build time.
	const paths = table
		.filter((page) => page.Published)
		.map((page) => ({ params: { id: page.id } }));

	return {
		paths,
		fallback: "blocking",
	};
}

const BlogPage: NextPage<{
	recordMap: ExtendedRecordMap;
	title: string;
	createdAt: number;
	tags: string[];
	id: string;
	desc: string;
	thumbnail: string;
}> = ({ recordMap, title, createdAt, tags, id, desc, thumbnail }) => {
	const pageTitle = title
		? `${title} | M + D Adventure Blog`
		: "M + D Adventure Blog";

	return (
		<div className="bg-white dark:bg-neutral-900">
			<Head>
				<title>{pageTitle}</title>

				<meta name="title" content={pageTitle} />
				<meta name="description" content={desc} />

				<meta property="og:type" content="website" />
				<meta
					property="og:url"
					content={`https://adventure-blog.vercel.app/${id}`}
				/>
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={desc} />
				<meta property="og:image" content={thumbnail} />

				<meta property="twitter:card" content="summary_large_image" />
				<meta
					property="twitter:url"
					content={`https://adventure-blog.vercel.app/${id}`}
				/>
				<meta
					name="google-site-verification"
					content="5zVAlNs4LjEzKU5g8YOjEow-xUYS61ORRa7B2I3qppg"
				/>
				<meta property="twitter:title" content={pageTitle} />
				<meta property="twitter:description" content={desc} />
				<meta property="twitter:image" content={thumbnail}></meta>
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
			</Head>
			<Header blogName={title} />

			<Main>
				<div className="text-center py-3">
					<h1 className="text-4xl font-bold text-neutral-700 dark:text-neutral-300 py-2">
						{title}
					</h1>
					<p className="text-neutral-400">
						{dayjs(createdAt).format("DD/MM/YYYY")}
					</p>
					<div className="py-1 flex flex-wrap w-full justify-center">
						{tags?.map((tag, i) => {
							return (
								<div
									key={i}
									style={{
										backgroundColor: deter_pastel.getColor(tag),
										color: deter_dark.getColor(tag),
									}}
									className={`px-2 py-0.5 rounded-full mr-0.5 my-0.5 text-sm `}
								>
									{tag}
								</div>
							);
						})}
					</div>
				</div>

				<NotionRenderer
					bodyClassName="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100"
					recordMap={recordMap}
					fullPage={false}
					showCollectionViewDropdown={false}
					linkTableTitleProperties={false}
					darkMode={false}
					previewImages={true}
					className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100"
					disableHeader={true}
					showTableOfContents={false}
					pageTitle={<div />}
					mapImageUrl={mapImageUrl}
					components={{
						nextLink: Link,
						nextImage: Image,
						// Header: NotionPageHeader,
						// Modal,
					}}

					// NOTE: custom images will only take effect if previewImages is true and
					// if the image has a valid preview image defined in recordMap.preview_images[src]
				/>
			</Main>

			<Footer />
		</div>
	);
};

export default BlogPage;
