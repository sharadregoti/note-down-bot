#!/bin/bash
tsc
docker build -t sharadregoti/note-down-bot:0.1.0 .
docker tag sharadregoti/note-down-bot:v0.1.0 asia-south1-docker.pkg.dev/try-out-gcp-features/try-out/note-down-bot:v0.1.0
docker push asia-south1-docker.pkg.dev/try-out-gcp-features/try-out/note-down-bot:v0.1.0

