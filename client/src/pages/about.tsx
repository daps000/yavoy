import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import aboutIllustration from "@assets/generated_images/about-illustration.png";

export default function AboutPage() {
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <img
          src={aboutIllustration}
          alt="Vecinos compartiendo un viaje por el campo"
          className="w-full object-cover"
          style={{ maxHeight: "340px" }}
        />

        <div className="p-6 md:p-10 space-y-6 text-[16px] leading-relaxed text-foreground">
          <p className="text-xl font-semibold text-primary font-serif">
            YaVoy es una herramienta para ayudarnos entre vecinos.
          </p>

          <p>
            Conectamos a quienes ya van en coche con quienes necesitan desplazarse.{" "}
            <span className="font-medium">Así de simple.</span>
          </p>

          <p>
            No somos una empresa de transporte ni buscamos beneficio económico. Este proyecto nace de algo
            muy básico: aprovechar los asientos libres, ahorrar dinero, cuidar el medioambiente y hacer
            comunidad.
          </p>

          <p>
            En los pueblos, moverse no siempre es fácil. Creemos en soluciones cercanas, entre personas
            que ya se conocen o pronto se conocerán.
          </p>

          <p>
            Cada asiento compartido es menos gasto para el bolsillo, menos contaminación en la carretera
            y un poco más de conexión entre vecinos.
          </p>

          <div className="border-l-4 border-primary pl-4 my-6 space-y-2">
            <p className="font-medium text-primary">
              Si tienes sitio en el coche, compártelo.
            </p>
            <p className="font-medium text-primary">
              Si necesitas ir a algún lugar, encuentra a alguien que ya vaya.
            </p>
          </div>

          <div className="pt-2 text-center">
            <Link href="/publicar">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8" data-testid="button-about-publish">
                <PlusCircle className="h-5 w-5 mr-2" />
                Publicar un viaje ahora
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
