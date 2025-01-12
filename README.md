# Liar's Dice Online

A peer-to-peer online implementation of the classic bluffing dice game "Liar's Dice" built with Svelte and PeerJS.
[Demo](https://abo3skr2019.github.io/Liars-Dice-Svelte/)

## Features

- 🎲 Real-time peer-to-peer gameplay
- 💬 In-game chat system
- 🎮 No server required - works directly between browsers
- 🎯 Automatic turn management
- 🏳️ Surrender option
- 🔄 Play again functionality
- 👤 Automatic name generation from connection codes

## How to Play

1. **Starting the Game**
   - Enter your name (optional) or let the game generate one from your connection code
   - Share your Connection Code with another player
   - Or enter someone else's Connection Code to join their game

2. **Game Rules**
   - Each player starts with 5 dice
   - Players take turns making bids about the total number of dice showing a particular value
   - Ones (1s) are wild and count as any number
   - Players can either make a higher bid or challenge the previous bid
   - If a challenge is successful, the bidder loses a die
   - If a challenge fails, the challenger loses a die
   - The game continues until one player loses all their dice

3. **Making a Bid**
   - Enter the quantity of dice
   - Enter the dice value (1-6)
   - Click "Make Bid"

4. **Challenging**
   - Click "Challenge" to challenge the previous bid
   - The game will automatically determine the winner

## Development
### Todo
- Multiplayer Support instead of just duels 
- Speedup new Round 
- 3d Dice (Maybe)
### Prerequisites
- Node.js
- npm or yarn

### Setup
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

