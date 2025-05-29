# Liar's Dice Online

A peer-to-peer online implementation of the classic bluffing dice game "Liar's Dice" built with Svelte and PeerJS.
[Demo](https://liars.askardesign.com/)

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
- [x] add a max to the quantity to be the sum of mydice+opponentdice
- [ ] Set ranges to 1 on round reset 
  - [ ] Change the Face to start from 2 
- [x] Add bid validation so that the player can't decrease the denomination on the same dice count
  - Although some UI/UX issues are happening due to it 
- [ ] Multiplayer Support instead of just duels 
- [ ] Change all alerts to modals for better UX
- [x] Speedup new Round 
- [x] QR Code input for connection codes 
- [x] 3d Dice (Maybe)
  - Well We made better dice so i'll mark this off for now 

### Prerequisites
- Node.js
- npm

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

