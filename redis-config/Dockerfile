FROM redis:7-alpine

# Copy the ACL file into the image. 
# Assumes users.acl is in the same directory as this Dockerfile (the build context).
COPY users.acl /usr/local/etc/redis/users.acl

# Set the command to start Redis with the ACL file
CMD ["redis-server", "--aclfile", "/usr/local/etc/redis/users.acl"]
