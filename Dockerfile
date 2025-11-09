# Build stage
FROM node:20-alpine AS build
WORKDIR /workspace
COPY clients/angular-auth ./clients/angular-auth
WORKDIR /workspace/logistics/frontend
COPY logistics/frontend/package.json ./package.json
COPY logistics/frontend/yarn.lock ./yarn.lock
RUN corepack enable \
 && if [ -f yarn.lock ]; then yarn install --immutable; else yarn install; fi \
 && ln -s /workspace/logistics/frontend/node_modules /workspace/node_modules
COPY logistics/frontend/ .
RUN yarn build

# Runtime stage
FROM nginx:1.27-alpine
# Angular 17+ application builder outputs browser assets under dist/logistics/browser
COPY --from=build /workspace/logistics/frontend/dist/logistics/browser /usr/share/nginx/html
COPY logistics/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
