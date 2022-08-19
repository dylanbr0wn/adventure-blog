import type {
	JSONData,
	NotionUserType,
	LoadPageChunkData,
	CollectionData,
	NotionSearchParamsType,
	NotionSearchResultsType,
	RowContentType,
	CollectionType,
	RowType,
	BlockType,
} from "./types";
import { getNotionValue, parsePageId } from "./utils";

const NOTION_API = "https://www.notion.so/api/v3";

interface INotionParams {
	resource: string;
	body: JSONData;
	notionToken?: string;
}

const loadPageChunkBody = {
	limit: 100,
	cursor: { stack: [] },
	chunkNumber: 0,
	verticalColumns: false,
};

const fetchNotionData = async <T extends any>({
	resource,
	body,
	notionToken,
}: INotionParams): Promise<T> => {
	const res = await fetch(`${NOTION_API}/${resource}`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...(notionToken && { cookie: `token_v2=${notionToken}` }),
		},
		body: JSON.stringify(body),
	});

	return res.json();
};

export const fetchPageById = async (pageId: string, notionToken?: string) => {
	const res = await fetchNotionData<LoadPageChunkData>({
		resource: "loadPageChunk",
		body: {
			pageId,
			...loadPageChunkBody,
		},
		notionToken,
	});

	return res;
};

const queryCollectionBody = {
	loader: {
		type: "reducer",
		reducers: {
			collection_group_results: {
				type: "results",
				limit: 999,
				loadContentCover: true,
			},
			"table:uncategorized:title:count": {
				type: "aggregation",
				aggregation: {
					property: "title",
					aggregator: "count",
				},
			},
		},
		searchQuery: "",
		userTimeZone: "Europe/Vienna",
	},
};

export const fetchTableData = async (
	collectionId: string,
	collectionViewId: string,
	notionToken?: string
) => {
	const table = await fetchNotionData<CollectionData>({
		resource: "queryCollection",
		body: {
			collection: {
				id: collectionId,
			},
			collectionView: {
				id: collectionViewId,
			},
			...queryCollectionBody,
		},
		notionToken,
	});

	return table;
};

export const fetchNotionUsers = async (
	userIds: string[],
	notionToken?: string
) => {
	const users = await fetchNotionData<{ results: NotionUserType[] }>({
		resource: "getRecordValues",
		body: {
			requests: userIds.map((id) => ({ id, table: "notion_user" })),
		},
		notionToken,
	});
	if (users && users.results) {
		return users.results.map((u) => {
			const user = {
				id: u.value.id,
				firstName: u.value.given_name,
				lastLame: u.value.family_name,
				fullName: u.value.given_name + " " + u.value.family_name,
				profilePhoto: u.value.profile_photo,
			};
			return user;
		});
	}
	return [];
};

export const fetchBlocks = async (
	blockList: string[],
	notionToken?: string
) => {
	return await fetchNotionData<LoadPageChunkData>({
		resource: "syncRecordValues",
		body: {
			requests: blockList.map((id) => ({
				id,
				table: "block",
				version: -1,
			})),
		},
		notionToken,
	});
};

export const fetchNotionSearch = async (
	params: NotionSearchParamsType,
	notionToken?: string
) => {
	// TODO: support other types of searches
	return fetchNotionData<{ results: NotionSearchResultsType }>({
		resource: "search",
		body: {
			type: "BlocksInAncestor",
			source: "quick_find_public",
			ancestorId: params.ancestorId,
			filters: {
				isDeletedOnly: false,
				excludeTemplates: true,
				isNavigableOnly: true,
				requireEditPermissions: false,
				ancestors: [],
				createdBy: [],
				editedBy: [],
				lastEditedTime: {},
				createdTime: {},
				...params.filters,
			},
			sort: "Relevance",
			limit: params.limit || 20,
			query: params.query,
		},
		notionToken,
	});
};

export type Row = { id: string; [key: string]: RowContentType };

export const getTableData = async (
	collection: CollectionType,
	collectionViewId: string,
	notionToken?: string,
	raw?: boolean
) => {
	const table = await fetchTableData(
		collection.value.id,
		collectionViewId,
		notionToken
	);

	const collectionRows = collection.value.schema;
	const collectionColKeys = Object.keys(collectionRows);

	const tableArr: RowType[] =
		table.result.reducerResults.collection_group_results.blockIds.map(
			(id: string) => table.recordMap.block[id]!
		);

	const tableData = tableArr.filter(
		(b) =>
			b.value && b.value.properties && b.value.parent_id === collection.value.id
	);

	const rows: Row[] = [];

	for (const td of tableData) {
		let row: Row = { id: td.value.id };

		for (const key of collectionColKeys) {
			const val = td.value.properties[key];
			if (val) {
				const schema = collectionRows[key]!;
				row[schema.name] = raw ? val : getNotionValue(val, schema.type, td);
				if (schema.type === "person" && row[schema.name]) {
					const users = await fetchNotionUsers(row[schema.name] as string[]);
					row[schema.name] = users as any;
				}
			}
		}
		row["created_time"] = td.value.created_time;

		rows.push(row);
	}

	return { rows, schema: collectionRows };
};

export const fetchTable = async (page_id: string, notion_token?: string) => {
	const pageId = parsePageId(page_id);
	const page = await fetchPageById(pageId!, notion_token);

	if (!page.recordMap?.collection) return [];

	const collection = Object.keys(page.recordMap.collection).map(
		(k) => page.recordMap.collection[k]!
	)[0]!;

	const collectionView: {
		value: { id: CollectionType["value"]["id"] };
	} = Object.keys(page.recordMap.collection_view).map(
		(k) => page.recordMap.collection_view[k]!
	)[0]!;

	return (await getTableData(collection, collectionView.value.id, notion_token))
		.rows;
};

export const fetchPage = async (page_id: string, notion_token?: string) => {
	const pageId = parsePageId(page_id);
	const page = await fetchPageById(pageId!, notion_token);

	const baseBlocks = page.recordMap?.block ?? [];

	let allBlocks: { [id: string]: BlockType & { collection?: any } } = {
		...baseBlocks,
	};
	let allBlockKeys;

	while (true) {
		allBlockKeys = Object.keys(allBlocks);

		const pendingBlocks = allBlockKeys.flatMap((blockId) => {
			const block = allBlocks[blockId];
			const content = block?.value && block.value.content;

			if (!content || (block.value.type === "page" && blockId !== pageId!)) {
				// skips pages other than the requested page
				return [];
			}

			return content.filter((id: string) => !allBlocks[id]);
		});

		if (!pendingBlocks.length) {
			break;
		}

		const newBlocks = await fetchBlocks(pendingBlocks, notion_token).then(
			(res) => res.recordMap.block
		);

		allBlocks = { ...allBlocks, ...newBlocks };
	}

	const collection = page.recordMap?.collection
		? page.recordMap.collection[Object.keys(page.recordMap.collection)[0]!]
		: null;

	const collectionView = page.recordMap?.collection_view
		? page.recordMap.collection_view[
				Object.keys(page.recordMap.collection_view)[0]!
		  ]
		: null;

	if (collection && collectionView) {
		const pendingCollections = allBlockKeys.flatMap((blockId) => {
			const block = allBlocks[blockId];

			return block?.value && block.value.type === "collection_view"
				? [block.value.id]
				: [];
		});

		for (let b of pendingCollections) {
			const collPage = await fetchPageById(b!, notion_token);

			const coll = Object.keys(collPage.recordMap.collection).map(
				(k) => collPage.recordMap.collection[k]
			)[0]!;

			const collView: {
				value: { id: CollectionType["value"]["id"] };
			} = Object.keys(collPage.recordMap.collection_view).map(
				(k) => collPage.recordMap.collection_view[k]
			)[0]!;

			const { rows, schema } = await getTableData(
				coll,
				collView.value.id,
				notion_token,
				true
			);

			const viewIds = (allBlocks[b] as any).value.view_ids as string[];

			allBlocks[b] = {
				...allBlocks[b]!,
				collection: {
					title: coll.value.name,
					schema,
					types: viewIds.map((id) => {
						const col = collPage.recordMap.collection_view[id];
						return col ? col.value : undefined;
					}),
					data: rows,
				},
			};
		}
	}
	return allBlocks;
};

export const fetchSearch = async (
	table_id: string,
	query: string,
	notion_token?: string
) => {
	const ancestorId = parsePageId(table_id)!;
	const limit = 20;

	const results = await fetchNotionSearch(
		{
			ancestorId,
			query,
			limit,
		},
		notion_token
	);
	return results;
};

import { NotionAPI } from "notion-client";

export const notion = new NotionAPI({
	apiBaseUrl: process.env.NOTION_API_BASE_URL,
	activeUser: process.env.NOTION_ACTIVE_USER,
	authToken: process.env.NOTION_AUTH_TOKEN,
});
