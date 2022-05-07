var fullList = true;

var activityList = [];

activityList[0] = 'Postar foto com as #SemanaDeBoasVindas #QuímicaUFPR';
activityList[1] = 'Doar sangue';
activityList[2] = null;
activityList[3] = null;
activityList[4] = null;
activityList[4] = 'Contar os hidrantes e extintores dentro do prédio da PA';
activityList[5] = 'Vídeo cantando parabéns no RU';
activityList[6] = 'Ir até a pré-história';
activityList[7] = 'Encontrar a biblioteca do biológicas';
activityList[8] = 'Tirar foto com a ferradura do PET EQ';
activityList[9] =  'Visitar o FIBRA e tirar foto com algum experimento';
activityList[10] =  'Fazer o cadastro na biblioteca';
activityList[11] =  'Encontrar a CASA 3';
activityList[12] =  'Ir no auditório Gralha Azul';
activityList[13] =  'Encontrar as esferas do dragão no Sociais Aplicadas';
activityList[14] =  'Tirar foto da entrada ou fazer trilha da floresta';
activityList[15] =  'Achar o prédio da UFPR no MusA';
activityList[16] =  'Contar as janelas do prédio Rebouças';
activityList[17] =  'Revezamento de vídeo nas rampas do prédio D. Pedro I';
activityList[18] =  'Tirar uma selfie no intercampi';
activityList[19] =  'Encontrar o CA de Música';
activityList[20] =  'Fazer embaixadinhas no campo de futebol do SEPT';
activityList[21] =  'Medir a passarela entre o hall do ADM e a biblioteca com palito de fósforo';
activityList[22] =  'Tirar foto com a formanda Maria D. Barbosa';
activityList[23] = null;
activityList[24] =  'Contar os bebedouros no Espinha de Peixe';
activityList[25] =  'Abraçar pessoas na fila do RU';
activityList[26] =  null
activityList[27] =  'Raspar o cabelo';
activityList[28] = 'Doar roupas';
activityList[29] = 'Doar ração';
activityList[30] = 'Carimbo de um professor de cada área';
activityList[31] = 'Assinatura de pós graduandos';

var descriptions = [];

descriptions[0] = 'Poste suas fotos da gincana em suas redes sociais. Cada foto enviada com as hashtags dá a sua equipe 25 pontos!';
descriptions[1] = 'Envie uma foto do comprovante e do momento da doação, se possível. Podem ser levadas pessoas de fora da equipe.';
descriptions[2] = null;
descriptions[3] = null;
descriptions[4] = 'Vá até o prédio PA e conte o número de hidrantes e extintores, em todos os andares.';
descriptions[5] = 'Vídeo cantando parabéns no RU, mesmo que não seja aniversário de ninguém na mesa.';
descriptions[6] = 'Foto no mural da pré-história.';
descriptions[7] = 'Foto na biblioteca do biológicas.';
descriptions[8] = 'Foto com a ferradura do PET de Engenharia Química.';
descriptions[9] = 'Foto com um experimento no FIBRA.';
descriptions[10] = 'Foto na frente da biblioteca de ciência e tecnologia após ou durante a realização do cadastro.';
descriptions[11] = 'Foto na frente da CASA 3.';
descriptions[12] = 'Foto na frente do auditório Gralha Azul.';
descriptions[13] = 'Foto com cada uma das 7 Esferas do Dragão.';
descriptions[14] = 'Foto na entrada da trilha, para alunos do noturno, e fazendo a trilha, para alunos do diurno.';
descriptions[15] = 'Foto com o prédio histórico da UFPR no MusA.';
descriptions[16] = 'Número de janelas do prédio do Rebouças.';
descriptions[17] = 'Vídeo subindo ou descendo as rampas do prédio D. Pedro I, revezando o celular entre os componentes da equipe.';
descriptions[18] = 'Selfie no intercampi.';
descriptions[19] = 'Foto em frente ao Centro Acadêmico de Música.';
descriptions[20] = 'Foto de um componente da equipe fazendo embaixadinhas no campo de futebol do SEPT.';
descriptions[21] = 'Foto medindo a passarela entre o hall do prédio de ADM e a biblioteca com palitos de fósforo de 5cm e o número de palitos.';
descriptions[22] = 'Foto com a formanda Maria D. Barbosa.';
descriptions[24] = 'Contar o número de bebedouros dentro do Espinha de Peixe, do prédio de administração até o final, no partamento de geologia.';
descriptions[25] = 'Cada foto abraçando uma pessoa vale 30 pontos, acumulando no máximo 300 pontos para a atividade.';
descriptions[26] = null;
descriptions[27] = 'Um integrante da equipe deve raspar o cabelo.';
descriptions[28] = 'Doação de peças de roupa, que devem ser feitas no Centro Acadêmico para contabilização dos pontos.';
descriptions[29] = 'Doação de ração para cachorros até o dia da entrega na ONG. As doações devem ser feitas no Centro Acadêmico para contabilização dos pontos.';
descriptions[30] = 'Carimbo de um professor de cada uma das 5 áreas da química. Mais informações no formulário de envio entregue aos padrinhos.'
descriptions[31] = 'Assinatura pós graduandos, sendo uma por grupo de pesquisa. Mais informações no formulário de envio entregue aos padrinhos.'

const points = [25,700,null,null,200,400,100,300,200,300,100,100,100,100,100,300,500,500,200,300,300,500,300,null,400,30,null,300,50,25,100,50];

function getPoints(i, text) {

  if (fullList != true) {
    // Activities to hand later
    activityList[28] = null;
    activityList[29] = null;
    activityList[30] = null;
    activityList[31] = null;
    // Descriptions
    descriptions[28] = null;
    descriptions[29] = null;
    descriptions[30] = null;
    descriptions[31] = null;
  }


  if (text) {
    const desc = [];
    desc[0] = '/foto';
    desc[1] = '/pessoa';
    desc[13] = '/esfera';
    desc[25] = '/abraço';
    desc[28] = '/peça';
    desc[29] = '/kg';
    desc[30] = '/carimbo';
    desc[31] = '/assinatura';

    return points[i] + (desc[i] ? desc[i] : '');
  }
  else {
    return points[i];
  }
}

const onePicMode = [3,5,7,8,9,10,11,12,13,15,16,17,19,20,21,22,23,25,28];
const somePicsMode = [2,14,26];
const videoMode = [6,18];
const urlMode = [1];
const needsInput = [5,17,22,25];
const nonWebsite = [28,29,30,31]
const needsVeteran = [5,8,13,25];
