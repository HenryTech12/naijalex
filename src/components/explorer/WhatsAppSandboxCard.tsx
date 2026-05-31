import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, QrCode } from 'lucide-react';

const SANDBOX_NUMBER = import.meta.env.VITE_WHATSAPP_SANDBOX_NUMBER || '';
const SANDBOX_JOIN_CODE = import.meta.env.VITE_WHATSAPP_SANDBOX_JOIN_CODE || '';
const SANDBOX_QR_URL = import.meta.env.VITE_WHATSAPP_SANDBOX_QR_URL || '';
const SANDBOX_DEEPLINK = import.meta.env.VITE_WHATSAPP_SANDBOX_DEEPLINK || '';

const toWaDeepLink = (phoneNumber: string, joinCode: string): string => {
  const normalized = phoneNumber.replace(/\D/g, '');
  if (!normalized || !joinCode) {
    return '';
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(joinCode)}`;
};

export const WhatsAppSandboxCard: React.FC = () => {
  const [copiedField, setCopiedField] = useState<'number' | 'code' | null>(null);

  const whatsappDeepLink = useMemo(() => {
    return SANDBOX_DEEPLINK || toWaDeepLink(SANDBOX_NUMBER, SANDBOX_JOIN_CODE);
  }, []);

  const hasConfig = Boolean(SANDBOX_NUMBER && SANDBOX_JOIN_CODE);

  const copyText = async (value: string, field: 'number' | 'code') => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-border bg-gradient-to-r from-primary-50 to-white">
        <h2 className="text-sm sm:text-base font-semibold text-brand-textPrimary flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          Connect to WhatsApp Sandbox
        </h2>
        <p className="text-xs text-brand-textSecondary mt-1">
          Connect once to receive analysis updates through WhatsApp.
        </p>
      </div>

      {!hasConfig ? (
        <div className="px-5 py-4 text-xs sm:text-sm text-brand-textSecondary">
          Configure
          {' '}
          <code className="bg-brand-bg px-1.5 py-0.5 rounded">VITE_WHATSAPP_SANDBOX_NUMBER</code>,
          {' '}
          <code className="bg-brand-bg px-1.5 py-0.5 rounded">VITE_WHATSAPP_SANDBOX_JOIN_CODE</code>
          {' '}
          and optionally
          {' '}
          <code className="bg-brand-bg px-1.5 py-0.5 rounded">VITE_WHATSAPP_SANDBOX_QR_URL</code>
          {' '}
          in your .env file.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          <div className="rounded-xl border border-brand-border p-4 bg-brand-bg/50">
            <p className="text-sm font-semibold text-brand-textPrimary mb-1">Send a WhatsApp message</p>
            <p className="text-xs text-brand-textSecondary mb-4">Send from your phone to this sandbox number.</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-brand-textPrimary">
                <span className="font-medium">{SANDBOX_NUMBER}</span>
                <button
                  type="button"
                  onClick={() => copyText(SANDBOX_NUMBER, 'number')}
                  className="text-brand-textSecondary hover:text-brand-textPrimary"
                  aria-label="Copy WhatsApp number"
                >
                  {copiedField === 'number' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-brand-textPrimary">
                <span>
                  with code
                  {' '}
                  <strong>{SANDBOX_JOIN_CODE}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => copyText(SANDBOX_JOIN_CODE, 'code')}
                  className="text-brand-textSecondary hover:text-brand-textPrimary"
                  aria-label="Copy WhatsApp join code"
                >
                  {copiedField === 'code' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {whatsappDeepLink && (
              <a
                href={whatsappDeepLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Open WhatsApp
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="rounded-xl border border-brand-border p-4 bg-white flex flex-col items-center justify-center min-h-[210px]">
            {SANDBOX_QR_URL ? (
              <>
                <p className="text-sm font-semibold text-brand-textPrimary mb-3">Scan QR code on mobile</p>
                <img
                  src={SANDBOX_QR_URL}
                  alt="WhatsApp sandbox QR code"
                  className="w-40 h-40 object-contain"
                />
              </>
            ) : (
              <div className="text-center">
                <QrCode className="w-8 h-8 text-brand-textSecondary mx-auto mb-2" />
                <p className="text-xs text-brand-textSecondary">
                  Add
                  {' '}
                  <code className="bg-brand-bg px-1.5 py-0.5 rounded">VITE_WHATSAPP_SANDBOX_QR_URL</code>
                  {' '}
                  to show a QR code.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
