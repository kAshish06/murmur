#!/bin/bash
set -e # Exit on error
# define variables
PROJECT_NAME="murmur"
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="${PROJECT_NAME}:${GIT_BRANCH}-${TIMESTAMP}"

log () {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

build () {
    # Build an image using docker build
    local context=$1
    local dockerfile=$2
    local image_name=$3
    log "Building Docker image: ${image_name}"
    docker build -t "${image_name}" -f "${dockerfile}" "${context}"

    log "Docker image built successfully: ${image_name}"
}

deploy_docker_compose () {
    local compose_file=${1:-"./server/docker-compose.yml"}
    # Build new images, stop running containers, and starts new containers
    log "Building and deploying services ..."
    if ! docker-compose -f $compose_file up -d --build; then
        log "Failed to deploy services."
        return 1
    fi
    log "Services deployed successfully."
}
stop_docker_compose () {
    local compose_file=${1:-"./server/docker-compose.yml"}
    log "Stopping docker compose services ..."
    if ! docker-compose -f $compose_file down; then
        log "Failed to stop docker compose services."
        return 1
    fi
    log "Docker compose services stopped successfully."
}

cleanup () {
    log "Removing stopped containers and unused images"
    docker container prune -f

    log "Removing dangling images .."
    docker image prune -f

    log "Cleaning up old images.."
    docker images --filter "reference=${PROJECT_NAME}:* --format "{{.ID}}" {{.CreatedSince}}" | \
    sort -r -k2 | \
    tail -n +6 | \
    awk '{print$1}' | \
    xargs -r docker rmi -f 2>/dev/null || true

    log "Removing unused networks..."
    docker network prune -f

    log "Cleanup completed successfully"

}

main () {
    local command=$1
    case "$command" in 
    "build")
        build "./server" "./server/Dockerfile" "$IMAGE_TAG-server"
        ;;
    "deploy")
        deploy_docker_compose
        ;;
    "stop")
        stop_docker_compose
        ;;
    "cleanup")
            cleanup
        ;;
    *)
        echo "Usage: $0 {build|deploy|stop|cleanup}"
        exit 1
        ;;
    esac
    log "Operation completed successfully."
}


main "$@"