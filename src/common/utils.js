export function getTimestampString() {
    const now = new Date();
    // Format: YYYY-MM-DD_HH-mm-ss
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function getDetailedTimestamp() {
    const now = new Date();
    return now.toISOString();
}

export function generateRequestId(vu, iter) {
    return `VU${vu}_ITER${iter}`;
}

export function generateUUID() {
    // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function logRequestResponse(method, url, requestData, response) {
    const requestId = generateRequestId(__VU, __ITER);
    const timestamp = getDetailedTimestamp();
    
    // Prepare request data
    const requestLog = {
        headers: requestData.headers || {},
        body: requestData.body || null,
    };
    
    // Prepare response data
    const timings = response.timings || {};
    const responseLog = {
        status: response.status,
        statusText: response.status_text || '',
        headers: response.headers || {},
        body: response.body || '',
        timings: {
            duration: timings.duration || 0,
            waiting: timings.waiting || 0,
            blocked: timings.blocked || 0,
            connecting: timings.connecting || 0,
            sending: timings.sending || 0,
            receiving: timings.receiving || 0,
        }
    };
    
    // Create log entry
    const logEntry = {
        timestamp: timestamp,
        requestId: requestId,
        method: method,
        url: url,
        request: requestLog,
        response: responseLog
    };
    
    // Log as pretty-printed JSON for better readability
    // Using JSON.stringify with 2-space indentation
    const prettyJson = JSON.stringify(logEntry, null, 2);
    // Log with separator markers for easy extraction
    // Format: K6_LOG_START\n[pretty JSON]\nK6_LOG_END
    console.log('K6_LOG_START');
    console.log(prettyJson);
    console.log('K6_LOG_END');
    
    return logEntry;
}
