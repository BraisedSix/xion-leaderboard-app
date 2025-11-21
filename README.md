# Todo App

This application provides a basic implementation of the DocuStore smart contract which is a decentralized document storage solution. DocuStore enables users to store and manage structured documents within collections.

The major features include:

* Create, read, update, and delete documents
* Granular access control
* Querying all collection and document data

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/burnt-labs/todo-app-frontend.git
   cd todo-app-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following configuration:

   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   NEXT_PUBLIC_TREASURY_ADDRESS=your_treasury_contract
   NEXT_PUBLIC_RPC_URL=https://rpc.xion-testnet-2.burnt.com:443
   NEXT_PUBLIC_REST_URL=https://api.xion-testnet-2.burnt.com
   ```

   * `NEXT_PUBLIC_CONTRACT_ADDRESS`: The deployed address of your DocuStore smart contract
   * `NEXT_PUBLIC_TREASURY_ADDRESS`: The address of your fee treasury contract
   * `NEXT_PUBLIC_RPC_URL`: The RPC endpoint used to send transactions and interact with the Xion blockchain (can be changed to point to a different network or node)
   * `NEXT_PUBLIC_REST_URL`: The REST API endpoint used to query blockchain data and contract state (also configurable if using a different network or node)

4. Start the development server:

   ```bash
   npm run dev
   ```

## Smart Contract Collections

This app integrates with a DocuStore smart contract that defines the following data models:

### Documents Collection

```rust
struct Todo {
  id: String;
  text: String;
  completed: Boolean;
  createdAt: Number;
}
```

### Profiles Collection

```rust
struct Profile {
  displayName: String;
  bio: String;
  avatar: String;
  socialLinks: {
    twitter?: String;
    github?: String;
    website?: String;
  };
}
```

### Settings Collection

```rust
struct Settings {
  darkMode: Boolean;
  notifications: Boolean;
  language: String;
  timezone: String;
}
```

## Frontend Structure

### Pages

1. **Dashboard** (`/`)

   * Overview of recent todos
   * Quick access to key features
   * Profile snapshot

2. **Todos** (`/documents`)

   * View all todos
   * Create and manage todos

3. **Profile** (`/profile`)

   * Update display name, bio, avatar
   * Manage social links

4. **Settings** (`/settings`)

   * Toggle dark mode and notifications
   * Set language and timezone preferences
