    #!/bin/sh

# Default values if not set in environment
RABBITMQ_HOST_EFFECTIVE=${RABBITMQ_HOST:-rabbitmq}
RABBITMQ_PORT_EFFECTIVE=${RABBITMQ_PORT:-5672}

WAIT_TIMEOUT=300 # seconds (5 minutes)
WAIT_INTERVAL=5 # seconds

echo "Waiting for RabbitMQ to be available at ${RABBITMQ_HOST_EFFECTIVE}:${RABBITMQ_PORT_EFFECTIVE}..."
counter=0
while ! nc -z "${RABBITMQ_HOST_EFFECTIVE}" "${RABBITMQ_PORT_EFFECTIVE}" >/dev/null 2>&1; do
  counter=$((counter + WAIT_INTERVAL))
  if [ "$counter" -ge "$WAIT_TIMEOUT" ]; then
    echo "Timeout waiting for RabbitMQ. Exiting."
    exit 1
  fi
  echo "Still waiting for RabbitMQ... (${counter}s elapsed)"
  sleep "$WAIT_INTERVAL"
done

echo "RabbitMQ is up."
# Add a small delay to ensure RabbitMQ is fully ready
sleep 5

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