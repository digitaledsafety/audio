# Media Player Node

The Media Player Node is a versatile audio source node that streams and plays standard web media audio file formats, including WAV, MP3, OGG, FLAC, and WebM.

## Inputs

*   **Gate In**: High voltage (+1V or higher) triggers audio playback from the beginning.

## Outputs

*   **Audio**: The processed audio output signal of the media file.

## Controls

*   **Audio URL**: The URL of the web audio media file to load and play.
*   **Play**: Triggers audio playback from the start.
*   **Stop**: Stops active audio playback.
*   **Gain**: Adjusts overall output volume (0.0 to 2.0).
*   **Speed**: Adjusts the playback speed (0.1x to 4.0x speed multiplier).
*   **Pitch (st)**: Transposes pitch in semitones (-12 to +12 semitones).
*   **Reverse**: Reverses buffer playback direction.
*   **Loop**: Toggles continuous playback looping.

## Recommended CC0 & Open-Source Audio Resources

You can load publicly accessible audio URLs into the Media Player node. The following popular repositories host public domain (CC0) and open-source audio samples and sound effects:

*   **[Freesound.org](https://freesound.org/)**: A massive collaborative database of audio snippets, samples, and recordings. Filter by "Creative Commons 0" license to find public domain sounds.
*   **[Openverse](https://openverse.org/)**: An open-source search engine for CC-licensed and public domain media, managed by the WordPress Foundation.
*   **[Wikimedia Commons](https://commons.wikimedia.org/)**: A database of freely usable media files, including historical recordings, nature sounds, and musical samples.
*   **[Internet Archive](https://archive.org/details/audio)**: A digital library offering free access to millions of public domain audio recordings, field recordings, and music tracks.
*   **[Free Music Archive (FMA)](https://freemusicarchive.org/)**: A repository of royalty-free and Creative Commons music tracks (check individual track licenses for CC0 or Public Domain designations).

## Licensing Disclaimer & Technical Limitations

### Copyright & Licensing Due Diligence
Users are strictly responsible for exercising due diligence regarding copyright, licensing terms, and permissions before loading and using third-party audio files in their projects. Always verify the license of individual tracks or samples on the source website prior to use, public performance, or redistribution.

### Technical Requirements & Limitations
When linking external audio files in the Media Player node, keep the following technical requirements in mind:

*   **Direct Audio Asset URL**: The URL entered into the Media Player node must point directly to a downloadable media asset file (e.g., `https://example.com/audio.mp3`) rather than an HTML webpage or embedded player page.
*   **CORS (Cross-Origin Resource Sharing)**: Web browsers enforce CORS security policies. The server hosting the audio file must include appropriate CORS response headers (e.g., `Access-Control-Allow-Origin: *`) to allow web applications to fetch and decode the audio data using the Web Audio API.
*   **Supported File Formats**: The browser's Web Audio API must support the audio file format. Standard supported formats across modern browsers include WAV, MP3, OGG, FLAC, and WebM.
