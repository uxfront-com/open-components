// The homepage, served from dist/, three runs. Fails below 0.95 in any category,
// since the site keeps SEO at 0.95, where the shared preset asks for 1.
import { lighthouseConfig } from "@uxfront/site-checks/lighthouse";

export default lighthouseConfig({
	collect: { staticDistDir: "dist", url: ["http://localhost/"] },
	categories: { seo: { minScore: 0.95 } },
});
