export const seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('posts').del();

  // Sample blog posts
  const samplePosts = [
    {
      title: 'Bienvenido a Nuestra Plataforma de Blog',
      slug: 'bienvenido-a-nuestra-plataforma-de-blog',
      content: `
        <h2>Bienvenido a Nuestro Espacio Creativo</h2>
        <p>Estamos emocionados de lanzar esta hermosa plataforma de blog minimalista que combina diseño elegante con funcionalidad poderosa. Este espacio está diseñado para escritores, creadores y líderes de pensamiento que quieren compartir sus ideas con el mundo.</p>
        
        <h3>Lo Que Hace Especial a Esta Plataforma</h3>
        <p>Nuestra plataforma de blog está construida con tecnologías web modernas y diseñada con un enfoque en la legibilidad y experiencia del usuario. El diseño limpio, inspirado en editoriales, asegura que tu contenido tome el protagonismo, mientras que el backend poderoso proporciona todas las herramientas que necesitas para crear, gestionar y compartir tu trabajo.</p>
        
        <h3>Características Clave</h3>
        <ul>
          <li><strong>Editor de Texto Enriquecido:</strong> Crea contenido bellamente formateado con nuestro editor intuitivo</li>
          <li><strong>Diseño Responsivo:</strong> Tu blog se ve perfecto en todos los dispositivos</li>
          <li><strong>Optimizado para SEO:</strong> Características SEO integradas ayudan a que tu contenido sea descubierto</li>
          <li><strong>Rendimiento Rápido:</strong> Optimizado para velocidad y experiencia del usuario</li>
          <li><strong>Gestión Fácil:</strong> Interfaz simple para gestionar todas tus publicaciones</li>
        </ul>
        
        <p>Creemos que el gran contenido merece una gran plataforma. Ya sea que compartas historias personales, perspectivas profesionales o trabajo creativo, este blog proporciona el lienzo perfecto para tus ideas.</p>
        
        <p>Comienza a escribir hoy y únete a nuestra comunidad de creadores que valoran la calidad, simplicidad y diseño hermoso.</p>
      `,
      excerpt: 'Descubre nuestra hermosa plataforma de blog minimalista diseñada para creadores que valoran el diseño elegante y la funcionalidad poderosa.',
      featured_image: 'https://kimi-web-img.moonshot.cn/img/saffronavenue.com/178834ae416d153d36282068484d8ac881d62eac.jpg',
      category: 'Plataforma',
      tags: 'bienvenida, plataforma, características',
      status: 'published',
      view_count: 150
    },
    {
      title: 'El Arte del Diseño Minimalista en Blogs',
      slug: 'el-arte-del-diseno-minimalista-en-blogs',
      content: `
        <h2>Menos es Más: La Filosofía del Blogging Minimalista</h2>
        <p>En un mundo abrumado por el ruido visual y las interfaces desordenadas, el diseño minimalista ha emergido como un enfoque poderoso para crear experiencias digitales significativas. Cuando se trata de blogging, esta filosofía se vuelve aún más crucial.</p>
        
        <h3>Por Qué Funciona el Minimalismo</h3>
        <p>El diseño minimalista en blogging no se trata solo de estética—se trata de crear un ambiente donde el contenido pueda realmente brillar. Al eliminar elementos innecesarios y enfocarse en lo que más importa, creamos espacio para que las ideas respiren y los lectores se involucren profundamente con el contenido.</p>
        
        <h3>Principios Clave del Diseño de Blog Minimalista</h3>
        <ul>
          <li><strong>Enfoque en Tipografía:</strong> Fuentes hermosas y legibles que mejoran la experiencia de lectura</li>
          <li><strong>Espacio en Blanco Generoso:</strong> Dar al contenido espacio para respirar y mejorar la legibilidad</li>
          <li><strong>Paletas de Colores Sutiles:</strong> Usar color intencionalmente para guiar la atención y crear ambiente</li>
          <li><strong>Navegación Intuitiva:</strong> Navegación simple y clara que no distrae del contenido</li>
          <li><strong>Enfoque en el Contenido:</strong> Cada elemento de diseño sirve al contenido, no al revés</li>
        </ul>
        
        <h3>El Impacto en la Experiencia del Lector</h3>
        <p>Cuando los lectores visitan un blog minimalista, son inmediatamente atraídos al contenido. Sin anuncios que distraigan, barras laterales desordenadas o elementos visuales abrumadores, pueden enfocarse en lo que más importa: las ideas e historias que se comparten.</p>
        
        <p>Este enfoque crea una experiencia de lectura más íntima y enfocada que construye confianza y fomenta un compromiso más profundo con el contenido.</p>
      `,
      excerpt: 'Explora cómo los principios de diseño minimalista pueden transformar tu blog en una plataforma poderosa para contenido significativo y mayor compromiso del lector.',
      featured_image: 'https://kimi-web-img.moonshot.cn/img/notionthings.com/3a5a7c8103ccc7b2640a8f74101e2156f9d1da44.png',
      category: 'Diseño',
      tags: 'minimalismo, diseño, blogging, tipografía',
      status: 'published',
      view_count: 89
    },
    {
      title: 'Building Better Content: Writing Tips for Bloggers',
      slug: 'building-better-content-writing-tips-for-bloggers',
      content: `
        <h2>Crafting Content That Resonates</h2>
        <p>Great blogging is both an art and a science. While creativity and personal voice are essential, there are proven strategies that can help you create content that truly connects with your audience.</p>
        
        <h3>Know Your Audience</h3>
        <p>Before you write a single word, take time to understand who you're writing for. What are their interests, challenges, and aspirations? The more you understand your readers, the better you can tailor your content to meet their needs.</p>
        
        <h3>Structure Your Content for Readability</h3>
        <p>Online readers scan content differently than print readers. Use these techniques to make your posts more readable:</p>
        <ul>
          <li><strong>Compelling Headlines:</strong> Craft titles that promise value and spark curiosity</li>
          <li><strong>Clear Subheadings:</strong> Break up content into digestible sections</li>
          <li><strong>Short Paragraphs:</strong> Keep paragraphs concise for easier scanning</li>
          <li><strong>Bullet Points and Lists:</strong> Present information in scannable formats</li>
          <li><strong>Visual Elements:</strong> Use images, quotes, and formatting to break up text</li>
        </ul>
        
        <h3>Develop Your Unique Voice</h3>
        <p>Your voice is what sets you apart from other bloggers. Don't be afraid to let your personality shine through in your writing. Whether you're witty, thoughtful, or inspirational, authentic voice builds connection and trust with your audience.</p>
        
        <h3>The Power of Storytelling</h3>
        <p>Stories are one of the most powerful tools in a blogger's arsenal. They make abstract concepts concrete, create emotional connections, and make your content more memorable. Look for opportunities to incorporate personal anecdotes, case studies, and examples into your posts.</p>
        
        <h3>Consistency is Key</h3>
        <p>Building an audience takes time and consistency. Set a realistic publishing schedule and stick to it. Quality always trumps quantity, but regular posting helps build momentum and keeps your audience engaged.</p>
      `,
      excerpt: 'Discover essential writing strategies that will help you create compelling blog content that engages readers and builds a loyal audience.',
      featured_image: 'https://kimi-web-img.moonshot.cn/img/www.marketing91.com/256e807028144c2498a953885f571298504fea96.jpg',
      category: 'Writing',
      tags: 'writing, content creation, blogging tips, storytelling',
      status: 'published',
      view_count: 124
    },
    {
      title: 'El Futuro del Storytelling Digital',
      slug: 'el-futuro-del-storytelling-digital',
      content: `
        <h2>Abrazando Nuevas Narrativas en la Era Digital</h2>
        <p>El storytelling digital ha evolucionado mucho más allá del simple texto en una pantalla. Los creadores de contenido de hoy tienen acceso a una variedad sin precedentes de herramientas y plataformas que permiten experiencias de narración ricas e inmersivas.</p>
        
        <h3>Elementos Interactivos</h3>
        <p>Las historias digitales modernas incorporan elementos interactivos que involucran a los lectores de nuevas maneras. Desde videos y clips de audio incrustados hasta infografías interactivas y elementos clicables, los límites entre lector y participante continúan difuminándose.</p>
        
        <h3>Narrativas Multiplataforma</h3>
        <p>Las historias ya no viven en aislamiento. Se extienden a través de múltiples plataformas, creando narrativas interconectadas que se desarrollan a través de redes sociales, blogs, podcasts y plataformas de video. Este enfoque permite un compromiso más profundo de la audiencia y la construcción de comunidad.</p>
        
        <h3>El Papel de la IA en el Storytelling</h3>
        <p>La inteligencia artificial está comenzando a jugar un papel significativo en cómo las historias se crean, curan y personalizan. Desde herramientas de escritura asistida por IA hasta recomendaciones de contenido personalizado, la tecnología está remodelando el panorama del storytelling.</p>
        
        <h3>Mirando Hacia Adelante</h3>
        <p>Mientras avanzamos, los narradores digitales más exitosos serán aquellos que puedan combinar sin problemas las técnicas narrativas tradicionales con las tecnologías emergentes, creando experiencias que sean tanto tecnológicamente sofisticadas como emocionalmente resonantes.</p>
      `,
      excerpt: 'Descubre cómo el storytelling digital está evolucionando con nuevas tecnologías y plataformas, creando experiencias narrativas más inmersivas y atractivas.',
      featured_image: 'https://kimi-web-img.moonshot.cn/img/notionthings.com/b8f5c9d204ddd8c3751b9f85202f3267e0e2eb55.png',
      category: 'Tecnología',
      tags: 'storytelling, digital, tecnología, IA',
      status: 'published',
      view_count: 156
    }
  ];

  // Insert sample posts
  await knex('posts').insert(samplePosts);
};