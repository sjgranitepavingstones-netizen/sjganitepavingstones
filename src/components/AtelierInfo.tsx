import { useEffect, useState } from "react";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { publicApi } from "@/lib/api";

export const AtelierInfo = () => {
  const [mapPos, setMapPos] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    publicApi
      .list<any>("site_settings", { id: "main" })
      .then(([data]) => {
        if (data?.map_latitude != null && data?.map_longitude != null) {
          setMapPos({ lat: Number(data.map_latitude), lng: Number(data.map_longitude), zoom: data.map_zoom || 15 });
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-10 items-stretch">
          <div className="lg:col-span-2 bg-secondary text-secondary-foreground p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Our Atelier</span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mt-3 mb-2">SJ Granite Paving Stone</h2>
            <p className="text-secondary-foreground/70 text-sm">Visit by appointment only.</p>

            <div className="mt-10 space-y-6">
              {[
                { icon: MapPin, label: "Atelier", value: "India" },
                { icon: MessageCircle, label: "WhatsApp", value: "+91 82172 57354" },
                { icon: Mail, label: "Email", value: "granitepavingstone@gmail.com" },
                { icon: Clock, label: "Hours", value: "Mon-Sat - 9am - 7pm" },
              ].map((info) => (
                <div key={info.label} className="flex items-start gap-4 group">
                  <div className="h-11 w-11 rounded-full border border-primary/30 text-primary inline-flex items-center justify-center group-hover:bg-gold-gradient group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-500 shrink-0">
                    <info.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1">{info.label}</div>
                    <div className="text-secondary-foreground/90">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 min-h-[360px] border border-primary/20 bg-secondary">
            <iframe
              title="Atelier location"
              src={
                mapPos
                  ? `https://www.google.com/maps?q=${mapPos.lat},${mapPos.lng}&z=${mapPos.zoom}&output=embed`
                  : "https://www.google.com/maps?q=12.9716,77.5946&z=14&output=embed"
              }
              className="w-full h-full min-h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
