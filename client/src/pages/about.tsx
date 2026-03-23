import aboutIllustration from "@assets/generated_images/about-illustration.png";

export default function AboutPage() {
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-primary mb-4">Nosotros</h1>
        <p className="text-muted-foreground">La historia detrás de YaVoy</p>
      </div>

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

          <p className="text-muted-foreground italic text-[15px]">
            Hecho con buena intención, para nuestra comunidad.
          </p>
        </div>
      </div>
    </div>
  );
}
