import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-primary mb-4">Preguntas frecuentes</h1>
        <p className="text-muted-foreground">Resolvemos tus dudas sobre cómo funciona Vavoy.</p>
      </div>
      
      <Card className="p-6 border-none shadow-md bg-white">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-lg">¿Vavoy es una empresa de transporte?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              No, Vavoy es solo una herramienta para conectar vecinos. No tenemos conductores contratados ni flota de coches. Son personas particulares compartiendo sus trayectos habituales.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-lg">¿Tengo que pagar algo por usar Vavoy?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Usar la web es totalmente gratis. Los gastos del viaje (gasolina) los acordáis directamente entre conductor y pasajero. Vavoy no cobra ninguna comisión.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left text-lg">¿Cómo contacto con la persona conductora?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              En cada viaje verás un botón de WhatsApp o un teléfono. Contacta directamente con la persona para confirmar hora y lugar de recogida.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-lg">¿Es obligatorio compartir gastos?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Es lo habitual y lo justo, pero depende de cada conductor. Algunos solo buscan compañía, otros necesitan ayuda con la gasolina. Habladlo antes de salir.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left text-lg">¿Qué pasa si quiero cancelar un viaje?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Por favor, avisa cuanto antes. Escribe o llama a la persona con la que habías quedado. Al ser una red vecinal, la comunicación y el respeto son fundamentales.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}

import { Card } from "@/components/ui/card";
