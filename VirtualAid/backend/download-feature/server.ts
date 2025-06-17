import express from 'express';
import http from 'node:http';
import WebSocket from 'ws';
import puppeteer, { PDFOptions } from 'puppeteer';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Healthcheck route
app.get('/healthdownload', (req, res) => {
    res.status(200).send('OK');
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (message: string) => {
        try {
            // Generate PDF from HTML
            const { html, options } = JSON.parse(message.toString());
            const pdfBuffer = await htmlToPdf(html, options);
            ws.send(pdfBuffer);
        } catch (error) {
            ws.send(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
});

async function htmlToPdf(html: string, options: PDFOptions | undefined): Promise<Buffer> {
    const browser = await puppeteer.launch({
        args: [
            "--headless",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--remote-debugging-port=9222",
            "--remote-debugging-address=0.0.0.0",
            "--no-sandbox"
        ]
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf(options ?? {
        printBackground: true,
        format: 'A4'
    });
    await browser.close();
    return pdfBuffer;
}

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
    console.log(`Server is listening on container port ${PORT}`);
});