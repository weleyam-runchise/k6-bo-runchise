import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { login } from '../../common/auth.js';
import { BASE_URL } from '../../common/config.js';
import { getTimestampString } from '../../common/utils.js';

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
            "delivery_date": "16/12/2025",
            "location_to_id": 2661,
            "location_to_type": "Location",
            "location_from_id": 2652,
            "location_from_type": "Location",
            "notes": "k6 load test",
            "acceptance_proofs": [],
            "delivery_proofs": [],
            "delivery_transaction_lines_attributes": [
                {
                    "order_transaction_id": 34623,
                    "order_transaction_line_id": 56606,
                    "delivered_qty": "1",
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

    check(res, {
        'create delivery status is 200': (r) => r.status === 200,
        'has delivery id': (r) => r.json('delivery_detail.id') !== undefined,
        'status is sent': (r) => r.json('delivery_detail.status') === 'sent',
    });

    console.log(`Response: ${res.body}`);
}

export function handleSummary(data) {
    const timestamp = getTimestampString();
    const reportName = `reports/Delivery_Create_${timestamp}.html`;

    return {
        [reportName]: htmlReport(data, { title: `Create Delivery - ${BASE_URL}` }),
    };
}
