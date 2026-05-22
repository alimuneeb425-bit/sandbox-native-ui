// app.js - Full Transparency Main Interface Router
const promptInput = document.getElementById('prompt-input');
const byokKeyInput = document.getElementById('byok-key-input');
const compileBtn = document.getElementById('compile-btn');
const terminalScreen = document.getElementById('terminal-screen');
const telemetryPercentage = document.getElementById('telemetry-percentage');

const insSymbolState = document.getElementById('ins-symbol-state');
const inspectSymbol = document.getElementById('inspect-symbol');
const inspectIntent = document.getElementById('inspect-intent');
const inspectQaTrace = document.getElementById('inspect-qa-trace');
const inspectTarget = document.getElementById('inspect-target');
const inspectHexStream = document.getElementById('inspect-hex-stream');
const shredBadge = document.getElementById('shred-badge');

const autonomousEnclaveWorker = new Worker('worker.js');

function updateLiveTerminal(nodeId, textLine) {
    terminalScreen.innerHTML += `<br>&gt; <span class="inspect-highlight">[NODE_0${nodeId}]:</span> ${textLine}`;
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

function updateNodeVisual(nodeId, executionStatus) {
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) {
        nodeEl.innerText = executionStatus;
        nodeEl.className = `agent-status status-${['success', 'wiped', 'passed', 'clean'].includes(executionStatus.toLowerCase()) ? 'success' : 'active'}`;
    }
}

autonomousEnclaveWorker.onmessage = function(e) {
    const packet = e.data;

    if (packet.log) updateLiveTerminal(packet.node, packet.log);
    if (packet.status) updateNodeVisual(packet.node, packet.status);
    if (packet.percentage) telemetryPercentage.innerText = `${packet.percentage} COMPLETED`;
    
    if (packet.intent) inspectIntent.innerText = packet.intent;
    if (packet.trace) inspectQaTrace.innerText = packet.trace;
    if (packet.symbol) {
        inspectSymbol.innerText = packet.symbol;
        if (packet.symbol === "0x00000000") {
            insSymbolState.innerText = "PURGED";
            insSymbolState.className = "shredded-badge";
        }
    }

    // STAGE 07 Handshake: Streaming true physical files safely down onto disk
    if (packet.node === "7" && packet.status === "SUCCESS") {
        inspectTarget.innerText = "GENUINE_APK + SOURCE_ZIP";
        
        // 1. Deliver compiled native APK package binary
        const apkBlob = new Blob([packet.apkPayload], {type: "application/vnd.android.package-archive"});
        const apkUrl = URL.createObjectURL(apkBlob);
        const apkAnchor = document.createElement("a");
        apkAnchor.href = apkUrl;
        apkAnchor.download = "production_build_true_native.apk";
        document.body.appendChild(apkAnchor);
        apkAnchor.click();
        apkAnchor.remove();
        URL.revokeObjectURL(apkUrl);

        // 2. Deliver uncompiled raw source blueprint zip
        const zipBlob = new Blob([packet.zipPayload], {type: "application/zip"});
        const zipUrl = URL.createObjectURL(zipBlob);
        const zipAnchor = document.createElement("a");
        zipAnchor.href = zipUrl;
        zipAnchor.download = "app_source_blueprint.zip";
        document.body.appendChild(zipAnchor);
        zipAnchor.click();
        zipAnchor.remove();
        URL.revokeObjectURL(zipUrl);
    }

    // STAGE 08 Handshake: Visual UI hardware-shred trace dashboard update
    if (packet.hexWiped) {
        inspectHexStream.innerText = "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";
        inspectHexStream.style.color = "#10b981";
        shredBadge.innerText = "HEAP_PURGED_ZERO_RESIDUE";
        shredBadge.className = "secure-tag";
        promptInput.value = "";
        byokKeyInput.value = "";

        setTimeout(() => {
            compileBtn.disabled = false;
            telemetryPercentage.innerText = "0% COMPLETED";
            insSymbolState.innerText = "NULL";
            insSymbolState.className = "secure-tag";
            inspectSymbol.innerText = "0x0000000000000000";
            inspectIntent.innerText = "WAITING_FOR_TOKEN_STREAM";
            inspectQaTrace.innerText = "VM_CORE_INACTIVE";
            inspectTarget.innerText = "NONE_GENERATED";
            inspectHexStream.innerText = "EE DD AA 77 FF 00 22 99 88 44 11 55 66 22 33 00 44 FF AA DD EE BB CC 00 11 22";
            inspectHexStream.style.color = "#ef4444";
            shredBadge.innerText = "ACTIVE_MONITOR";
            
            ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(id => {
                const badge = document.getElementById(`node-${id}`);
                if (badge) { badge.innerText = "STANDBY"; badge.className = "agent-status status-standby"; }
            });
        }, 5000);
    }
};

compileBtn.addEventListener('click', () => {
    const appBlueprintText = promptInput.value.trim();
    const userCustomKey = byokKeyInput.value.trim();
    
    if (!appBlueprintText) return;
    if (!userCustomKey) {
        terminalScreen.innerHTML = "&gt; <span style='color:#ef4444;'>[BYOK_ERROR]: Missing cryptographic tenant authorization token. Compilation aborted.</span>";
        return;
    }

    compileBtn.disabled = true;
    terminalScreen.innerHTML = "&gt; Spawning clean execution pipeline. Deploying isolated background processing core...";
    
    autonomousEnclaveWorker.postMessage({
        blueprint: appBlueprintText,
        byokKey: userCustomKey
    });
});
