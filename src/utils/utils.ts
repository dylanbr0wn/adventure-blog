import {
	DecorationType,
	ColumnType,
	RowContentType,
	BlockType,
	RowType,
} from "./types";

export const idToUuid = (path: string) =>
	`${path.substr(0, 8)}-${path.substr(8, 4)}-${path.substr(
		12,
		4
	)}-${path.substr(16, 4)}-${path.substr(20)}`;

export const parsePageId = (id: string) => {
	if (id) {
		const rawId = id.replace(/\-/g, "").slice(-32);
		return idToUuid(rawId);
	}
};

export const getNotionValue = (
	val: DecorationType[],
	type: ColumnType,
	row: RowType
): RowContentType => {
	switch (type) {
		case "text":
			return getTextContent(val);
		case "person":
			return (
				val.filter((v) => v.length > 1).map((v) => v[1]![0]![1] as string) || []
			);
		case "checkbox":
			return val![0]![0] === "Yes";
		case "date":
			if (val[0]![1]![0]![0] === "d" && typeof val[0]![1]![0]![1]! !== "string")
				return val[0]![1]![0]![1]!.start_date;
			else return "";
		case "title":
			return getTextContent(val);
		case "select":
		case "email":
		case "phone_number":
		case "url":
			return val[0]![0];
		case "multi_select":
			return val[0]![0].split(",") as string[];
		case "number":
			return Number(val[0]![0]);
		case "relation":
			return val
				.filter(([symbol]) => symbol === "‣")
				.map(([_, relation]) => relation![0]![1] as string);
		case "file":
			return val
				.filter((v) => v.length > 1)
				.map((v) => {
					const rawUrl = v[1]![0]![1] as string;

					const url = new URL(
						`https://www.notion.so${
							rawUrl.startsWith("/image")
								? rawUrl
								: `/image/${encodeURIComponent(rawUrl)}`
						}`
					);

					url.searchParams.set("table", "block");
					url.searchParams.set("id", row.value.id);
					url.searchParams.set("cache", "v2");

					return { name: v[0] as string, url: url.toString(), rawUrl };
				});
		default:
			console.log({ val, type });
			return "Not supported";
	}
};

const getTextContent = (text: DecorationType[]) => {
	return text.reduce((prev, current) => prev + current[0], "");
};

export const getTagColor = (tag: string) => {
	switch (tag) {
		case "Day Hike":
			return "bg-red-200 text-red-700";
		case "Overnight":
			return "bg-violet-200 text-violet-700";
		case "Alpine":
			return "bg-blue-200 text-blue-700";
		case "Coastal":
			return "bg-green-200 text-green-700";
		case "Multi-Day":
			return "bg-orange-200 text-orange-700";
		default:
			return "bg-neutral-200 text-neutral-700";
	}
};
