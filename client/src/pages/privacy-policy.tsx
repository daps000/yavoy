export default function PrivacyPolicyPage() {
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-serif text-primary mb-4">Política de Privacidad</h1>
        <p className="text-muted-foreground">Cómo gestionamos tus datos personales</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-10 space-y-8 text-[15px] leading-relaxed text-foreground">

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">1. Quién somos</h2>
          <p>
            YaVoy es un proyecto piloto sin ánimo de lucro y sin entidad jurídica constituida, creado con el objetivo
            de facilitar la movilidad compartida entre vecinos de zonas rurales en España. Para cualquier cuestión
            relacionada con tus datos, puedes contactarnos en{" "}
            <a href="mailto:yavoyweb@gmail.com" className="text-primary underline hover:no-underline">
              yavoyweb@gmail.com
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">2. Datos que recogemos</h2>
          <p>Al usar YaVoy podemos recoger los siguientes datos:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Nombre y apellidos</strong> — para identificarte al publicar viajes.</li>
            <li><strong className="text-foreground">Dirección de email</strong> — para autenticarte y enviarte recordatorios opcionales.</li>
            <li><strong className="text-foreground">Número de teléfono</strong> — si lo facilitas voluntariamente, para que otros usuarios puedan contactarte vía WhatsApp.</li>
            <li><strong className="text-foreground">Pueblo de origen</strong> y <strong className="text-foreground">coordenadas aproximadas</strong> — para mostrarte viajes cercanos. Solo se usan si tú activas la geolocalización.</li>
            <li><strong className="text-foreground">Datos de los viajes que publicas</strong> — origen, destino, fecha, hora y plazas disponibles.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">3. Para qué usamos tus datos</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Permitirte registrarte y acceder a tu cuenta.</li>
            <li>Publicar y gestionar tus viajes en la plataforma.</li>
            <li>Enviarte recordatorios semanales por email si lo has activado (puedes desactivarlos en cualquier momento desde tu perfil).</li>
            <li>Mostrarte viajes cercanos a tu ubicación.</li>
          </ul>
          <p className="mt-2">
            No usamos tus datos para publicidad, no los vendemos ni los cedemos a terceros con fines comerciales.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">4. Base legal del tratamiento</h2>
          <p>
            El tratamiento de tus datos se basa en el consentimiento que otorgas al registrarte y en la ejecución del
            servicio que nos solicitas (mostrarte y publicar viajes compartidos). El envío de emails de recordatorio
            se basa en tu consentimiento explícito, que puedes retirar en cualquier momento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">5. Cuánto tiempo conservamos tus datos</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Si deseas eliminar tu cuenta y todos los datos
            asociados, escríbenos a{" "}
            <a href="mailto:yavoyweb@gmail.com" className="text-primary underline hover:no-underline">
              yavoyweb@gmail.com
            </a>{" "}
            y los eliminaremos en un plazo máximo de 30 días.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">6. Tus derechos</h2>
          <p>Como usuario tienes derecho a:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Acceso</strong> — saber qué datos tenemos sobre ti.</li>
            <li><strong className="text-foreground">Rectificación</strong> — corregir datos inexactos.</li>
            <li><strong className="text-foreground">Supresión</strong> — solicitar que eliminemos tu cuenta y datos.</li>
            <li><strong className="text-foreground">Portabilidad</strong> — recibir tus datos en formato legible.</li>
            <li><strong className="text-foreground">Oposición</strong> — oponerte a determinados tratamientos.</li>
          </ul>
          <p className="mt-2">
            Para ejercer cualquiera de estos derechos, escríbenos a{" "}
            <a href="mailto:yavoyweb@gmail.com" className="text-primary underline hover:no-underline">
              yavoyweb@gmail.com
            </a>.
            También puedes presentar una reclamación ante la{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Agencia Española de Protección de Datos (AEPD)
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">7. Cookies y almacenamiento local</h2>
          <p>
            YaVoy utiliza únicamente cookies y almacenamiento local de carácter técnico, necesarias para que el
            servicio funcione correctamente (mantener tu sesión iniciada, recordar preferencias de navegación). No
            utilizamos cookies publicitarias ni de rastreo de terceros.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">8. Servicios de terceros</h2>
          <p>
            Utilizamos los siguientes servicios externos para el funcionamiento de la plataforma:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong className="text-foreground">Supabase</strong> — para autenticación y almacenamiento de datos (servidores en la UE).
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary underline hover:no-underline text-xs">Ver política</a>
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> — para el envío de emails de recordatorio.
              <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary underline hover:no-underline text-xs">Ver política</a>
            </li>
            <li>
              <strong className="text-foreground">OpenStreetMap / Nominatim</strong> — para geolocalización de pueblos (ningún dato personal se envía).
              <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary underline hover:no-underline text-xs">Ver política</a>
            </li>
          </ul>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t">Última actualización: marzo 2026</p>
      </div>
    </div>
  );
}
