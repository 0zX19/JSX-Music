const { ClusterManager } = require("discord-hybrid-sharding");
require("dotenv").config();
const { createLogger, transports, format } = require("winston");
const axios = require("axios");
const NodeCache = require("node-cache");
const os = require("os");

// Logger setup
const logger = createLogger({
    level: "info",
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [new transports.Console()],
});

// In-memory global cache
const globalCache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // TTL 5 minutes

// Determine shards-per-cluster based on available CPU cores
const totalCPUs = os.cpus().length;
const shardsPerCluster = parseInt(process.env.SHARDS_PER_CLUSTER, 10) || Math.max(1, Math.floor(totalCPUs / 2));

// Function to get recommended shard count from Discord API
async function getRecommendedShardCount() {
    try {
        const response = await axios.get("https://discord.com/api/v10/gateway/bot", {
            headers: {
                Authorization: `Bot ${process.env.TOKEN}`,
            },
        });
        return response.data.shards || 1;
    } catch (err) {
        logger.error(`[API ERROR] Failed to fetch recommended shard count: ${err.message}`);
        return 1; // Fallback to 1 shard in case of an error
    }
}

// Initialize Cluster Manager
(async () => {
    const recommendedShards = await getRecommendedShardCount();
    logger.info(`Recommended shard count: ${recommendedShards}`);

    const manager = new ClusterManager(`${__dirname}/index.js`, {
        totalShards: recommendedShards,
        shardsPerClusters: shardsPerCluster,
        mode: "worker",
        token: process.env.TOKEN,
        debug: process.env.NODE_ENV !== "production", // Enable debug only in non-production
    });

    // IPC Handling
    manager.on("message", (cluster, message) => {
        try {
            switch (message.type) {
                case "setCache":
                    globalCache.set(message.key, message.value);
                    logger.info(`[CACHE] Set: ${message.key} -> ${message.value}`);
                    break;

                case "getCache":
                    const value = globalCache.get(message.key) || null;
                    cluster.send({ type: "cacheResponse", key: message.key, value });
                    logger.info(`[CACHE] Retrieved: ${message.key} -> ${value}`);
                    break;

                default:
                    logger.warn(`[IPC] Unknown message type: ${message.type}`);
                    break;
            }
        } catch (err) {
            logger.error(`[IPC ERROR] ${err.message}`);
        }
    });

    // Cluster event listeners
    manager.on("clusterCreate", (cluster) => {
        logger.info(`Cluster ${cluster.id} has been created and is online.`);
    });

    // Spawn clusters dynamically
    manager.spawn({
        amount: manager.totalShards,
        delay: 7000, // Delay between spawns
        timeout: -1, // No timeout
    })
        .then(() => {
            logger.info(`${manager.totalShards} shard(s) successfully spawned.`);
        })
        .catch((err) => {
            logger.error(`Error during shard spawning: ${err.message}`);
        });

    // Graceful shutdown
    process.on("SIGINT", () => {
        logger.info("Shutting down all clusters...");
        manager.respawn = false;
        manager.broadcastEval("process.exit(0)");
        process.exit(0);
    });
})();
