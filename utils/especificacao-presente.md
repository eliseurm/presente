==================================================
ESPECIFICAÇÃO TÉCNICA PARA IA DE DESENVOLVIMENTO
==================================================

### 1. Nomenclatura e Entidades-Chave

* **Evento:** A entidade principal do evento de presente.
* **EventoPessoa:** Entidade de ligação (muitos-para-muitos) entre Pessoa e Evento. Contém o 'status' da pessoa no evento e o 'nome_magicNumber'.
* **Pessoa:** O participante que receberá/escolherá um presente.
* **Produto:** O item físico que pode ser escolhido.
* **EscolhaHistorico:** Registro da escolha de um presente por uma pessoa em um evento.


### 2. Módulo: Tela de Gerenciamento de Eventos (Eventos)

#### 2.1. Funcionalidade de Controle do Evento

* **Localização:** Tela de Edição de Evento, Aba 'Geral'.
* **Ação:** Deve existir um botão de toggle rotulado "Iniciar/Parar Evento".
* **Lógica de Iniciar:**
    * Iterar sobre todas as entidades 'EventoPessoa' ligadas ao 'Evento' onde 'EventoPessoa.status' for **ATIVO**.
    * **Geração de Número Mágico:** Para cada 'EventoPessoa' ativo, deve ser gerado e persistido um 'nome_magicNumber'.
    * **Formato do Número Mágico:** 'primeiro_nome_da_pessoa + "_" + magic_code_8_caracteres_alfanumericos' (Ex: Maria_A1B2C3D4).
* **Lógica de Parar:**
    * Iterar sobre todas as entidades 'EventoPessoa' ligadas ao 'Evento' que **possuem um 'nome_magicNumber' definido**.
    * **Atualização de Status:** Para estas pessoas, o 'EventoPessoa.status' deve ser alterado para **PAUSADO**.

#### 2.2. Funcionalidade de Acesso Rápido (Grid de Pessoas)

* **Pré-condição:** Funcionalidade visível apenas para 'EventoPessoa' que tenha 'nome_magicNumber' definido.
* **Botão 1 (Visualização):** Abre uma nova aba/janela para a rota de escolha do presente: `/presente/nome_magicNumber`.
* **Botão 2 (Cópia):** Copia o link completo do presente para a área de transferência: '[URL_BASE]/presente/nome_magicNumber'.

#### 2.3. Funcionalidade de Edição de Pessoa

* **Localização:** Popup de Edição da grid de 'Pessoa' (dentro do contexto do Evento).
* **Aba 1: Geral:** Exibe informações básicas de 'Pessoa' e o 'EventoPessoa.status'.
* **Aba 2: Opção Escolhida (Entidade 'EscolhaHistorico'):**
    * Exibe a **última** escolha registrada para esta pessoa neste evento.
    * **Dados a exibir:** 'Produto' escolhido (nome, imagem), 'Tamanho', 'Cor' e 'data_hora_escolha'.
* **Aba 3: Histórico de Escolha (Entidade 'EscolhaHistorico'):**
    * Apresenta uma grid (tabela) com **todas** as escolhas feitas **antes** da última.
    * **Dados a exibir:** 'Produto', 'Tamanho', 'Cor' e 'data_hora_escolha'.


### 3. Módulo: Tela de Escolha de Presente ('/presente/nome_magicNumber')

#### 3.1. Funcionalidade de Acesso e Visualização

* **Validação de Acesso:** A tela deve ser acessada **apenas** através de uma validação do 'nome_magicNumber' na rota.
* **Filtro de Produtos:** A página deve exibir **apenas** os 'Produtos' que estão **cadastrados e associados ao 'Evento'** que gerou o 'nome_nome_magicNumber'.
* **Layout:** Seguir o padrão definido no 'presente-escolha.componente.html', exibindo cada produto com suas fotos, permitindo a seleção de 'Tamanho' e 'Cor'.

#### 3.2. Funcionalidade de Resumo e Bloqueio

* **Comportamento Padrão (Após Primeira Escolha):** Uma vez que a pessoa tenha feito uma escolha, ao acessar a página novamente, ela deve ser direcionada para uma **"Página de Resumo da Escolha"**.
* **Página de Resumo:** Deve mostrar os detalhes da última (maior EventoEscolha.dataEscolha) data registrada.
* **Botão "Refazer Escolha":** Este botão deve ser visível se a **'data_prevista' do 'Evento' não tiver sido ultrapassada**.
* **Bloqueio por Data:**
    * Se a data e horário atuais for **posterior** à 'data_prevista' do 'Evento': o botão "Refazer Escolha" deve ser **desabilitado/ocultado**.
* **Comportamento Sem Escolha (Após Expiração):** Se a 'data_prevista' tiver sido ultrapassada e **nenhuma escolha** tiver sido feita, a página deve exibir uma mensagem clara: "O tempo para escolha expirou. Nenhuma escolha foi registrada."

#### 3.3. Log de Alterações

* **Registro de Transação:** Toda vez que um participante confirmar uma escolha (mesmo que seja uma alteração), um **novo registro** deve ser criado na tabela **'EscolhaHistorico'**, com o 'Produto', 'Tamanho', 'Cor' e a 'data_hora_escolha'.
* **Nunca Apagar:** Nenhuma entrada na 'EscolhaHistorico' deve ser excluída. A última entrada é a escolha válida (Regra 2.3 - Aba 2).