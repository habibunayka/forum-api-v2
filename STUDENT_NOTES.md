# Student Notes

- HTTPS API base URL: https://api.dcdg.xyz (replace with your custom domain if needed).
- HTTPS + reverse proxy configuration (including a 90 req/min limit on `/threads*`): see `nginx.conf` in the project root.
- In-app rate limiting also caps `/threads` and all subpaths to 90 requests per minute per IP by default. Override with `THREADS_RATE_LIMIT` and `THREADS_RATE_WINDOW_MS` only if your deployment needs different thresholds.
