export default function LegalNoticePage() {
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-primary mb-4">Aviso Legal</h1>
        <p className="text-muted-foreground">Información legal sobre este sitio web</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-10 space-y-8 text-[15px] leading-relaxed text-foreground">

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">1. Naturaleza del proyecto</h2>
          <p>
            YaVoy es un proyecto piloto sin ánimo de lucro creado para facilitar la movilidad compartida entre vecinos
            de zonas rurales en España. No existe ninguna entidad jurídica constituida detrás de este servicio. Se trata
            de una prueba de concepto (proof of concept) de carácter experimental y comunitario.
          </p>
          <p>
            El proyecto no persigue ningún fin comercial, no cobra tarifas ni comisiones a sus usuarios, y no actúa en
            ningún caso como empresa de transporte ni intermediaria remunerada.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">2. Contacto</h2>
          <p>
            Para cualquier consulta relacionada con el funcionamiento del sitio puedes escribirnos a:{" "}
            <a href="mailto:hola@yavoy.info" className="text-primary underline hover:no-underline">
              hola@yavoy.info
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">3. Exención de responsabilidad</h2>
          <p>
            YaVoy actúa exclusivamente como plataforma de encuentro entre personas. Los viajes publicados en este
            sitio son acuerdos directos entre particulares. YaVoy no interviene en la organización, ejecución ni
            supervisión de dichos viajes.
          </p>
          <p>
            El sitio se proporciona «tal cual», sin garantías de disponibilidad o continuidad del servicio. Al ser un
            proyecto experimental, puede ser modificado o interrumpido en cualquier momento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">4. Propiedad intelectual</h2>
          <p>
            Los textos, diseño y código fuente de YaVoy son obra de sus creadores. Se permite su uso personal y
            no comercial. Queda prohibida su reproducción total o parcial con fines lucrativos sin autorización expresa.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">5. Legislación aplicable</h2>
          <p>
            Este aviso legal se rige por la legislación española. En particular, por la Ley 34/2002, de 11 de julio,
            de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t">Última actualización: marzo 2026</p>
      </div>
    </div>
  );
}
