import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface WhatsAppModeProps {
  phone?: string;
  joinCode?: string;
}

export const WhatsAppMode: React.FC<WhatsAppModeProps> = ({
  phone = '+14155238886',
  joinCode = 'join various-mill',
}) => {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const openWhatsApp = () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(joinCode);
    const url = `https://wa.me/${cleaned}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold text-brand-textPrimary">WhatsApp Mode</h3>
      <p className="text-sm text-brand-textSecondary">
        If you prefer, send the document via WhatsApp to our Twilio sandbox number. Use the join
        code to connect the sandbox.
      </p>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-brand-textSecondary">Twilio Sandbox Number</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-medium text-brand-textPrimary">{phone}</span>
            <button
              onClick={() => copy(phone)}
              className="p-2 rounded-md bg-brand-bg border border-brand-border text-sm"
              aria-label="Copy phone"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-brand-textSecondary">Join Code</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-medium text-brand-textPrimary">{joinCode}</span>
            <button
              onClick={() => copy(joinCode)}
              className="p-2 rounded-md bg-brand-bg border border-brand-border text-sm"
              aria-label="Copy join code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={openWhatsApp}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-600"
        >
          <ExternalLink className="w-4 h-4" />
          Open WhatsApp
        </button>
        <a
          href="https://www.twilio.com/console/sms/whatsapp/sandbox"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-textSecondary underline"
        >
          Twilio Sandbox docs
        </a>
      </div>
    </div>
  );
};

export default WhatsAppMode;
