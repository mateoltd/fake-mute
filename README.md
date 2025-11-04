# Discord WebSocket Payload Modifier

A client-side JavaScript script to intercept, inspect, and modify outgoing WebSocket payloads on Discord by using a technique called [monkey-patching](https://en.wikipedia.org/wiki/Monkey_patch). This tool is designed for a specific purpose: **testing how a service handles malformed or unexpected data payloads by intentionally breaking them.**

> ### ⚠️ **IMPORTANT WARNING**
>
> This script is intended **strictly for educational purposes and for testing functionalities on services you own and manage in a controlled environment.**
>
> -   **Do NOT use this on the main Discord client or any production service.** Modifying client-side behavior can violate the Terms of Service of many platforms, including Discord.
> -   **Use at your own risk.** This can lead to account suspension, unexpected application behavior, or other issues. The author of this script is not responsible for any misuse or consequences.

## How It Works

The script operates in two phases:

1.  **Initialization (On Injection):**
    -   When you inject the script, it searches Discord's internal modules to find your current voice state (e.g., muted, deafened).
    -   If you are already deafened, it automatically sends a one-time, fake voice state update.
    -   If you are not deafened, it does nothing and simply waits to user action.

2.  **Interception (On Action):**
    -   The script monkey-patches the browser's native `WebSocket.prototype.send` method, acting as a middleman for all outgoing data.
    -   When a voice state update is sent (either by you or by the initializer), the script checks if it contains the `TRIGGER_KEY` (e.g., `"self_deaf"`).
    -   If the trigger is found, it replaces a valid piece of JSON (e.g., `'"self_mute":false'`) with an invalid string (e.g., `'ggs'`).
    -   This intentionally creates a malformed payload that the server must handle, allowing you to test its robustness.

## How to Execute

1.  **Configure the Script (Optional):**
    -   You can change the `TRIGGER_KEY` and the `MODIFICATION` strings in the `CONFIG` object at the top of the script if you need to test a different scenario.

2.  **Inject the Script:**
> If you don't know how to do this, you are not suitable for this kind of knowledge.

3.  **Verify it's Working:**
    -   After injection, check the console for `[Initializer]` logs. It will tell you if it found you deafened or not.
    -   You will also see `[Interceptor]` logs for every WebSocket message, showing the data type and content.
    -   When the modification happens, you will see the logs in the client console.
