(function() {
    'use strict';

    const CONFIG = {
        TRIGGER_KEY: "self_deaf",
        MODIFICATION: {
            find: '"self_mute":false',
            replaceWith: 'ggs'
        }
    };

    WebSocket.prototype.original = WebSocket.prototype.send;

    WebSocket.prototype.send = function(data) {
        console.log('[Interceptor] Data type:', typeof data);
        console.log('[Interceptor] Data content:', data);

        if (typeof data === 'string') {
            if (data.includes(CONFIG.TRIGGER_KEY)) {
                console.log("[Interceptor] Mute/Deafen action detected.");
                data = data.replace(CONFIG.MODIFICATION.find, CONFIG.MODIFICATION.replaceWith);
                console.log("[Interceptor] Payload successfully modified.");
            }
        }
        
        WebSocket.prototype.original.call(this, data);
    };

    // This function runs once on script injection to handle pre-existing states
    async function initialize() {
        console.log("[Interceptor] Initializing. Checking current voice state...");
        
        // Find Discord's internal modules. This is a bit of a hack but is the most reliable way
        let ws, voiceStateStore;
        const webpackChunk = window.webpackChunkdiscord_app;
        if (!webpackChunk) {
            console.error("[Interceptor] Could not find Discord's webpack chunk. Aborting initialization.");
            return;
        }

        webpackChunk.push([
            [Math.random()], {}, 
            (req) => {
                for (const id in req.c) {
                    const module = req.c[id].exports;
                    if (!module) continue;

                    // Find the WebSocket instance
                    if (module.send && typeof module.send === 'function' && module.addEventListener) {
                        ws = module;
                    }
                    // Find the voice state store
                    if (module.getVoiceStateForUser && module.getCurrentUser) {
                        voiceStateStore = module;
                    }
                }
            }
        ]);
        webpackChunk.pop(); // Clean up the temporary chunk

        if (!ws || !voiceStateStore) {
            console.error("[Interceptor] Could not find WebSocket or VoiceState modules. Discord's UI may have changed.");
            return;
        }

        // Get the current user's voice state
        const currentUserId = voiceStateStore.getCurrentUser().id;
        const currentVoiceState = voiceStateStore.getVoiceStateForUser(currentUserId);

        if (currentVoiceState && currentVoiceState.selfDeaf) {
            console.log("[Initializer] User is already deafened. Sending a trigger payload to test the edge case.");
            
            // Craft a payload that mimics a voice state update to trigger the interceptor
            const payload = {
                op: 4, // Opcode for Voice State Update
                d: {
                    guild_id: currentVoiceState.guildId,
                    channel_id: currentVoiceState.channelId,
                    self_mute: currentVoiceState.selfMute,
                    self_deaf: true // Ensure the trigger key is present
                }
            };
            
            // Send the crafted payload. This will be intercepted by our patched function
            ws.send(JSON.stringify(payload));
        } else {
            console.log("[Initializer] User is not deafened. No action taken. The script will now listen for changes.");
        }
    }

    initialize();

})();
