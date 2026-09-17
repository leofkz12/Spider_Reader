// ==========================================
// BANCO DE DADOS DAS HQS / MANGÁS
// ==========================================
// "lancamento" e "resumo" são só placeholders — troque pelo texto real
// de cada história. Eles aparecem na ficha que abre ao clicar em "Ver mais".
// "tags" são os gêneros da história — usados no filtro múltiplo e nas
// recomendações. Pode colocar quantas quiser, em minúsculo.

const hqs = {
  "spider-gwen": {
    titulo: "Spider-Gwen: Shadow Clones",
    capa: "assets/capas/spider-gwen.jpg",
    genero: "hq",
    tags: ["ação", "aventura", "ficção científica"],
    lancamento: "01/03/2023", // <-- troque pela data real
    resumo: "A nova aventura da Spider-Gwen, a Mulher-Aranha da Terra-65, coloca a heroína contra um exército de clones de Gwen baseados nos maiores vilões do Homem-Aranha.Colocará a Spider-Gwen contra seus clones a Gwen Doutor Octopus, a Gwen-Areia e a Gwen Abutre. ", // <-- troque pelo resumo real
    capitulos: {
      "cap-1": 31, // <-- troque pelo número real de páginas desse capítulo
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20
    }
  },
  "frieren": {
    titulo: "Sousou no Frieren",
    capa: "assets/capas/frieren.jpg",
    genero: "manga",
    tags: ["drama", "fantasia", "aventura"],
    lancamento: "28/04/2020",
    resumo: "A história acompanha a maga elfa Frieren, que, após uma década de jornada para derrotar o Rei Demônio junto ao herói humano Himmel, retorna à vida comum.  Devido à sua longa vida élfica, Frieren não compreende a efemeridade da vida humana e testemunha seus companheiros envelhecerem e morrerem. Anos após a morte de Himmel, ela embarca em uma nova jornada com sua aprendiz humana, Fern, e posteriormente com o guerreiro Stark.",
    capitulos: {
      "cap-1": 1
    }
  },
  "miles-morales": {
    titulo: "Miles-Morales Absolute Carnage",
    capa: "assets/capas/miles-morales.jpg",
    genero: "hq",
    tags: ["ação", "terror", "aventura"],
    lancamento: "28/08/2019",
    resumo: "A história foca no Miles Morales enfrentando o Escorpião (Mac Gargan), que possui o simbionte Venom.  Quando uma horda de acólitos do Carnificina ataca Nova York, Miles é infectado pelo simbionte vermelho e possuído, transformando-se temporariamente em um vilão. ",
    capitulos: {
      "cap-1": 21,
      "cap-2": 22,
      "cap-3": 21
      
    }
  },
  "solo-leveling": {
    titulo: "Solo-Leveling",
    capa: "assets/capas/sololeveling.jpg",
    genero: "manga",
    tags: ["ação", "fantasia", "aventura"],
    lancamento: "12/07/2016",
    resumo: "Solo Leveling é uma obra que se passa em um mundo onde portais conectam a Terra a dimensões repletas de monstros, obrigando humanos com poderes mágicos, chamados Caçadores, a protegê-la.  A história acompanha Sung Jinwoo, conhecido como o Caçador de Rank E mais fraco da humanidade, que, após sobreviver milagrosamente a uma masmorra dupla quase fatal, torna-se o único indivíduo com acesso a um misterioso Sistema que permite que ele suba de nível e se torne o ser mais poderoso.",
    capitulos: {
      "cap-1": 1,
      "cap-2": 1
    }
  },
  "overlord": {
    titulo: "Overlord",
    capa: "assets/capas/overlord.jpg",
    genero: "manga",
    tags: ["ação", "fantasia", "isekai"],
    lancamento: "20/01/2021",
    resumo: "A história acompanha Momonga, um jogador dedicado do MMORPG Yggdrasil, que decide não deslogar quando os servidores são encerrados.  Ele se vê transportado para um novo mundo e transformado em seu avatar de esqueleto, o poderoso feiticeiro Ainz Ooal Gown, enquanto seus NPCs ganham vida própria e lealdade absoluta. ",
    capitulos: {
      "cap-1": 1,
      "cap-2": 1,
      "cap-3": 1,
      "cap-4": 1,
      "cap-5": 1
    }
  },
  "spider-man-2099": {
    titulo: "Spider-Man 2099 Exodus",
    capa: "assets/capas/spider-man2099.jpg",
    genero: "hq",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "04/05/2022",
    resumo: "Miguel O'Hara (Homem-Aranha 2099) retorna ao seu presente para investigar o evento cósmico e proteger o novo paraíso da ameaçadora Cabal, liderada por Norman Osborn.  A série apresenta versões futuras de personagens como Soldado Invernal 13, Loki, Motoqueiro Fantasma e uma nova formação de X-Men 2099, além de introduzir os Novos Vingadores de 2099 liderados pelo Cavaleiro da Lua.",
    capitulos: {
      "cap-1": 31,
      "cap-2": 29,
      "cap-3": 23,
      "cap-4": 1,
      "cap-5": 1
    }
  },
  "spider-gwen-ghost": {
    titulo: "Spider-Gwen: The Ghost-Spider",
    capa: "assets/capas/spider-gwen-ghost.jpg",
    genero: "hq",
    tags: ["ação", "aventura", "romance"],
    lancamento: "09/10/2020",
    resumo: "Após os eventos das grandes sagas do Aranhaverso e da revelação de sua identidade secreta na sua dimensão natal (Terra-65), Gwen Stacy tenta equilibrar sua vida de estudante e heroína. Para poder ter uma vida universitária normal e continuar combatendo o crime, Gwen decide se matricular na universidade da Terra-616 (o universo principal da Marvel, onde vive o Peter Parker original). No entanto, transitar entre dois universos traz consequências perigosas, ameaças interdimensionais inesperadas e novos vilões que tentam explorar os portais que ela utiliza.",
    capitulos: {
      "cap-1": 31,
      "cap-2": 27,
      "cap-3": 1,
      "cap-4": 1,
      "cap-5": 1
    }
  },
  "gwenverse": {
    titulo: "Spider-Gwen: Gwenverse",
    capa: "assets/capas/gwen-verse.jpg",
    genero: "hq",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "09/02/2022",
    resumo: "A trama se inicia quando Gwen Stacy, a Aranha-Fantasma, é puxada para o fluxo do tempo por uma artista louca que planeja se tornar imortal.  Gwen acaba roubando o ritual, espalhando versões alternativas de si mesma pelo passado da Terra-65. Ela deve viajar pelo tempo, reunir essas variantes (como uma Gwen com armadura de ferro ou uma Gwen-Lobinho) e corrigir a história contra um estado policial distópico liderado pelo pai que a caça em um mech gigante.",
    capitulos: {
      "cap-1": 31,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20
    }
  },
  "sp-giant-size": {
    titulo: "Spider-Gwen Giant-Size",
    capa: "assets/capas/sg-giant.jpg",
    genero: "hq",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "06/03/2024",
    resumo: "Ameaça Principal: Gwen enfrenta uma versão mortal do Doutor Polvo (Doc Ock), que ameaça destruir a estabilidade de seu universo e colocar em risco as pessoas mais próximas a ela.Conflito Multiversal: A HQ explora as consequências do desgaste multiversal em sua vida, testando seus limites como heroína enquanto lida com as repercussões de suas viagens entre dimensões.",
    capitulos: {
      "cap-1": 21,
  
    }
  },
  "spider-noir": {
    titulo: "Spider-Noir",
    capa: "assets/capas/spider-noir.jpg",
    genero: "hq",
    tags: ["ação", "ficção científica", "crime"],
    lancamento: "28/10/2020",
    resumo: "Na Nova York dos anos 1930, o Homem-Aranha Noir é arrastado para uma investigação internacional após um assassinato no Splash Club. Caçando pistas sobre um antigo artefato cicládico, Peter Parker viaja pelo mundo para impedir que nazistas e uma perigosa conspiração mística obtenham um poder capaz de mudar o rumo da história.",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20
  
    }
  },
  "one-piece": {
    titulo: "One Piece",
    capa: "assets/capas/one-piece.jpg",
    genero: "manga",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "22/07/1997",
    resumo: "Monkey D. Luffy parte em uma grande aventura pelos mares em busca do lendário tesouro One Piece. Ao lado de sua tripulação, ele enfrenta piratas, governos e inimigos poderosos enquanto busca realizar seu sonho de se tornar o Rei dos Piratas.",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20

    }
  },
  "kimetsu": {
    titulo: "Kimetsu No Yaiba",
    capa: "assets/capas/kimetsu.jpg",
    genero: "manga",
    tags: ["ação", "ficção científica", "aventura", "crime"],
    lancamento: "15/02/2016",
    resumo: "A história se passa no Japão da Era Taishō (1912-1926) e acompanha Tanjirō Kamado, um jovem vendedor de carvão que, após descobrir que sua família foi massacrada por demônios, embarca em uma jornada para se tornar um caçador de demônios.  Seu objetivo principal é encontrar uma cura para sua irmã mais nova, Nezuko, a única sobrevivente do ataque, que foi transformada em um oni mas ainda mantém traços humanos.",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20

    }
  },
  "dragon-ball": {
    titulo: "Dragon Ball Super (Super Hero) ",
    capa: "assets/capas/dragon-ball.jpg",
    genero: "manga",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "21/12/2022",
    resumo: "Após os acontecimentos do arco de Granolah, Goten e Trunks assumem o papel de heróis e passam a proteger sua cidade. Enquanto isso, uma nova ameaça surge com a Red Ribbon Army e os androides Gamma 1 e Gamma 2. A história então conduz aos acontecimentos de Dragon Ball Super: Super Hero, culminando no confronto contra o poderoso Cell Max e no despertar de novas formas de Gohan e Piccolo. .",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20

    }
  },
  "my-hero-academia": {
    titulo: "My Hero Academia ",
    capa: "assets/capas/my-hero-academia.jpg",
    genero: "manga",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "07/07/2014",
    resumo: "Em um mundo onde a maioria das pessoas possui superpoderes, Izuku Midoriya nasceu sem nenhuma habilidade especial, mas nunca abandonou o sonho de se tornar um herói. Após conhecer seu maior ídolo, ele recebe uma oportunidade que pode mudar sua vida e passa a estudar na prestigiada U.A., enfrentando desafios, vilões e descobrindo o verdadeiro significado de ser um herói. .",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20

    }
  },
  "venom-nf": {
    titulo: "Venom (2021)",
    capa: "assets/capas/venom-nf.jpg",
    genero: "hq",
    tags: ["ação", "ficção científica", "crime"],
    lancamento: "01/10/2021",
    resumo: "Eddie Brock e seu filho, Dylan, enfrentam uma nova e perigosa fase na história do simbionte Venom. Enquanto a relação entre Dylan e o simbionte se transforma, Eddie é levado a uma realidade muito maior e misteriosa, envolvendo a complexa sociedade dos simbiontes e ameaças que vão muito além da Terra.",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20

    }
  },
  "iron-man": {
    titulo: "Tony Stark: Iron Man ",
    capa: "assets/capas/iron-man.jpg",
    genero: "manga",
    tags: ["ação", "ficção científica", "aventura"],
    lancamento: "01/08/2018",
    resumo: "Tony Stark retorna com uma nova geração de tecnologias e enfrenta os desafios de transformar suas ideias em realidade. Ao criar o eScape, um mundo virtual revolucionário, Stark acaba descobrindo que sua própria tecnologia pode ser usada contra ele, colocando sua empresa, sua identidade e seu futuro em risco.",
    capitulos: {
      "cap-1": 25,
      "cap-2": 20,
      "cap-3": 20,
      "cap-4": 20,
      "cap-5": 20

    }
  }

  // Adicione novas HQs/mangás aqui embaixo, seguindo o mesmo modelo.
  // Ex: "nome-da-hq": { titulo: "...", capa: "...", genero: "hq"|"manga",
  //   tags: ["ação","terror"], lancamento: "2024", resumo: "...",
  //   capitulos: { "cap-1": 25, "cap-2": 30 } }
};