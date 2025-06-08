import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type } = req.query;

  if (!type || typeof type !== 'string' || !['privacy', 'terms', 'cookies'].includes(type)) {
    return res.status(400).json({ message: 'Invalid policy type' });
  }

  let browser;
  try {
    console.log('Starting PDF generation for type:', type);

    // Launch a headless browser with more robust configuration
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    console.log('Browser launched successfully');

    // Create a new page
    const page = await browser.newPage();
    console.log('New page created');

    // Set a longer timeout
    page.setDefaultNavigationTimeout(30000);

    // Set the viewport to a reasonable size
    await page.setViewport({ width: 1200, height: 1600 });

    // Determine the base URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.host || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    // Navigate to the appropriate policy page
    const url = `${baseUrl}/${type === 'privacy' ? 'privacy-policy' : type === 'terms' ? 'terms' : 'cookies'}`;
    console.log('Navigating to URL:', url);

    // Enable request interception for debugging
    await page.setRequestInterception(true);
    page.on('request', request => {
      console.log('Request:', request.method(), request.url());
      request.continue();
    });
    page.on('response', response => {
      console.log('Response:', response.status(), response.url());
    });

    // Navigate to the page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    if (!response) {
      throw new Error('Failed to get response from page');
    }

    if (!response.ok()) {
      throw new Error(`Page returned status ${response.status()}: ${response.statusText()}`);
    }

    console.log('Page loaded successfully');

    // Wait for the content to be fully loaded
    console.log('Waiting for content...');
    await page.waitForSelector('.prose', { timeout: 5000 });
    console.log('Content loaded');

    // Generate PDF with better options
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      timeout: 30000
    });
    console.log('PDF generated, size:', pdf.length);

    if (!pdf || pdf.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Set headers for PDF download
    const filename = type === 'privacy' ? 'adatvedelmi-nyilatkozat.pdf' :
                    type === 'terms' ? 'altalanos-szerzodesi-feltetelek.pdf' :
                    'cookie-szabalyzat.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);

    // Send the PDF
    console.log('Sending PDF response...');
    res.send(pdf);
    console.log('PDF sent successfully');
  } catch (error) {
    console.error('Error in PDF generation:', error);
    // Send a more detailed error message
    res.status(500).json({ 
      message: 'Failed to generate PDF',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  } finally {
    // Make sure to close the browser
    if (browser) {
      try {
        console.log('Closing browser...');
        await browser.close();
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
} 