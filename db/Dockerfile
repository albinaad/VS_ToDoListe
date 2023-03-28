FROM mariadb

# Copy the exampledb.sql backup to the entrypoint folder like described in the manual of the mariadb image
COPY ./exampledb.sql /docker-entrypoint-initdb.d
