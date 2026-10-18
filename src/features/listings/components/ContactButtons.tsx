"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { ViberIcon, WhatsAppIcon } from "@/features/shared/components/ui/BrandIcons";
import Button from "@/features/shared/components/ui/Button";
import { trackContactClick, trackView } from "@/features/listings/actions";

type Props = { listingId: string; phone: string; viber?: string | null; whatsapp?: string | null };

const tel = (v: string) => v.replace(/[^\d+]/g, "");
const intl = (v: string) => {
  const d = tel(v);
  return d.startsWith("+") ? d : d.startsWith("0") ? `+382${d.slice(1)}` : `+${d}`;
};

export default function ContactButtons({ listingId, phone, viber, whatsapp }: Props) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    void trackView(listingId);
  }, [listingId]);

  const masked = phone.slice(0, Math.max(3, phone.length - 4)) + " ····";
  return (
    <div className="flex flex-col gap-2">
      {shown ? (
        <Button
          href={`tel:${tel(phone)}`}
          size="lg"
          fullWidth
          onClick={() => void trackContactClick(listingId, "phone")}
        >
          <Phone size={18} aria-hidden="true" /> {phone}
        </Button>
      ) : (
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            setShown(true);
            void trackContactClick(listingId, "phone");
          }}
        >
          <Phone size={18} aria-hidden="true" /> Prikaži broj {masked}
        </Button>
      )}
      <div className="flex gap-2 *:flex-1">
        {viber && (
          <Button
            href={`viber://chat?number=${encodeURIComponent(intl(viber))}`}
            variant="viber"
            onClick={() => void trackContactClick(listingId, "viber")}
          >
            <ViberIcon /> Viber
          </Button>
        )}
        {whatsapp && (
          <Button
            href={`https://wa.me/${intl(whatsapp).replace("+", "")}`}
            variant="whatsapp"
            onClick={() => void trackContactClick(listingId, "whatsapp")}
          >
            <WhatsAppIcon /> WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}
