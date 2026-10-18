"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import Button from "@/features/shared/components/ui/Button";
import { trackContactClick, trackView } from "@/features/listings/actions";

type Props = { listingId: string; phone: string; viber?: string | null; whatsapp?: string | null };

const tel = (v: string) => v.replace(/[^\d+]/g, "");
const intl = (v: string) => { const d = tel(v); return d.startsWith("+") ? d : d.startsWith("0") ? `+382${d.slice(1)}` : `+${d}`; };

export default function ContactButtons({ listingId, phone, viber, whatsapp }: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => { void trackView(listingId); }, [listingId]);

  const masked = phone.slice(0, Math.max(3, phone.length - 4)) + " ····";
  return (
    <div className="flex flex-col gap-2">
      {shown ? (
        <Button href={`tel:${tel(phone)}`} size="lg" fullWidth onClick={() => void trackContactClick(listingId, "phone")}>
          <Phone size={18} aria-hidden="true" /> {phone}
        </Button>
      ) : (
        <Button size="lg" fullWidth onClick={() => { setShown(true); void trackContactClick(listingId, "phone"); }}>
          <Phone size={18} aria-hidden="true" /> Prikaži broj {masked}
        </Button>
      )}
      <div className="grid grid-cols-2 gap-2">
        {viber && (
          <Button href={`viber://chat?number=${encodeURIComponent(intl(viber))}`} variant="outline" onClick={() => void trackContactClick(listingId, "viber")}>
            <MessageCircle size={16} aria-hidden="true" /> Viber
          </Button>
        )}
        {whatsapp && (
          <Button href={`https://wa.me/${intl(whatsapp).replace("+", "")}`} variant="outline" onClick={() => void trackContactClick(listingId, "whatsapp")}>
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}
