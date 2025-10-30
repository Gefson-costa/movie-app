/* eslint-env node */
/* global process */
export default async function handler(req, res) {
    try {
        const { path = "/discover/movie", search = "" } = req.query || {};

        const url = `https://api.themoviedb.org/3${path}${search ? `?${search}` : ""}`;

        const response = await fetch(url, {
            headers: {
                accept: "application/json",
                // Em ambiente serverless da Vercel, TMDB_BEARER é definido como variável de ambiente
                Authorization: `Bearer ${typeof process !== 'undefined' && process.env ? process.env.TMDB_BEARER : ''}`,
            },
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ message: "TMDB proxy error", error: String(err) });
    }
}


