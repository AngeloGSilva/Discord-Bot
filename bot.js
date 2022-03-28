// Require the necessary for require and import to work in the same file
import { createRequire } from "module";
const require = createRequire(import.meta.url);

//importar variaveis do ficheiro (./config.json)
const { token } = require('./config.json');
const { keyOpenAi } = require('./config.json');
const { IdChannel } = require('./config.json');


// Require the necessary discord.js classes
const { SelectMenuOption } = require('@discordjs/builders');
const Discord = require('discord.js');

// Require the necessary OpenAI classes
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: keyOpenAi,
});
const openai = new OpenAIApi(configuration);

// Create a new client instance
const client = new Discord.Client({ 
    intents:[
        "GUILDS",
        "GUILD_MESSAGES",
    ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
    client.channels.cache.get(IdChannel).send('\n**ON**\nEntrei');   //mensagem de entrada
});

// Login to Discord with your client's token
client.login(token);

//funcao OpenAi classification
const classificar = async (classifica) =>{
const response = await openai.createClassification({
    search_model: "ada",
    model: "curie",
    examples: [
      ["A happy moment", "Happy"],
      ["I am sad.", "Sad"],
      ["I am feeling awesome", "Happy"]
    ],
    query: classifica,
    labels: ["Happy", "Sad", "Meh"],
  });
  console.log(response.data.label);
  return response.data.label;
}

//funcao OpenAi completion
const completar = async (conteudo) =>{
    const response = await openai.createCompletion("text-davinci-002", {
        prompt: conteudo,
        temperature: 0.8,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
    //console.log(response.data.choices[0].text);
    return response.data;
}

//evento de mensagem criada
client.on('messageCreate', async (message) =>{
    if (message.channel.id == IdChannel) {
        if(message.content[0]==='!'){   //caso seja ! completa "tem conversa"
            console.log(message.content);
            const resposta = completar(message.content);
            console.log((await resposta).choices[0].text);
            message.reply((await resposta).choices[0].text);
        }else if(message.content[0]==='?'){ //caso seja ? classifica a mensagem
            console.log(message.content);
            const resposta = classificar(message.content);
            //console.log((await resposta));
            message.reply((await resposta));
        }else if(message.content === 'leave discord'){  //mensagem para desligar bot
            client.channels.cache.get(IdChannel).send('\n**OFF**\nBem parece que tenho de ir');  //mensagem de saida
            setTimeout(() => {
            console.log('Terminar');
            process.exit(0), 1000})
        }
    }
})

// Tratar do ctrl + c
process.on('SIGINT', function(){
    client.channels.cache.get(IdChannel).send('\n**OFF**\nBem parece que tenho de ir');  //mensagem de saida
    setTimeout(() => {  //equivalente do sleep()
    console.log('Terminar');
    process.exit(0), 1000})
})

