import { dev } from "$app/environment";
import { base } from "$app/paths";
import { env } from "$env/dynamic/private";
import { getOIDCEndSessionUrl } from "$lib/server/auth.js";
import { collections } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const actions = {
	async default({ url, cookies, locals }) {
		await collections.sessions.deleteOne({ sessionId: locals.sessionId });

		cookies.delete(env.COOKIE_NAME, {
			path: "/",
			// So that it works inside the space's iframe
			sameSite: dev || env.ALLOW_INSECURE_COOKIES === "true" ? "lax" : "none",
			secure: !dev && !(env.ALLOW_INSECURE_COOKIES === "true"),
			httpOnly: true,
		});

		const redirectURI = `${url.origin}${base}/`;
		const endSessionUrl = await getOIDCEndSessionUrl({ redirectURI });

		redirect(303, endSessionUrl);
	},
};
