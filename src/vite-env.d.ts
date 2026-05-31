/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_WHATSAPP_SANDBOX_NUMBER?: string;
	readonly VITE_WHATSAPP_SANDBOX_JOIN_CODE?: string;
	readonly VITE_WHATSAPP_SANDBOX_QR_URL?: string;
	readonly VITE_WHATSAPP_SANDBOX_DEEPLINK?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
