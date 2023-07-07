IMAGE_NAME=santas-delivery

build: rmi
	docker build -t $(IMAGE_NAME) .
	set -e ;\
	 CONTAINER_ID=`docker create $(IMAGE_NAME)` ;\
	 docker cp $${CONTAINER_ID}:/app/package-lock.json . ;\
	 docker rm -v $${CONTAINER_ID}

run:
	docker run\
	 --rm\
	 -it\
	 -v "$(CURDIR)/dist":/app/dist\
	 -v "$(CURDIR)/src":/app/src\
	 -v "$(CURDIR)/package-lock.json":/app/package-lock.json\
	 -v "$(CURDIR)/package.json":/app/package.json\
	 -v "$(CURDIR)/vite.config.js":/app/vite.config.js\
	 -p 3000:3000\
	 $(IMAGE_NAME)\
	 sh

rmi:
	-docker rmi `docker images -q -a $(IMAGE_NAME)`

prune:
	docker system prune -a
