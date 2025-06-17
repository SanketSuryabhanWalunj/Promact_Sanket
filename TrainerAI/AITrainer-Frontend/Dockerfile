FROM node:18 as build
USER root
WORKDIR /usr/src/app
COPY package*.json ./
# RUN npm install -g @angular/cli
RUN npm install
COPY . ./
RUN npm run build


FROM nginx:latest

# Remove default.conf if it exists
#RUN if [ -f /etc/nginx/conf.d/default.conf ]; then rm /etc/nginx/conf.d/default.conf; fi

# # Remove the existing default.conf file (if it exists)
# RUN rm /etc/nginx/conf.d/default.conf

# # # Copy the local default.conf to the container
# # COPY ./root/default.conf /etc/nginx/conf.d

# # Copying config file to conf.d directory
# #COPY default.conf /etc/nginx/conf.d/

COPY --from=build /usr/src/app/src/app/dist/aitrainer /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]