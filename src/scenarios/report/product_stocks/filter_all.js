import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { login } from '../../../common/auth.js';
import { BASE_URL } from '../../../common/config.js';
import { getTimestampString } from '../../../common/utils.js';

export const options = {
    vus: 1,
    duration: '30s',
};

export function setup() {
    console.log(`\n🎯 Target Environment: ${BASE_URL}\n`);
    return login();
}

export default function (accessToken) {
    const params = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Brand-Uuid': '0a067f07-7515-4551-860f-a58a4d24122c',
            'accept': 'application/json, text/plain, */*',
            'referer': 'https://pentest.runchise.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        },
    };

    // filter_by_stock=all
    const queryParams = [
        'end_date=15%2F12%2F2025',
        'is_select_all_location=true',
        'is_select_all_group_category=true',
        'is_select_all_category=true',
        'is_select_all_product_group=false',
        'is_select_all_product=true',
        'show_in_transit_values=false',
        'show_incoming_values=false',
        'show_pending_values=false',
        'show_available_qty_values=false',
        'sort_by=product',
        'filter_by_stock=all',
        'page=1',
        'item_per_page=25'
    ].join('&');

    const url = `${BASE_URL}/report/product_stocks?${queryParams}`;

    const res = http.get(url, params);

    check(res, {
        'product stocks all status is 200': (r) => r.status === 200,
    });

    sleep(1);
}

export function handleSummary(data) {
    const timestamp = getTimestampString();
    const reportName = `reports/ProductStocks_All_${timestamp}.html`;

    return {
        [reportName]: htmlReport(data, { title: `Product Stocks (All) - ${BASE_URL}` }),
    };
}
