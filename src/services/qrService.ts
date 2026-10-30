/**
 * Verifiable QR Code Generator Service
 * Encodes tamper-verifiable credential links and opaque credential references.
 */

import QRCode from 'qrcode';

export async function generateVerifiableQrCodeUrl(verificationUrl: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#17365D', // Institutional Deep Navy Blue
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code via qrcode package:', err);
    // Safe SVG fallback
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23FFFFFF"/><text x="50%" y="50%" text-anchor="middle" fill="%2317365D" font-family="monospace" font-size="12">QR_VERIFY_READY</text></svg>`;
  }
}
