import express from 'express';
import {ChatOpenAI} from "@langchain/openai";
const app = express();
const port = 3000;
app.use(express.json());
import cors from "cors";

app.use(cors());

app.get('/joke', async (req, res) => {
    try {
        const model = new ChatOpenAI({
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
            azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
        });

        const timeout = 10000;
        const jokePromise = model.invoke("Tell me a Javascript joke!");

        const joke = await Promise.race([jokePromise, new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), timeout))]);

        console.log(joke.content);

        res.json({ joke: joke.content });
    } catch (error) {
        console.error('Error while fetching the joke:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
let messages = [
    ["system", "You're an experienced pokemon designer, " +
    "and turns prompts into new pokemon with an unique name, " +
    "one or two of the eighteen pokemon types, " +
    "one unique signature ability and one existing ability, " +
    "an unique signature move (this move has a base power, amount of power points and a type) " +
    "and a description. "]
]
app.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        let engineeredPrompt = prompt;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required in the request body' });
        }



        const model = new ChatOpenAI({
            temperature: 1,
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
            azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
            maxRetries: 10,
        });

        const timeout = 10000;


        messages.push(
            ["human", engineeredPrompt]
        )
        console.log(messages)
        console.log(engineeredPrompt)

        const promptPromise = await model.invoke(messages);

        messages.push(
            ["ai", promptPromise.content]
        )

        const response = await Promise.race([promptPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), timeout))]);

        console.log(response.content);

        res.json({ response: response.content });
    } catch (error) {
        console.error('Error while fetching the prompt:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



import LlamaAI from 'llamaai';

const apiToken = "LL-diyVTtEPfLgUEGLmDRgVPdtzY3hJjunwnNcQIBUPrXFjLbNv2ltWAI6cMopIDTsr";
const llamaAPI = new LlamaAI(apiToken);
app.get('/llama', async (req, res) => {
    const apiRequestJson = {
        "model": "llama-70b-chat",
        "messages": [
            {"role": "user", "content": "What is the weather like in Boston?"},
        ],
        "functions": [
            {
                "name": "get_current_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA",
                        },
                        "days": {
                            "type": "number",
                            "description": "for how many days ahead you wants the forecast",
                        },
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                },
                "required": ["location", "days"],
            }
        ],
        "stream": false,
        "function_call": "get_current_weather",
    };

    llamaAPI.run(apiRequestJson)
        .then(response => {
            output = response.json()['choices'][0]['message']
        })
        .catch(error => {
            console.error("Error fetching request", error)
        });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});