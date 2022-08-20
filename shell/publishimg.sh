#!/usr/bin/env bash

npm run build
# docker login --username=walker088 cloud.canister.io:5000
docker build . -t walker088/svtblog
docker image tag walker088/svtblog cloud.canister.io:5000/walker088/svtblog
docker image prune
docker image ls

docker push cloud.canister.io:5000/walker088/svtblog:latest
