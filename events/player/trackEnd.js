module.exports = async (client, player, track, payload) => {
    const autoplay = player.get("autoplay");

    if (autoplay) {
        const requester = player.get("requester");
        const identifier = track.identifier;
        const trackUri = track.uri;

        try {
            let searchResults;

            // Handle YouTube autoplay
            if (trackUri.includes("youtube.com")) {
                const youtubeSearch = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
                searchResults = await player.search(youtubeSearch, requester);
            
            // Handle Spotify autoplay
            } else if (trackUri.includes("spotify.com")) {
                const spotifySearch = `spotify:${identifier}`;
                searchResults = await player.search(spotifySearch, requester);

            // Handle SoundCloud autoplay
            } else if (trackUri.includes("soundcloud.com")) {
                searchResults = await player.search(trackUri, requester);
            }

            // Ensure search results are valid and contain tracks
            if (searchResults && searchResults.tracks && searchResults.tracks.length > 1) {
                // Limit the number of attempts to find a different track
                let attempts = 0;
                const maxAttempts = 3;
                let randomTrack;

                while (attempts < maxAttempts) {
                    const randomIndex = Math.floor(Math.random() * searchResults.tracks.length);
                    randomTrack = searchResults.tracks[randomIndex];

                    // Ensure it's not the same track
                    if (randomTrack.identifier !== identifier) {
                        break;
                    }
                    attempts++;
                }

                // If a different track is found, add it to the queue
                if (randomTrack && randomTrack.identifier !== identifier) {
                    await player.queue.add(randomTrack);
                } else {
                    console.warn("No different track found after several attempts.");
                }
            } else {
                console.warn("No tracks found or insufficient search results.");
            }

        } catch (error) {
            console.error(`Error in autoplay handling for track ${track.uri}:`, error.message);
        }
    }
};
