FROM node:20-alpine

WORKDIR /app

# Copy dependency mappings
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy configuration and static pages
COPY . .

EXPOSE 5173

# Force Vite to expose the port over container bridges using --host
CMD ["npm", "run", "dev", "--", "--host"]
