import { GetServerSidePropsContext } from "next";
import { getAllPagesInSpace, idToUuid } from "notion-utils";
import { defaultMapPageUrl } from "react-notion-x";
import { fetchTable, notion } from "../utils/notion";

//pages/sitemap.xml.js
const EXTERNAL_DATA_URL = "https://adventure-blog.vercel.app";

function generateSiteMap(posts: string[]) {
	return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${posts
				.map((post) => {
					return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${post}`}</loc>
       </url>
     `;
				})
				.join("")}
   </urlset>
 `;
}

function SiteMap() {
	// getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
	const table = await fetchTable("f13fd760a7a548d489d309fb7c17a4d1");

	const paths = table.filter((page) => page.Published).map((page) => page.id);

	// We generate the XML sitemap with the posts data
	const sitemap = generateSiteMap([...paths, ""]);

	res.setHeader("Content-Type", "text/xml");
	// we send the XML to the browser
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
}

export default SiteMap;
