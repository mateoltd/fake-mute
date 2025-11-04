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

    async function initialize() {
        console.log("[Interceptor] Initializing. Checking current voice state...");
        
        let ws, voiceStateStore;
        const webpackChunk = window.webpackChunkdiscord_app;
        if (!webpackChunk) {
            console.error("[Interceptor] Could not find Discord's webpack chunk. Aborting initialization.");
            return;
        }

        // A more targeted search for Discord's internal modules
        webpackChunk.push([
            [Math.random()], {}, 
            (req) => {
                for (const id in req.c) {
                    const module = req.c[id].exports;
                    if (!module) continue;

                    if (!ws && module.send && typeof module.send === 'function' && module._handleDispatch) {
                        ws = module;
                    }
                    if (!voiceStateStore && module.getVoiceStateForUser && module.getCurrentUser) {
                        voiceStateStore = module;
                    }
                    if (ws && voiceStateStore) break;
                }
            }
        ]);
        webpackChunk.pop();

        if (!ws || !voiceStateStore) {
            console.warn("[Interceptor] Automatic initialization failed. Discord's internal structure may have changed. Please manually toggle your deafen state once to activate the modification for your current session.");
            return;
        }

        const currentUserId = voiceStateStore.getCurrentUser().id;
        const currentVoiceState = voiceStateStore.getVoiceStateForUser(currentUserId);

        if (currentVoiceState && currentVoiceState.selfDeaf) {
            console.log("[Initializer] User is already deafened. Sending a trigger payload to test the edge case.");
            
            const payload = {
                op: 4,
                d: {
                    guild_id: currentVoiceState.guildId,
                    channel_id: currentVoiceState.channelId,
                    self_mute: currentVoiceState.selfMute,
                    self_deaf: true
                }
            };
            
            ws.send(JSON.stringify(payload));
        } else {
            console.log("[Initializer] User is not deafened. The script will now listen for changes.");
        }
    }

    initialize();

})();
