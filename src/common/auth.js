import { check } from 'k6';
import http from 'k6/http';
import { BASE_URL } from './config.js';

export function login() {
    const url = `${BASE_URL}/auth`;
    const payload = JSON.stringify({
        email: "mweleyam@runchise.com",
        password: "testing123"
    });

    const params = {
        headers: {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'origin': 'https://pentest.runchise.com',
            'referer': 'https://pentest.runchise.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        },
    };

    const res = http.post(url, payload, params);

    const checkRes = check(res, {
        'auth status is 200': (r) => r.status === 200,
        'has access token': (r) => r.json('auth.access_token') !== undefined,
    });

    if (!checkRes) {
        throw new Error(`Authentication failed: ${res.status} ${res.body}`);
    }

    return res.json('auth.access_token');
}
