# SPIDER READER



🕸️ Spider Reader
Spider Reader é uma aplicação web interativa e responsiva desenvolvida para a leitura de quadrinhos (HQs) e mangás diretamente no navegador. O projeto oferece uma experiência completa de navegação, leitor com múltiplos modos de exibição (página única, duas páginas e rolagem contínua), sistema de gamificação com níveis e molduras, temas customizáveis e salvamento de progresso local.

🛠️ Bibliotecas e Tecnologias Utilizadas
O projeto foi construído utilizando tecnologias nativas web (VanillaJS), sem a dependência de frameworks ou gerenciadores de pacotes externos, garantindo leveza e rápida inicialização.

🔴HTML5 — Estruturação semântica da aplicação.

🔴CSS3 — Estilização, layout responsivo (Flexbox e Grid), temas via variáveis CSS e animações.

🔴JavaScript (ES6+) — Lógica do leitor, manipuladores de estado, persistência de dados e controle da interface.

🔴Google Fonts API — Carregamento das tipografias oficiais do projeto:

🔴Bangers (v24) — Utilizada no título e destaques de estilo HQ.

🔴Poppins (v21) — Utilizada para textos de leitura, botões e menus (pesos 400, 500, 600 e 700).

🔴Web Storage API (LocalStorage) — Persistência no navegador para favoritos, histórico de leitura, perfil de usuário, temas e configurações do leitor.

🔴Intersection Observer API — Detecção de rolagem no leitor no modo scroll para atualização dinâmica de páginas e contagem automática de leitura.

🔴Fullscreen API — Suporte à alternância para modo tela cheia.


📁 Estrutura de Pastas

spider-reader/
├── index.html              # Estrutura principal da página HTML
├── style.css               # Estilos globais, temas e responsividade
├── script.js               # Lógica principal, leitor, modais e gamificação
├── dados.js                # Banco de dados local com o catálogo de HQs e capítulos
└── assets/                 # Recurso de mídia do projeto
    ├── capas/              # Imagens de capa das HQs e mangás
    ├── decoracao/          # Elementos visuais e ícones da interface (teias, personagens)
    ├── molduras/           # Molduras em PNG dos níveis de leitura para o avatar
    └── hqs/                # Diretórios organizados contendo as páginas dos quadrinhos
        ├── spider-gwen/
        │   ├── cap-1/
        │   │   ├── pagina1.jpg
        │   │   └── ...
        │   └── ...
        └── ...



✨ Funcionalidades Principais

Lista simplificada com checkmarks do que o projeto faz (ex.: leitura offline via localStorage, sistema de XP/níveis, alternância de temas claro/escuro, modos de leitura).

⌨️ Atalhos de Teclado

Uma tabela ou lista curta informando os atalhos disponíveis no leitor (ex.: Seta Direita / Esquerda para passar páginas, F para tela cheia, Esc para fechar).

📱 Responsividade e Suporte a Dispositivos

Uma breve nota confirmando a adaptação do layout para dispositivos móveis, tablets e desktops.

📄 Licença

Indicação do tipo de licença do projeto (ex.: MIT License), informando se o código é livre para uso e modificação.

👤 Autor / Contato

Seus links de contato (LinkedIn, GitHub ou e-mail) para que recrutadores ou outros desenvolvedores possam te encontrar.
