import { Hono } from "hono";
import { getSystemStats, formatStats } from "./stats";

const app = new Hono();

app.get("/", async (c) => {
	const txt = await Bun.file("./src/site.txt").text();
	const stats = await getSystemStats();
	const statsBox = formatStats(stats);
	const fullContent = `${txt}\n\n${statsBox}\n`;
	const userAgent = c.req.header("User-Agent") || "";
	console.log(userAgent);
	const isCrawler = /bot/i.test(userAgent);

	if (isCrawler) {
		return c.html(`<!DOCTYPE html>
<html>
<head>
<title>Polybius Software LLC</title>
<meta name="description" content="Building tools for a better internet">
<meta property="og:url" content="https://polybiussoftware.llc">
<meta property="og:type" content="website">
<meta property="og:title" content="Polybius Software LLC">
<meta property="og:description" content="Building tools for a better internet">
<meta property="og:image" content="/og.png">

<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="polybiussoftware.llc">
<meta property="twitter:url" content="https://polybiussoftware.llc">
<meta name="twitter:title" content="Polybius Software LLC">
<meta name="twitter:description" content="Building tools for a better internet">
<meta name="twitter:image" content="/og.png">
</head>
<body>
${fullContent}
</body>
</html>
`);
	}

	return c.text(fullContent);
});

app.get("/og.png", async (c) => {
	const image = Bun.file("./src/og.png");
	return c.body(image.stream(), {
		headers: {
			"Content-Type": "image/png",
		},
	});
});

export default {
	port: 4321,
	fetch: app.fetch,
};
