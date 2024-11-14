export interface Opcao {
  texto: string; // Texto da opção
  explicacao: string; // Explicação da opção
}

export interface Pergunta {
  pergunta: string; // Texto da pergunta
  opcoes: Opcao[]; // Array de opções, cada uma contendo texto e explicação
  respostaCorreta: string | string[]; // Resposta correta (pode ser uma string ou um array de strings)
  dominio: string; // Domínio da pergunta
  dominioKey: string; // Domínio da pergunta
  tipo: string; // Tipo da pergunta (ex: single, multiple)
  fonteSimulado: string; // Tipo da pergunta (ex: single, multiple)
}
