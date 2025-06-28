# Known Issues & Debugging Best Practices
This document records hard-won knowledge from past debugging sessions. It should be consulted before tackling complex bugs.

1. Rendering: The "White Box" Bug
Symptom: A sprite (especially the player) renders with a solid white box behind it, even though the PNG file has a transparent background.

Root Cause: This is a "canvas state pollution" issue. Another rendering operation elsewhere in the code is changing the canvas's globalCompositeOperation without setting it back.

Solution: The engine now contains a "Systemic State Reset" in the main Game.render() loop. It explicitly sets globalCompositeOperation = 'source-over' for all canvas layers on every frame, making the pipeline robust against this bug.

Diagnostic: If this bug reappears, the first step is to use the test.html "Clean Room Test" to verify the integrity of the asset file itself.

2. Asset Loading: The "Stale Script" Bug
Symptom: Code changes (especially to core files like game.js or loading.js) do not seem to apply, and the game exhibits old behavior even after a hard refresh (Ctrl+Shift+R).

Root Cause: Aggressive caching by the local development server.

Solution: When testing, always have the browser's Developer Tools open (F12), navigate to the "Network" tab, and ensure the "Disable cache" checkbox is ticked. This is the most reliable way to ensure the latest code is being run.

3. Assets: The "Corrupted PNG" Bug
Symptom: An asset fails to load, or renders incorrectly (e.g., as a giant, non-transparent square).

Root Cause: A Node.js utility script (likely related to assets.js or placeholder generation) with pixel-processing logic accidentally overwrote the original, transparent PNG file on disk with a new, corrupted version that had a flattened white background.

Solution: The only fix is to manually restore the asset. Open the damaged PNG file in an image editor (like GIMP), remove the background, and re-export it with a proper alpha (transparency) channel. 