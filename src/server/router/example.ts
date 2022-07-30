import { createRouter } from "./context";
import { z } from "zod";
import { fetchSearch } from "../../utils/notion";

export const exampleRouter = createRouter().query("query", {
	input: z.object({
		query: z.string(),
	}),
	async resolve({ input }) {
		return await fetchSearch("f13fd760a7a548d489d309fb7c17a4d1", input.query);
	},
});
