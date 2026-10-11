# syntax=docker/dockerfile:1

# ---- Build: type-check and bundle the app with Vite ----------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build \
  # Everything served must be world-readable.
  && chmod -R a+rX dist

# ---- MCP server: build, then a slim runtime image (target "mcp") ----------------------------------
FROM node:22-alpine AS mcp-build
WORKDIR /app

COPY mcp/package.json mcp/package-lock.json mcp/
RUN cd mcp && npm ci --no-audit --no-fund

COPY src/shared src/shared
COPY mcp mcp
RUN cd mcp && npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:22-alpine AS mcp
ENV NODE_ENV=production MCP_TRANSPORT=http PORT=3000
WORKDIR /app/mcp
COPY --from=mcp-build /app/mcp/package.json ./
COPY --from=mcp-build /app/mcp/node_modules node_modules
COPY --from=mcp-build /app/mcp/dist dist
COPY src/assets/Bezels assets/Bezels
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/mcp/health || exit 1
CMD ["node", "dist/server.js"]

# ---- Serve: static files from Caddy (default target, keep it last; config in docker/Caddyfile) ---
FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 32775
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:32775/ || exit 1
