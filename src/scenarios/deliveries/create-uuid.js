import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { login } from '../../common/auth.js';
import { BASE_URL } from '../../common/config.js';
import { getTimestampString, logRequestResponse } from '../../common/utils.js';

export const options = {
    vus: 1,
    duration: '30s',
};

export function setup() {
    console.log(`\n🎯 Target Environment: ${BASE_URL}\n`);
    return login();
}

export default function (accessToken) {
    const url = `${BASE_URL}/deliveries`;
    const payload = JSON.stringify({
        "delivery_transaction": {
            "delivery_date": "22/01/2026",
            "location_to_id": 2657,
            "location_to_type": "Location",
            "location_from_id": 2652,
            "location_from_type": "Location",
            "acceptance_proofs": [],
            "delivery_proofs": [],
            "unique_key": "b1de04cc-517b-4e49-a06c-b9e770b695a2",
            "delivery_transaction_lines_attributes": [
                {
                    "order_transaction_id": 35062,
                    "order_transaction_line_id": 57385,
                    "delivered_qty": "30",
                    "expiry_details": []
                },
                {
                    "order_transaction_id": 35062,
                    "order_transaction_line_id": 57386,
                    "delivered_qty": "25",
                    "expiry_details": []
                }
            ]
        }
    });

    const params = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Brand-Uuid': '74dcf826-aaa2-47bd-a341-aac602c544a8',
            'Content-Type': 'application/json',
            'accept': 'application/json, text/plain, */*',
            'user-agent': 'k6-load-test',
        },
    };

    const res = http.post(url, payload, params);

    // Log request and response as paired JSON
    logRequestResponse('POST', url, { headers: params.headers, body: payload }, res);

    check(res, {
        'create delivery status is 200': (r) => r.status === 200,
        'has delivery id': (r) => r.json('delivery_detail.id') !== undefined,
        'status is sent': (r) => r.json('delivery_detail.status') === 'sent',
    });
}

export function handleSummary(data) {
    const timestamp = getTimestampString();
    const reportName = `reports/Delivery_Create_${timestamp}.html`;

    return {
        [reportName]: htmlReport(data, { title: `Create Delivery - ${BASE_URL}` }),
    };
}
