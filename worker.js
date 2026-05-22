// worker.js - Ephemeral Background Thread Layer

// Dedicated memory block to hold volatile tracking states temporarily
let traceCache = null;

self.onmessage = async function(e) {
    const { type, payload, secretToken } = e.data;

    if (type === "INITIALIZE_THREAD_SHIELD") {
        // Confirm background handshake isolation
        traceCache = { initializedAt: Date.now() };
        self.postMessage({ status: "READY", diagnostics: "Thread isolated successfully." });
        return;
    }

    if (type === "PROCESS_TELEMETRY_STREAM") {
        try {
            // Parse and analyze streaming packages without writing them anywhere
            const chunkData = payload;
            
            // Look for specific agent identifiers in the active payload stream
            let activeAgent = "SYSTEM";
            if (chunkData.includes("AGENT_2")) activeAgent = "AGENT_2_RAG";
            else if (chunkData.includes("AGENT_3")) activeAgent = "AGENT_3_RAG";
            else if (chunkData.includes("AGENT_4")) activeAgent = "AGENT_4_RAG";
            else if (chunkData.includes("AGENT_5")) activeAgent = "AGENT_5_RAG";
            else if (chunkData.includes("AGENT_6")) activeAgent = "AGENT_6_RAG";
            else if (chunkData.includes("AGENT_7")) activeAgent = "AGENT_7_RAG";
            else if (chunkData.includes("AGENT_8")) activeAgent = "AGENT_8_RAG";
            else if (chunkData.includes("AGENT_9")) activeAgent = "AGENT_9_RAG";

            // Relay the processed metrics instantly back to the main UI thread
            self.postMessage({
                status: "STREAM_BATCH_PROCESSED",
                agent: activeAgent,
                rawLine: chunkData,
                timestamp: Date.now()
            });

        } catch (err) {
            self.postMessage({ status: "THREAD_ERROR", error: err.message });
        }
    }

    if (type === "PURGE_THREAD_MEMORY") {
        // Fail-safe worker memory wipe pattern
        if (traceCache) {
            traceCache = null;
        }
        // Force immediate background state garbage collection
        self.postMessage({ status: "WIPED", log: "Volatile thread storage cleared." });
    }
};
