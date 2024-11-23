import { google } from 'googleapis';

import key from './google_file.json' assert { type: 'json' };


export const SHEET_ID = '18AuUrliX0ZEb_gf46Z8P1qkdzx5R06WLprY1m4-jHaI';

const client = new google.auth.JWT(key.client_email, null, key.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
]);
const sheets = google.sheets({ version: 'v4', auth: client });

export default sheets;
