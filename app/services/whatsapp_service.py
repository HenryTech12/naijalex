from twilio.rest import Client
import httpx
import os
from app.config import settings

class WhatsAppService:
    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN) if settings.TWILIO_ACCOUNT_SID else None
        self.number = settings.TWILIO_WHATSAPP_NUMBER

    async def send_message(self, to: str, body: str):
        if not self.client:
            print(f"DEBUG: WhatsApp send to {to}: {body}")
            return
        self.client.messages.create(
            from_=self.number,
            body=body,
            to=to
        )

    async def send_document(self, to: str, media_url: str, caption: str):
        if not self.client:
            print(f"DEBUG: WhatsApp doc to {to}: {caption} ({media_url})")
            return
        self.client.messages.create(
            from_=self.number,
            body=caption,
            media_url=[media_url],
            to=to
        )

    async def download_media(self, media_url: str, media_sid: str) -> bytes:
        auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        async with httpx.AsyncClient() as client:
            response = await client.get(media_url, auth=auth)
            return response.content

    def build_analysis_summary_message(self, analysis: dict) -> str:
        risk_emoji = "🔴" if analysis['overall_risk'] == "High" else "🟡" if analysis['overall_risk'] == "Medium" else "🟢"
        
        # Count severities
        critical = sum(1 for c in analysis['clauses'] if c['severity'] == "Critical")
        caution = sum(1 for c in analysis['clauses'] if c['severity'] == "Caution")
        
        msg = f"🔍 *NaijaLex Analysis Complete*\n\n"
        msg += f"📄 Contract type: {analysis.get('document_type', 'Legal Document')}\n"
        msg += f"{risk_emoji} Overall Risk: {analysis['overall_risk'].upper()}\n\n"
        
        if critical > 0:
            msg += f"🔴 *Critical Issues ({critical})*\n"
            for c in [cl for cl in analysis['clauses'] if cl['severity'] == "Critical"][:2]:
                msg += f"• {c['title']}: {c['pidgin_explanation'] if analysis.get('language_mode') == 'pidgin' else c['plain_english']}\n"
            msg += "\n"

        if caution > 0:
            msg += f"🟡 *Caution ({caution})*\n"
            for c in [cl for cl in analysis['clauses'] if cl['severity'] == "Caution"][:2]:
                msg += f"• {c['title']}\n"
            msg += "\n"

        msg += "✅ *What to do now:*\n"
        for i, action in enumerate(analysis['top_3_actions'], 1):
            msg += f"{i}. {action}\n"
        
        msg += f"\n📋 Full analysis + negotiation drafts:\n{settings.APP_BASE_URL}/analysis/{analysis['id']}\n\n"
        msg += "Reply with any question about this contract 💬"
        return msg

    def build_onboarding_message(self) -> str:
        return (
            "Welcome to *NaijaLex*! 🇳🇬⚖️\n\n"
            "I be your legal assistant wey go help you understand contracts quick-quick.\n"
            "Just send me photo or PDF of your contract, and I go tell you the risk and how to negotiate am.\n\n"
            "Send your contract now make we start!"
        )

whatsapp_service = WhatsAppService()
