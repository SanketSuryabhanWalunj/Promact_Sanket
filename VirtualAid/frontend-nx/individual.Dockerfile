FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --force; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

####################################################################################
FROM base AS builder
ARG NEXT_PUBLIC_API_BASE_URL_ARG
ARG NEXT_PUBLIC_REGISTER_EMAIL_ARG
ARG NEXT_PUBLIC_USER_ARG
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY_ARG
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL_ARG
ENV NEXT_PUBLIC_REGISTER_EMAIL=$NEXT_PUBLIC_REGISTER_EMAIL_ARG
ENV NEXT_PUBLIC_USER=$NEXT_PUBLIC_USER_ARG
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY_ARG
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build individual --verbose

########################################################################################
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/individual ./
USER nextjs
EXPOSE 4200
ENV PORT 4200
ENV HOSTNAME localhost
CMD [ "npm", "start" ]

#CMD [ "sleep", "infinity" ]  #TO STOP CONTAINER FROM EXITING EVEN AFTER ERROR OCCURS