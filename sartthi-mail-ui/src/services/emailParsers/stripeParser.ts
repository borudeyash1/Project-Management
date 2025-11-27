export interface StripeEmailData {
    type: 'payment_received' | 'payment_failed' | 'invoice' | 'payout' | 'dispute' | 'subscription' | 'generic';
    amount?: string;
    currency?: string;
    customerName?: string;
    customerEmail?: string;
    status?: 'succeeded' | 'failed' | 'pending' | 'refunded';
    invoiceNumber?: string;
    date?: string;
    url?: string;
    description?: string;
}

export const parseStripeEmail = (htmlBody: string, textBody: string, subject: string): StripeEmailData => {
    const html = htmlBody || textBody;
    const subjectLower = subject.toLowerCase();

    // Detect email type
    let type: StripeEmailData['type'] = 'generic';

    if (subjectLower.includes('payment') && subjectLower.includes('received')) {
        type = 'payment_received';
    } else if (subjectLower.includes('payment') && (subjectLower.includes('failed') || subjectLower.includes('declined'))) {
        type = 'payment_failed';
    } else if (subjectLower.includes('invoice')) {
        type = 'invoice';
    } else if (subjectLower.includes('payout')) {
        type = 'payout';
    } else if (subjectLower.includes('dispute') || subjectLower.includes('chargeback')) {
        type = 'dispute';
    } else if (subjectLower.includes('subscription')) {
        type = 'subscription';
    }

    // Extract amount
    const amountMatch = html.match(/\$?([\d,]+\.\d{2})\s*([A-Z]{3})?/) || subject.match(/\$?([\d,]+\.\d{2})/);
    const amount = amountMatch ? amountMatch[1] : undefined;
    const currency = amountMatch?.[2] || 'USD';

    // Extract customer info
    const customerNameMatch = html.match(/(?:from|customer|by)\s+([A-Z][a-zA-Z\s]+?)(?:\s+<|$)/i);
    const customerName = customerNameMatch ? customerNameMatch[1].trim() : undefined;

    const customerEmailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const customerEmail = customerEmailMatch ? customerEmailMatch[1] : undefined;

    // Extract status
    let status: StripeEmailData['status'] = 'pending';
    if (subjectLower.includes('succeeded') || subjectLower.includes('successful') || subjectLower.includes('received')) {
        status = 'succeeded';
    } else if (subjectLower.includes('failed') || subjectLower.includes('declined')) {
        status = 'failed';
    } else if (subjectLower.includes('refund')) {
        status = 'refunded';
    }

    // Extract invoice number
    const invoiceMatch = html.match(/(?:invoice|#)\s*([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceMatch ? invoiceMatch[1] : undefined;

    // Extract URL
    const urlMatch = html.match(/https:\/\/(?:dashboard\.)?stripe\.com\/[^\s"<]+/);
    const url = urlMatch ? urlMatch[0] : undefined;

    // Extract description
    const descMatch = html.match(/<p[^>]*>(.*?)<\/p>/s);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 100) : undefined;

    return {
        type,
        amount,
        currency,
        customerName,
        customerEmail,
        status,
        invoiceNumber,
        url,
        description
    };
};
