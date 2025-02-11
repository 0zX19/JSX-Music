# Haruka Bot - Multifunctional Discord Bot

**Haruka** is a powerful, feature-rich Discord bot developed using `discord.js v14` and MongoDB for data storage. Haruka is designed to provide a wide range of features for server management, entertainment, and interaction. These include advanced music playback, giveaways, automated moderation, an economy system, and many more. The bot supports sharding for optimal performance, allowing it to handle large-scale Discord servers seamlessly.

## Key Features

### 🎶 **Advanced Music System**
Haruka supports high-quality music playback through `Lavalink`. The bot offers commands to play, pause, skip, and even enable autoplay for endless music streaming without interruption. Haruka is capable of handling large playlists and delivers a smooth listening experience.

### 🎉 **Giveaway Management**
Easily create, manage, and run giveaways using interactive buttons. Giveaways are stored in MongoDB, making it easy to track and resume giveaways. Users can enter giveaways, view information, and admins can reroll or end them with just a few commands.

### 💰 **Advanced Economy System**
Inspired by popular bots like UnbelievaBoat, Haruka comes with a full-fledged economy system. Users can:
- Earn virtual currency through commands like `work`, `hunt`, and `daily`.
- Battle other users or trade items.
- Access a virtual shop to buy items, including special "rings" for marriage.
- Build a "zoo" by hunting animals, with a wide range of animals to collect, each with different rarity levels.

### 🤖 **Automated Moderation (AutoMod)**
Haruka's AutoMod system helps server admins maintain order by automatically managing:
- **Spam detection**: Detects and deletes spam messages.
- **Mass mentions**: Detects and removes messages with excessive mentions.
- **Ghost pings**: Alerts users when they are pinged and the ping is deleted.
- **Strike system**: Admins can configure strikes for violations, with automated actions like timeout, kick, or ban after reaching the strike limit.

### 📩 **Advanced AutoResponder**
Haruka can automatically respond to certain trigger words or phrases, which can be added or removed using simple commands. The AutoResponder system is highly customizable, and users can view, delete, and manage responses with ease.

### 🛠️ **Hybrid Sharding**
Haruka uses `discord-hybrid-sharding` for managing large bot instances. This ensures that the bot can handle thousands of servers simultaneously while maintaining optimal performance and stability.

### 🚨 **Premium Vote System**
Support voting for premium features with Haruka’s vote system. Users can cast votes to unlock premium-only features, ensuring engagement and supporting the development of the bot.

### 🔍 **Advanced Logging**
Every action on the server is logged, from user bans to deleted messages. This ensures transparency and allows server admins to review any suspicious or harmful activity.

---

## Installation

To set up and run Haruka locally, follow these steps:

### Prerequisites
- Node.js v16.9.0 or newer
- MongoDB instance for data storage
- Lavalink server (for music playback)
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

### Step-by-Step Guide

1. **Clone the repository:**

   ```bash
   git clone https://github.com/username/haruka-bot.git
