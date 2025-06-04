    #!/bin/sh

    # Default values if not set in environment
REDIS_HOST_EFFECTIVE=${REDIS_HOST:-redis}
REDIS_PORT_EFFECTIVE=${REDIS_PORT:-6379}
RABBITMQ_HOST_EFFECTIVE=${RABBITMQ_HOST:-rabbitmq}
RABBITMQ_PORT_EFFECTIVE=${RABBITMQ_PORT:-5672}

WAIT_TIMEOUT=600 # seconds
WAIT_INTERVAL=2 # seconds

echo "Waiting for Redis to be available at ${REDIS_HOST_EFFECTIVE}:${REDIS_PORT_EFFECTIVE}..."
counter=0
while ! nc -z "${REDIS_HOST_EFFECTIVE}" "${REDIS_PORT_EFFECTIVE}" >/dev/null 2>&1; do
  counter=$((counter + WAIT_INTERVAL))
  if [ "$counter" -ge "$WAIT_TIMEOUT" ]; then
    echo "Timeout waiting for Redis. Exiting."
    exit 1
  fi
  sleep "$WAIT_INTERVAL"
done
echo "Redis is up."

echo "Waiting for RabbitMQ to be available at ${RABBITMQ_HOST_EFFECTIVE}:${RABBITMQ_PORT_EFFECTIVE}..."
counter=0
while ! nc -z "${RABBITMQ_HOST_EFFECTIVE}" "${RABBITMQ_PORT_EFFECTIVE}" >/dev/null 2>&1; do
  counter=$((counter + WAIT_INTERVAL))
  if [ "$counter" -ge "$WAIT_TIMEOUT" ]; then
    echo "Timeout waiting for RabbitMQ. Exiting."
    exit 1
  fi
  sleep "$WAIT_INTERVAL"
done
echo "RabbitMQ is up."

echo "Applying Prisma migrations..."
    DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
    MIGRATION_EXIT_CODE=$? # Capture the exit code of the migration command

    if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
      echo "Prisma migrations failed with exit code $MIGRATION_EXIT_CODE. Exiting."
      exit $MIGRATION_EXIT_CODE # Exit the script if migrations failed
    else
      echo "Prisma migrations applied successfully."
    fi

    echo "Starting Node.js application..."
    # Use 'exec' to replace the shell process with the node process
    exec npm start