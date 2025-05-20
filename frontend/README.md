# MongoDB Query Assistant

An AI-powered tool that helps you generate MongoDB queries from natural language descriptions.

## Features

- Two-step process: Submit schema first, then ask for queries
- Uses Groq's Llama3 model for accurate MongoDB query generation
- Clean, responsive UI with dark mode support
- Copy queries to clipboard with one click
- Toast notifications for user feedback

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Groq API key (sign up at [groq.com](https://console.groq.com))

### Backend Setup

1. Clone this repository
2. Navigate to the backend directory
3. Create a `.env` file based on `.env.example`:

4. Install dependencies:
   ```
   npm install
   ```
5. Start the server:
   ```
   npm run dev
   ```
   The server will be available at http://localhost:5005

### Frontend Setup

For standalone operation, use create-react-app or Next.js and add the ChatBot.js component.

## Usage

1. When the application loads, enter your MongoDB schema in the schema input field.
2. Click the arrow button or press Enter to submit the schema.
3. After the schema is set, you can now enter natural language descriptions of the queries you need.
4. The AI will generate the appropriate MongoDB query, which you can copy with the copy button.

## Example Queries

After setting a schema like:
```
users: {
  name: String,
  age: Number,
  email: String,
  createdAt: Date,
  address: {
    city: String,
    country: String
  },
  hobbies: [String]
}
```

You can ask:
- "Find all users older than 25 who live in Paris"
- "Get the count of users by country"
- "Find users who joined in the last month and have 'reading' as a hobby"

## Project Structure

```
├── server.js             # Express server entry point
├── controllers/
│   └── queryController.js # API controllers
├── routes/
│   └── api.js            # API routes
├── services/
│   └── groqService.js    # Service for interacting with Groq API
└── frontend/
    └── ChatBot.js        # React component for the UI
```

## License

MIT