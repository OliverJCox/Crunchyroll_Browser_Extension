/* Makes request with user session cookie attached to Crunchyroll internal API auth/v1/token 
for bearer access token. If successful sends request to get history using bearer access token.*/
 
const AUTH_URL = 'https://www.crunchyroll.com/auth/v1/token';
const CONTENT_URL = 'https://www.crunchyroll.com/content/v2';

// Public Basic Auth header used by Crunchyroll's web client
const WEB_CLIENT_AUTH = 'Basic bm9haWhkZXZtXzZpeWcwYThsMHE6';

async function getAuthSession() {

    const response = await fetch(AUTH_URL, {
        method: 'POST',
        credentials: 'include', // Attaches your active etp_rt login cookie
        headers: {
            'Authorization': WEB_CLIENT_AUTH,
            /* OAuth 2.0 requires this format for the request body - Means key=value is expected
            for the body */
            'Content-Type': 'application/x-www-form-urlencoded', 
            'ETP-Anonymous-ID': crypto.randomUUID()
        },
        /* URLSearchParams puts the grant type with the cookie - refresh token grant type -
        into a key=value format as required by the Content-Type */
        body: new URLSearchParams({
            device_id: crypto.randomUUID(),
            device_type: 'Firefox on Windows',
            grant_type: 'etp_rt_cookie'
        })
    });

    if (!response.ok) {
        const body = await response.text();
        console.error('Auth response body:', body);
        throw new Error(`Auth failed (${response.status}). Make sure you are signed into Crunchyroll.`);
    }

    const data = await response.json();
    return {
        accessToken: data.access_token,
        accountId: data.account_id
    };
}

// Page size specifies how much watch history to return
export async function fetchWatchHistory(pageSize = 50) {

    // Makes sure bearer access token is in possession before proceeding
    const { accessToken, accountId } = await getAuthSession();

    // Builds the watch history endpoint URL with account ID and query parameters
    const url = `${CONTENT_URL}/${accountId}/watch-history?page_size=${pageSize}&locale=en-GB`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            // Athorises uses bearer access token and excepts JSON in return
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    // Check if the HTTP status code indicates an error
    if (!response.ok) {
        throw new Error(`History fetch failed (${response.status})`);
    }

    // Reads the body response stream from the request and parses it from a JSON to JS object
    const json = await response.json();
    return json.data || [];
}