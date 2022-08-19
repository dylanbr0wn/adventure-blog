import { NotionRenderer } from "react-notion-x"
import type { FC } from "react"
import dayjs from "dayjs"
import "react-notion-x/src/styles.css"
import type { Block, ExtendedRecordMap } from "notion-types"
import { Determinatic } from "determinatic"

const deter_dark = Determinatic({
	colorProfile: "dark",
})
const deter_pastel = Determinatic({
	colorProfile: "pastel",
})

const mapImageUrl = (image: string, block: Block) => {
	const url = new URL(
		`https://www.notion.so${
			image.startsWith("/image") ? image : `/image/${encodeURIComponent(image)}`
		}`
	)

	if (block && !image.includes("/images/page-cover/")) {
		const table = block.parent_table === "space" ? "block" : block.parent_table
		url.searchParams.set("table", table)
		url.searchParams.set("id", block.id)
		url.searchParams.set("cache", "v2")
	}

	return url.toString()
}

const BlogPage: FC<{
	recordMap: ExtendedRecordMap
	title: string
	createdAt: number
	tags: string[]
}> = ({ title, createdAt, tags, recordMap }) => {
	return (
		<>
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
						)
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
				className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100"
				disableHeader={true}
				showTableOfContents={false}
				pageTitle={<div />}
				mapImageUrl={mapImageUrl}
				forceCustomImages
			/>
		</>
	)
}

export default BlogPage
