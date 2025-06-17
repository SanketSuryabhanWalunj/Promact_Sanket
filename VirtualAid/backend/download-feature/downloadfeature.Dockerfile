FROM zenika/alpine-chrome:with-node
COPY download-feature/package.json download-feature/server.ts download-feature/tsconfig.json /usr/src/app/
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
WORKDIR /usr/src/app
RUN npm install
RUN npm run build
CMD ["node", "/usr/src/app/dist/server.js"]