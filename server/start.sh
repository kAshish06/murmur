    #!/bin/sh

    echo "Applying Prisma migrations..."
    npx prisma migrate deploy
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