# 1. Base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy full backend source code
COPY . .

# 6. Expose port
EXPOSE 3000

# 7. Start the application
CMD ["node", "main.js"]
