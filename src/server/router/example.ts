import { createRouter } from "./context";
import { z } from "zod";
import { fetchSearch, notion } from "../../utils/notion";

export const exampleRouter = createRouter().query("query", {
	input: z.object({
		query: z.string(),
	}),
	async resolve({ input }) {
		return await notion.search({
			query: input.query,
			ancestorId: "f13fd760a7a548d489d309fb7c17a4d1",
		});
	},
});
