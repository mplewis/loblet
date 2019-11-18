#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

bin/build.sh
docker run --entrypoint=bash -it loblet
