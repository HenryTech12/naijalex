import React, { useState, useEffect } from 'react';
import { Loader2, Play, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import type { EndpointConfig } from '../../types';
import { useApp } from '../../contexts/AppContext';
import {
  API_BASE,
  getHealth,
  createUser,
  getUserProfile,
  analyzeDocument,
  getAnalysis,
  getRiskCard,
  sendWhatsAppWebhook,
  getErrorMessage,
  getRiskCardUrl,
  getAnalysisHistory,
  getSavedAnalysis,
  sendChatQuestion,
} from '../../api/client';
import type { WhatsAppWebhookPayload } from '../../types';

interface EndpointFormProps {
  endpoint: EndpointConfig;
  onResponse: (response: { status: number; headers: Record<string, string>; data: unknown }) => void;
  onError: (error: string) => void;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500 text-white',
  POST: 'bg-blue-500 text-white',
  PUT: 'bg-amber-500 text-white',
  DELETE: 'bg-red-500 text-white',
};

export const EndpointForm: React.FC<EndpointFormProps> = ({ endpoint, onResponse, onError }) => {
  const {
    userId,
    analysisRequestId,
    analysisId,
    setUserId,
    setAnalysisRequestId,
    setAnalysisId,
    setRiskCardUrl,
  } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Path params
  const [pathParams, setPathParams] = useState<Record<string, string>>({});

  // Query params
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  // JSON body
  const [jsonBody, setJsonBody] = useState(
    endpoint.sampleRequest ? JSON.stringify(endpoint.sampleRequest, null, 2) : ''
  );

  // Form data
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Auto-fill IDs from flow state
    if (endpoint.pathParams.includes('user_id') && userId) {
      setPathParams((prev) => ({ ...prev, user_id: userId }));
    }
    if (endpoint.pathParams.includes('analysis_id')) {
      const preferredAnalysisId =
        endpoint.id === 'risk-card-get'
          ? analysisId || analysisRequestId
          : analysisRequestId || analysisId;

      if (preferredAnalysisId) {
        setPathParams((prev) => ({ ...prev, analysis_id: preferredAnalysisId }));
      }
    }
  }, [endpoint, userId, analysisRequestId, analysisId]);

  const buildUrl = (): string => {
    let url = endpoint.path;
    endpoint.pathParams.forEach((param) => {
      url = url.replace(`{${param}}`, pathParams[param] || `:${param}`);
    });
    const queryString = Object.entries(queryParams)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return `${API_BASE}${url}${queryString ? `?${queryString}` : ''}`;
  };

  const buildCurl = (): string => {
    const url = buildUrl();
    let curl = `curl -X ${endpoint.method} '${url}'`;

    if (endpoint.hasBody && jsonBody) {
      curl += ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${jsonBody}'`;
    }

    if (endpoint.hasFormData) {
      curl += ` \\\n  -H 'Content-Type: multipart/form-data'`;
      Object.entries(formData).forEach(([key, value]) => {
        if (value) curl += ` \\\n  -F '${key}=${value}'`;
      });
      if (file) curl += ` \\\n  -F 'file=@${file.name}'`;
    }

    return curl;
  };

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(buildCurl());
      setCopied(true);
      toast.success('cURL copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const executeRequest = async () => {
    setIsLoading(true);

    try {
      let result: { status: number; headers: Record<string, string>; data: unknown };

      switch (endpoint.id) {
        case 'health-get':
          result = { status: 200, headers: {}, data: await getHealth() };
          break;

        case 'users-create': {
          const newUser = await createUser(JSON.parse(jsonBody));
          setUserId(newUser.id);
          toast.success(`User created: ${newUser.id}`);
          result = { status: 200, headers: {}, data: newUser };
          break;
        }

        case 'users-profile':
          result = {
            status: 200,
            headers: {},
            data: await getUserProfile(pathParams.user_id || userId || ''),
          };
          break;

        case 'documents-analyze': {
          if (!file) throw new Error('Please select a file.');
          const analyzeRes = await analyzeDocument(
            file,
            formData.user_id || userId || '',
            (formData.language_mode as 'english' | 'pidgin') || 'english'
          );
          setAnalysisRequestId(analyzeRes.analysis_id);
          result = { status: 200, headers: {}, data: analyzeRes };
          break;
        }

        case 'documents-history-list': {
          const historyRes = await getAnalysisHistory(pathParams.user_id || userId || '');
          result = { status: 200, headers: {}, data: historyRes };
          break;
        }

        case 'documents-history-detail': {
          const savedAnalysis = await getSavedAnalysis(
            pathParams.user_id || userId || '',
            pathParams.analysis_id || analysisId || analysisRequestId || ''
          );
          setAnalysisId(savedAnalysis.id);
          if (savedAnalysis.risk_card_url) {
            setRiskCardUrl(savedAnalysis.risk_card_url);
          }
          result = { status: 200, headers: {}, data: savedAnalysis };
          break;
        }

        case 'documents-chat': {
          const targetAnalysisId = pathParams.analysis_id || analysisId || analysisRequestId || '';
          const payload = jsonBody ? JSON.parse(jsonBody) : { question: '', language_mode: 'english' };
          const chatRes = await sendChatQuestion(
            targetAnalysisId,
            payload.question || 'What should I change in this clause?',
            payload.language_mode || 'english'
          );
          result = { status: 200, headers: {}, data: chatRes };
          break;
        }

        case 'documents-analysis': {
          const analysisRes = await getAnalysis(pathParams.analysis_id || analysisRequestId || '');
          setAnalysisId(analysisRes.id);
          if (analysisRes.risk_card_url) {
            setRiskCardUrl(analysisRes.risk_card_url);
          }
          result = {
            status: 200,
            headers: {},
            data: analysisRes,
          };
          break;
        }

        case 'risk-card-get': {
          const targetAnalysisId = pathParams.analysis_id || analysisId || analysisRequestId || '';
          const shouldRefresh = queryParams.refresh === 'true';
          const shouldRedirect = queryParams.redirect === 'true';

          if (shouldRedirect) {
            const redirectUrl = getRiskCardUrl(targetAnalysisId, {
              refresh: shouldRefresh,
              redirect: true,
            });
            window.open(redirectUrl, '_blank');
            result = {
              status: 200,
              headers: {},
              data: {
                redirect: true,
                url: redirectUrl,
                message: 'Opened risk card using redirect=true in a new tab.',
              },
            };
            break;
          }

          const riskCardRes = await getRiskCard(targetAnalysisId, {
            refresh: shouldRefresh,
            redirect: false,
          });
          if (riskCardRes.risk_card_url) {
            setRiskCardUrl(riskCardRes.risk_card_url);
          }
          result = {
            status: 200,
            headers: {},
            data: riskCardRes,
          };
          break;
        }

        case 'whatsapp-webhook': {
          const whatsappPayload: WhatsAppWebhookPayload = {
            SmsMessageSid: formData.SmsMessageSid || '',
            NumMedia: formData.NumMedia || '0',
            ProfileName: formData.ProfileName || '',
            MessageType: formData.MessageType || 'text',
            From: formData.From || '',
            To: formData.To || '',
            Body: formData.Body || '',
          };
          if (formData.MediaUrl0) whatsappPayload.MediaUrl0 = formData.MediaUrl0;
          if (formData.MediaContentType0) whatsappPayload.MediaContentType0 = formData.MediaContentType0;
          result = { status: 200, headers: {}, data: await sendWhatsAppWebhook(whatsappPayload) };
          break;
        }

        default:
          throw new Error('Unknown endpoint');
      }

      onResponse(result);
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-brand-border bg-brand-bg shrink-0">
        <div className="flex items-center gap-3">
          <span className={clsx('px-2 py-1 rounded text-xs font-bold', methodColors[endpoint.method])}>
            {endpoint.method}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-brand-textPrimary">{endpoint.name}</h3>
            <p className="text-sm text-brand-textSecondary font-mono truncate">{endpoint.path}</p>
          </div>
        </div>
        <p className="text-xs text-brand-textSecondary mt-2">{endpoint.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-brand-textSecondary">
          {endpoint.requestType && (
            <span className="rounded-full border border-brand-border bg-white px-2 py-0.5">
              Request: {endpoint.requestType}
            </span>
          )}
          {endpoint.responseType && (
            <span className="rounded-full border border-brand-border bg-white px-2 py-0.5">
              Response: {endpoint.responseType}
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Path params */}
        {endpoint.pathParams.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wide mb-2">
              Path Parameters
            </label>
            <div className="space-y-2">
              {endpoint.pathParams.map((param) => (
                <div key={param}>
                  <label className="block text-xs text-brand-textPrimary mb-1 font-mono">{param}</label>
                  <input
                    type="text"
                    value={pathParams[param] || ''}
                    onChange={(e) => setPathParams((prev) => ({ ...prev, [param]: e.target.value }))}
                    placeholder={param === 'user_id' ? userId || 'Enter user ID' : 'Enter value'}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query params */}
        {endpoint.queryParams.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wide mb-2">
              Query Parameters
            </label>
            <div className="space-y-2">
              {endpoint.queryParams.map((param) => (
                <div key={param} className="flex items-center gap-2">
                  <label className="text-xs text-brand-textPrimary font-mono w-24">{param}</label>
                  <select
                    value={queryParams[param] || ''}
                    onChange={(e) => setQueryParams((prev) => ({ ...prev, [param]: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">false (default)</option>
                    <option value="true">true</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON body */}
        {endpoint.hasBody && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wide">
                Request Body (JSON)
              </label>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(jsonBody);
                    toast.success('Request copied!');
                  } catch {
                    toast.error('Failed to copy request.');
                  }
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <textarea
              value={jsonBody}
              onChange={(e) => setJsonBody(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {/* Form data fields */}
        {endpoint.hasFormData && (
          <div>
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wide mb-2">
              Form Data
            </label>
            <div className="space-y-3">
              {endpoint.id === 'documents-analyze' && (
                <>
                  <div>
                    <label className="block text-xs text-brand-textPrimary mb-1">file</label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-textPrimary mb-1">user_id</label>
                    <input
                      type="text"
                      value={formData.user_id || userId || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, user_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-brand-textPrimary mb-1">language_mode</label>
                    <select
                      value={formData.language_mode || 'english'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, language_mode: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="english">english</option>
                      <option value="pidgin">pidgin</option>
                    </select>
                  </div>
                </>
              )}

              {endpoint.id === 'whatsapp-webhook' && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'SmsMessageSid',
                    'NumMedia',
                    'ProfileName',
                    'MessageType',
                    'From',
                    'To',
                    'Body',
                    'MediaUrl0',
                    'MediaContentType0',
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-brand-textPrimary mb-1 font-mono">{field}</label>
                      <input
                        type="text"
                        value={formData[field] || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                        placeholder={field}
                        className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* cURL preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wide">
              cURL
            </label>
            <button
              onClick={copyCurl}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="bg-brand-textPrimary text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {buildCurl()}
          </pre>
        </div>
      </div>

      {/* Execute button */}
      <div className="p-4 border-t border-brand-border bg-brand-bg shrink-0">
        <button
          onClick={executeRequest}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Try It
            </>
          )}
        </button>
      </div>
    </div>
  );
};
