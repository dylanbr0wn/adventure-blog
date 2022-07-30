import { createRouter } from "./context";
import { z } from "zod";
import { fetchSearch, notion } from "../../utils/notion";
import {
	APIError,
	Block,
	ExtendedRecordMap,
	PageBlock,
	RecordMap,
	SearchResult,
	SearchResults,
} from "notion-types";
import { getBlockParentPage, getBlockTitle } from "notion-utils";

export const exampleRouter = createRouter().query("query", {
	input: z.object({
		query: z.string(),
	}),
	async resolve({ input }) {
		const result = await notion.search({
			query: input.query,
			ancestorId: "f13fd760a7a548d489d309fb7c17a4d1",
			limit: 10,
		});
		let searchResult: SearchResults;

		searchResult = { ...result };

		const results = searchResult.results
			.map((result) => {
				let newResult: SearchResult & {
					title?: string;
					block?: Block;
					recordMap?: RecordMap;
					page?: PageBlock | Block;
					highlight: SearchResult["highlight"] & { html?: string };
				} = result;
				const block = searchResult.recordMap.block[result.id]?.value;
				if (!block) return;

				const title = getBlockTitle(
					block,
					searchResult.recordMap as ExtendedRecordMap
				);
				if (!title) {
					return;
				}

				newResult.title = title;
				newResult.block = block;
				newResult.recordMap = searchResult.recordMap;
				newResult.page =
					getBlockParentPage(
						block,
						searchResult.recordMap as ExtendedRecordMap,
						{
							inclusive: true,
						}
					) || block;

				if (!newResult.page.id) {
					return;
				}

				if (newResult.highlight?.text) {
					newResult.highlight.html = newResult.highlight.text
						.replace(/<gzkNfoUU>/gi, "<b>")
						.replace(/<\/gzkNfoUU>/gi, "</b>");
				}

				return newResult;
			})
			.filter(Boolean);

		// dedupe results by page id
		const searchResultsMap = results.reduce<{
			[key: string]:
				| SearchResult & {
						title?: string | undefined;
						block?: Block | undefined;
						recordMap?: RecordMap | undefined;
						page?: Block | undefined;
						highlight: SearchResult["highlight"] & {
							html?: string;
						};
				  };
		}>((map, result) => {
			if (!result) return map;
			return {
				...map,
				[result.page?.id ?? ""]: result,
			};
		}, {});

		return { ...searchResult, results: Object.values(searchResultsMap) };
	},
});
